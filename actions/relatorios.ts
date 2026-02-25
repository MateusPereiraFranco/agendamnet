"use server";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Busca todos os serviços CONCLUÍDOS em um intervalo de datas.
 * Pode filtrar por um barbeiro específico ou trazer de todos.
 */
export async function buscarFechamento(
  barbeariaId: string,
  dataInicio: string, // Ex: '2026-02-01'
  dataFim: string, // Ex: '2026-02-28'
  usuarioId: string, // Pode ser 'todos' ou o ID de um barbeiro
) {
  // Iniciamos a consulta base
  let query = supabase
    .from("agendamentos")
    .select(
      `
      id, data_hora, servico, valor, 
      usuarios ( nome ), 
      clientes ( nome )
    `,
    )
    .eq("barbearia_id", barbeariaId)
    .eq("status", "concluido") // REGRA DE OURO DO CAIXA: Só conta o que foi concluído!
    .gte("data_hora", `${dataInicio}T00:00:00.000-03:00`) // Do início do dia inicial
    .lte("data_hora", `${dataFim}T23:59:59.999-03:00`) // Até o último segundo do dia final
    .order("data_hora", { ascending: false }); // Do mais recente para o mais antigo

  // Se o usuário não escolheu 'todos', nós filtramos por quem ele escolheu
  if (usuarioId !== "todos") {
    query = query.eq("usuario_id", usuarioId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao gerar relatório:", error.message);
    throw new Error("Não foi possível buscar os dados do fechamento.");
  }

  return data;
}
