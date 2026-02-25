export interface Cliente {
  id: string;
  codigo: number;
  barbearia_id: string;
  nome: string;
  telefone?: string;
  data_nascimento?: string;
  ultimo_corte?: string | null;
  proximo_agendamento?: string | null;
}
