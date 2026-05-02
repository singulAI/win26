import unittest

from app.models.integration import IntegrationMatchStatus
from reconciliation_service import (
    classify_matches_with_embedded_status,
    compare_matches_with_active_report,
    process_reconciliation_file,
)


class ReconciliationServiceTests(unittest.TestCase):
    def test_embedded_status_drives_charge_classification(self) -> None:
        supplier_csv = """Benefício\tSituação do Benefício\tNome
AAA1A11\tAtivo\tJoao
BBB2B22\tInadimplente\tMaria
CCC3C33\tInativo\tJose
""".encode("utf-8")

        processing = process_reconciliation_file("fornecedor.csv", supplier_csv)

        self.assertEqual(processing.total_registros, 3)
        self.assertEqual(processing.total_matches, 3)
        self.assertEqual(processing.total_divergencias, 0)

        total_matches, total_divergencias, total_encontrados = classify_matches_with_embedded_status(processing.matches)

        self.assertEqual((total_matches, total_divergencias, total_encontrados), (1, 2, 1))

        by_plate = {match["placa_normalizada"]: match for match in processing.matches}

        self.assertEqual(by_plate["AAA1A11"]["status_match"], IntegrationMatchStatus.encontrado)
        self.assertEqual(
            by_plate["AAA1A11"]["dados_interno"]["classificacao_analise"],
            "ativo_com_cobranca",
        )
        self.assertEqual(
            by_plate["AAA1A11"]["dados_interno"]["acao_cobranca"],
            "manter_cobranca_fornecedor",
        )

        self.assertEqual(by_plate["BBB2B22"]["status_match"], IntegrationMatchStatus.divergente)
        self.assertEqual(
            by_plate["BBB2B22"]["dados_interno"]["classificacao_analise"],
            "inadimplente_em_protecao_pos_pago",
        )
        self.assertEqual(
            by_plate["BBB2B22"]["dados_interno"]["acao_cobranca"],
            "postergar_cobranca_para_proximo_vencimento",
        )

        self.assertEqual(by_plate["CCC3C33"]["status_match"], IntegrationMatchStatus.divergente)
        self.assertEqual(
            by_plate["CCC3C33"]["dados_interno"]["classificacao_analise"],
            "inativo_sem_cobranca",
        )
        self.assertEqual(
            by_plate["CCC3C33"]["dados_interno"]["acao_cobranca"],
            "cessar_cobranca_fornecedor",
        )

    def test_compare_uses_identifier_priority_with_model_fallback(self) -> None:
        supplier_csv = """Modelo do Veículo,Nome
Mobi Like,Ana
""".encode("utf-8")
        base_csv = """Benefício,Situação do Benefício,Modelo do Veículo,Nome
ZZZ9999,Ativo,Mobi Like,Ana Diferente
""".encode("utf-8")

        processing = process_reconciliation_file("fornecedor.csv", supplier_csv)
        total_matches, total_divergencias, total_encontrados, total_base = compare_matches_with_active_report(
            processing.matches,
            "base.csv",
            base_csv,
        )

        self.assertEqual((total_matches, total_divergencias, total_encontrados, total_base), (1, 0, 1, 1))
        match = processing.matches[0]
        self.assertEqual(match["status_match"], IntegrationMatchStatus.encontrado)
        self.assertEqual(match["dados_interno"]["identificador_localizado"], "modelo_veiculo")
        self.assertEqual(match["dados_interno"]["classificacao_analise"], "ativo_com_cobranca")

    def test_compare_marks_duplicate_base_as_divergence(self) -> None:
        supplier_csv = """Benefício,Nome
AAA1A11,Joao
""".encode("utf-8")
        base_csv = """Benefício,Situação do Benefício,Nome
AAA1A11,Ativo,Joao
AAA1A11,Ativo,Joao Duplicado
""".encode("utf-8")

        processing = process_reconciliation_file("fornecedor.csv", supplier_csv)
        total_matches, total_divergencias, total_encontrados, total_base = compare_matches_with_active_report(
            processing.matches,
            "base.csv",
            base_csv,
        )

        self.assertEqual((total_matches, total_divergencias, total_encontrados, total_base), (0, 1, 0, 2))
        match = processing.matches[0]
        self.assertEqual(match["status_match"], IntegrationMatchStatus.divergente)
        self.assertEqual(match["dados_interno"]["classificacao_analise"], "ativo_duplicado_na_base")
        self.assertEqual(match["dados_interno"]["quantidade_correspondencias_base"], 2)

    def test_process_consolidates_recurrence_for_repeated_plate(self) -> None:
        supplier_csv = """Benefício\tSituação do Benefício\tNome
PPP4B98; QHT4J91\tAtivo\tCliente 1
PPP4B98\tAtivo\tCliente 1
""".encode("utf-8")

        processing = process_reconciliation_file("fornecedor.csv", supplier_csv)

        self.assertEqual(processing.total_registros, 2)
        by_plate = {match["placa_normalizada"]: match for match in processing.matches}
        self.assertIn("PPP4B98", by_plate)
        self.assertIn("QHT4J91", by_plate)
        self.assertEqual(by_plate["PPP4B98"]["dados_interno"]["quantidade_recorrencias"], 1)
        self.assertEqual(by_plate["PPP4B98"]["dados_interno"]["total_ocorrencias_arquivo"], 2)
        self.assertTrue(by_plate["PPP4B98"]["dados_interno"]["possui_recorrencia"])
        self.assertEqual(len(by_plate["PPP4B98"]["dados_interno"]["recorrencias"]), 1)


if __name__ == "__main__":
    unittest.main()