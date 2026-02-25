"use server";

import { createClient } from "@supabase/supabase-js";
import { Agendamento } from "../types/agendamento";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Busca a agenda de UM barbeiro específico para o dia de HOJE
 */
export async function buscarAgendaHoje(barbeariaId: string, usuarioId: string) {
  // Pega a data de hoje no formato YYYY-MM-DD
  const hoje = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("agendamentos")
    .select(
      `
      *,
      clientes ( nome ) 
    `,
    ) // Faz um "JOIN" automático para trazer o nome do cliente!
    .eq("barbearia_id", barbeariaId)
    .eq("usuario_id", usuarioId) // O FILTRO MÁGICO DO USUÁRIO!
    .gte("data_hora", `${hoje}T00:00:00.000-03:00`) // A partir de 00h de hoje
    .lte("data_hora", `${hoje}T23:59:59.999-03:00`) // Até as 23h59 de hoje
    .order("data_hora", { ascending: true }); // Ordem cronológica

  if (error) {
    console.error("Erro na agenda:", error.message);
    return [];
  }

  return data as Agendamento[];
}

/**
 * Atualiza os dados ou o status (Atendido/Cancelado) de um agendamento
 */
export async function atualizarAgendamento(
  id: string,
  servico: string,
  valor: number,
  status: "agendado" | "concluido" | "cancelado",
  cliente_id: string,
  data_hora: string,
) {
  const { data, error } = await supabase
    .from("agendamentos")
    .update({ servico, valor, status, cliente_id, data_hora })
    .eq("id", id).select(`
      *,
      clientes ( nome )
    `); // Retornamos com o JOIN para o frontend já pegar o novo nome!

  if (error) throw new Error("Erro ao atualizar agenda.");
  return data[0] as Agendamento;
}

export async function buscarAgendaPorData(
  barbeariaId: string,
  usuarioId: string,
  data: string,
) {
  const { data: agenda, error } = await supabase
    .from("agendamentos")
    .select(`*, clientes ( nome )`)
    .eq("barbearia_id", barbeariaId)
    .eq("usuario_id", usuarioId)
    .gte("data_hora", `${data}T00:00:00.000Z`)
    .lte("data_hora", `${data}T23:59:59.999Z`)
    .order("data_hora", { ascending: true });

  if (error) {
    console.error("Erro ao buscar agenda por data:", error.message);
    return [];
  }
  return agenda as Agendamento[];
}

/**
 * Cria um NOVO agendamento no banco de dados.
 */
export async function cadastrarAgendamento(
  barbeariaId: string,
  usuarioId: string,
  clienteId: string,
  dataHora: string,
  servico: string,
  valor: number,
) {
  const { data, error } = await supabase
    .from("agendamentos")
    .insert([
      {
        barbearia_id: barbeariaId,
        usuario_id: usuarioId,
        cliente_id: clienteId,
        data_hora: dataHora,
        servico: servico,
        valor: valor,
        status: "agendado", // Todo novo agendamento nasce como 'agendado'
      },
    ])
    .select(`*, clientes ( nome )`); // Já traz o nome do cliente de volta!

  if (error) throw new Error("Erro ao criar agendamento.");
  return data[0] as Agendamento;
}
