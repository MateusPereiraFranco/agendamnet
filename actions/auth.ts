"use server";

import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function realizarLogin(email: string, senha: string) {
  // 1. Busca o usuário E faz um "JOIN" com a tabela de barbearias para pegar o nome
  const { data: usuario, error } = await supabase
    .from("usuarios")
    .select("*, barbearias(nome)") // A MÁGICA ESTÁ AQUI!
    .eq("email", email)
    .eq("senha", senha)
    .eq("ativo", true)
    .single();

  if (error || !usuario) {
    throw new Error("Email ou senha incorretos, ou usuário inativo.");
  }

  const tempoExpiracao = 7 * 24 * 60 * 60;
  const cookieStore = await cookies();

  // Salva os cookies antigos
  cookieStore.set("saas_usuario_id", usuario.id, {
    maxAge: tempoExpiracao,
    httpOnly: true,
  });
  cookieStore.set("saas_barbearia_id", usuario.barbearia_id, {
    maxAge: tempoExpiracao,
    httpOnly: true,
  });
  cookieStore.set("saas_funcao", usuario.funcao, {
    maxAge: tempoExpiracao,
    httpOnly: true,
  });
  cookieStore.set("saas_usuario_nome", usuario.nome, {
    maxAge: tempoExpiracao,
    httpOnly: true,
  });

  const nomeDaBarbearia = usuario.barbearias?.nome || "Barbearia";
  cookieStore.set("saas_barbearia_nome", nomeDaBarbearia, {
    maxAge: tempoExpiracao,
    httpOnly: true,
  });

  return true;
}

export async function realizarLogout() {
  const cookieStore = await cookies();

  cookieStore.delete("saas_usuario_id");
  cookieStore.delete("saas_barbearia_id");
  cookieStore.delete("saas_funcao");
  cookieStore.delete("saas_usuario_nome");
  cookieStore.delete("saas_barbearia_nome"); // Apaga o novo cookie no logout
}

export async function obterSessao() {
  const cookieStore = await cookies();

  const usuarioId = cookieStore.get("saas_usuario_id")?.value;
  const barbeariaId = cookieStore.get("saas_barbearia_id")?.value;
  const funcao = cookieStore.get("saas_funcao")?.value;
  const nome = cookieStore.get("saas_usuario_nome")?.value;
  const barbeariaNome = cookieStore.get("saas_barbearia_nome")?.value; // Lê o novo cookie

  if (!usuarioId || !barbeariaId) return null;

  // Agora retornamos o nome da barbearia também!
  return { usuarioId, barbeariaId, funcao, nome, barbeariaNome };
}
