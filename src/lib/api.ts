const DEFAULT_API_BASE_URL = "https://api.grupowin.site/api";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || DEFAULT_API_BASE_URL;

type RequestOptions = RequestInit & {
  token?: string;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, headers, ...rest } = options;
  const isFormData = typeof FormData !== "undefined" && rest.body instanceof FormData;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...headers,
    },
  });

  if (!response.ok) {
    let message = `Erro ${response.status}`;

    try {
      const errorBody = await response.json();
      if (typeof errorBody?.detail === "string") {
        message = errorBody.detail;
      } else if (Array.isArray(errorBody?.detail)) {
        message = errorBody.detail
          .map((item: { msg?: string; loc?: Array<string | number> }) => {
            const field = Array.isArray(item?.loc) ? item.loc[item.loc.length - 1] : null;
            return field ? `${field}: ${item?.msg ?? "valor invalido"}` : item?.msg ?? "valor invalido";
          })
          .join("; ");
      }
    } catch {
      try {
        const text = await response.text();
        if (text) {
          message = text;
        }
      } catch {
        // noop
      }
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  role: string;
  nome: string;
}

export interface AuthUser {
  id: string;
  nome: string;
  email: string;
  role: string;
  last_login: string | null;
}

export interface ReconciliationSummary {
  por_fornecedor: Record<
    string,
    {
      reports: number;
      registros: number;
      matches: number;
      divergencias: number;
    }
  >;
  placas_duplicadas: number;
  timestamp: string | null;
}

export interface ReconciliationReport {
  id: number;
  fornecedor: string;
  periodo_ref: string;
  total_registros: number;
  total_matches: number;
  total_divergencias: number;
  conciliado: boolean;
  criado_em: string | null;
  atualizado_em: string | null;
}

export interface ReconciliationDivergence {
  id: number;
  placa_normalizada: string;
  status_match: string;
  dados_fornecedor: Record<string, unknown> | null;
  dados_interno: Record<string, unknown> | null;
  criado_em: string | null;
}

export interface ReconciliationUploadResponse {
  report_id: number;
  fornecedor: string;
  periodo_ref: string;
  total_registros: number;
  total_matches: number;
  total_divergencias: number;
  comparado_com_relatorio_base: boolean;
  total_registros_base: number | null;
}