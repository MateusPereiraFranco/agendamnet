export interface Agendamento {
  id: string;
  barbearia_id: string;
  cliente_id: string;
  usuario_id: string;
  data_hora: string; // Formato ISO do banco de dados
  servico: string;
  valor: number;
  status: "agendado" | "concluido" | "cancelado";

  // Estas propriedades extras (com ?) servem para quando fizermos um "JOIN" no banco
  // e trouxermos o nome do cliente e do barbeiro junto com a agenda!
  clientes?: { nome: string };
  usuarios?: { nome: string };
}
