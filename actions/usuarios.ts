"use server";

import { createClient } from "@supabase/supabase-js";
import { Usuario } from "../types/usuario";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function buscarUsuariosDaBarbearia(barbeariaId: string) {
  const { data, error } = await supabase
    .from("usuarios")
    .select("*")
    .eq("barbearia_id", barbeariaId)
    .eq("ativo", true)
    .order("nome", { ascending: true });

  if (error) {
    console.error("Erro ao buscar usuários:", error.message);
    return [];
  }

  return data as Usuario[];
}

export async function buscarTodosUsuariosAdmin(barbeariaId: string) {
  const { data, error } = await supabase
    .from("usuarios")
    .select("*")
    .eq("barbearia_id", barbeariaId)
    .order("ativo", { ascending: false }) // Mostra os ativos primeiro
    .order("nome", { ascending: true });

  if (error) throw new Error("Erro ao buscar equipe.");
  return data as Usuario[];
}

/**
 * Cadastra um novo membro na equipe
 */
export async function cadastrarMembroEquipe(
  barbeariaId: string,
  nome: string,
  email: string,
  telefone: string,
  funcao: "ADMIN" | "FUNCIONARIO",
) {
  const { data, error } = await supabase
    .from("usuarios")
    .insert([
      {
        barbearia_id: barbeariaId,
        nome,
        email,
        telefone: telefone || null,
        funcao,
        ativo: true,
      },
    ])
    .select();

  if (error) throw new Error("Erro ao cadastrar membro.");
  return data[0] as Usuario;
}

/**
 * Atualiza os dados ou inativa/ativa um membro da equipe
 */
export async function atualizarMembroEquipe(
  id: string,
  nome: string,
  telefone: string,
  funcao: "ADMIN" | "FUNCIONARIO",
  ativo: boolean,
) {
  const { data, error } = await supabase
    .from("usuarios")
    .update({ nome, telefone: telefone || null, funcao, ativo })
    .eq("id", id)
    .select();

  if (error) throw new Error("Erro ao atualizar membro.");
  return data[0] as Usuario;
}
