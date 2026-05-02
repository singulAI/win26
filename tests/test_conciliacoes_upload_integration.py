import unittest
from collections.abc import AsyncGenerator
from typing import Any

from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.auth.jwt import get_current_user
from app.database import get_db
from app.models.audit import AuditLog
from app.models.integration import IntegrationReport
from app.models.user import User, UserRole
from conciliacoes import router


class FakeAsyncSession:
    def __init__(self) -> None:
        self.report: IntegrationReport | None = None
        self.audit_logs: list[AuditLog] = []
        self.bulk_inserts: list[dict[str, Any]] = []
        self._next_report_id = 1

    def add(self, instance: Any) -> None:
        if isinstance(instance, IntegrationReport):
            self.report = instance
            return
        if isinstance(instance, AuditLog):
            self.audit_logs.append(instance)

    async def flush(self) -> None:
        if self.report is not None and self.report.id is None:
            self.report.id = self._next_report_id
            self._next_report_id += 1

    async def execute(self, statement: Any, params: Any = None) -> None:
        if params:
            self.bulk_inserts.extend(params)

    async def commit(self) -> None:
        return None

    async def refresh(self, instance: Any) -> None:
        return None

    async def close(self) -> None:
        return None


class ConciliacoesUploadIntegrationTests(unittest.TestCase):
    def setUp(self) -> None:
        self.app = FastAPI()
        self.app.include_router(router, prefix="/api")
        self.session = FakeAsyncSession()
        self.current_user = User(
            id=1,
            nome="Master",
            email="master@grupowin.site",
            hashed_password="hash",
            role=UserRole.master,
            ativo=True,
        )

        async def override_get_db() -> AsyncGenerator[FakeAsyncSession, None]:
            yield self.session

        async def override_get_current_user() -> User:
            return self.current_user

        self.app.dependency_overrides[get_db] = override_get_db
        self.app.dependency_overrides[get_current_user] = override_get_current_user
        self.client = TestClient(self.app)

    def tearDown(self) -> None:
        self.client.close()
        self.app.dependency_overrides.clear()

    def test_upload_uses_embedded_status_and_persists_matches(self) -> None:
        supplier_csv = """Benefício\tSituação do Benefício\tNome
AAA1A11\tAtivo\tJoao
BBB2B22\tInadimplente\tMaria
AAA1A11\tAtivo\tJoao
"""

        response = self.client.post(
            "/api/admin/conciliacoes/upload",
            data={
                "fornecedor": "mais_vantagens",
                "periodo_ref": "2026-05-01",
            },
            files={
                "arquivo": ("fornecedor.csv", supplier_csv.encode("utf-8"), "text/csv"),
            },
        )

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["fornecedor"], "mais_vantagens")
        self.assertEqual(payload["total_registros"], 2)
        self.assertEqual(payload["total_matches"], 1)
        self.assertEqual(payload["total_divergencias"], 1)
        self.assertFalse(payload["comparado_com_relatorio_base"])
        self.assertEqual(payload["total_registros_base"], None)
        self.assertEqual(payload["total_recorrencias"], 1)

        self.assertIsNotNone(self.session.report)
        self.assertEqual(self.session.report.total_registros, 2)
        self.assertEqual(self.session.report.total_matches, 1)
        self.assertEqual(self.session.report.total_divergencias, 1)
        self.assertEqual(len(self.session.bulk_inserts), 2)

        by_plate = {item["placa_normalizada"]: item for item in self.session.bulk_inserts}
        self.assertEqual(by_plate["AAA1A11"]["status_match"], "encontrado")
        self.assertEqual(
            by_plate["AAA1A11"]["dados_interno"]["classificacao_analise"],
            "ativo_com_cobranca",
        )
        self.assertEqual(
            by_plate["BBB2B22"]["dados_interno"]["classificacao_analise"],
            "inadimplente_em_protecao_pos_pago",
        )
        self.assertEqual(
            by_plate["AAA1A11"]["dados_interno"]["quantidade_recorrencias"],
            1,
        )
        self.assertEqual(len(self.session.audit_logs), 1)
        self.assertEqual(self.session.audit_logs[0].dados_depois["comparado_com_relatorio_base"], False)

    def test_upload_prefers_base_report_when_sent(self) -> None:
        supplier_csv = """Benefício,Situação do Benefício,Nome
AAA1A11,Ativo,Joao
BBB2B22,Ativo,Maria
"""
        base_csv = """Benefício,Situação do Benefício,Nome
AAA1A11,Ativo,Joao
BBB2B22,Inativo,Maria
"""

        response = self.client.post(
            "/api/admin/conciliacoes/upload",
            data={
                "fornecedor": "riskin",
                "periodo_ref": "2026-05-01",
            },
            files={
                "arquivo": ("fornecedor.csv", supplier_csv.encode("utf-8"), "text/csv"),
                "arquivo_base_ativos": ("base.csv", base_csv.encode("utf-8"), "text/csv"),
            },
        )

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertTrue(payload["comparado_com_relatorio_base"])
        self.assertEqual(payload["total_registros_base"], 2)
        self.assertEqual(payload["total_matches"], 1)
        self.assertEqual(payload["total_divergencias"], 1)

        by_plate = {item["placa_normalizada"]: item for item in self.session.bulk_inserts}
        self.assertEqual(by_plate["AAA1A11"]["status_match"], "encontrado")
        self.assertEqual(by_plate["BBB2B22"]["status_match"], "divergente")
        self.assertEqual(
            by_plate["BBB2B22"]["dados_interno"]["origem_comparacao"],
            "relatorio_veiculos_ativos",
        )
        self.assertEqual(
            by_plate["BBB2B22"]["dados_interno"]["classificacao_analise"],
            "inativo_sem_cobranca",
        )


if __name__ == "__main__":
    unittest.main()