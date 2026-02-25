export interface Usuario {
  id: string;
  barbearia_id: string;
  nome: string;
  email: string;
  telefone?: string;
  funcao: "MASTER" | "ADMIN" | "FUNCIONARIO";
  ativo: boolean;
}
