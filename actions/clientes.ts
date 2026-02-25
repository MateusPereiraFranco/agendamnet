"use server"; // Isso é obrigatório! Garante que este código rode APENAS no servidor.

import { createClient } from "@supabase/supabase-js";
import { Cliente } from "../types/cliente"; // Importando o seu Model!

// Conectando ao Supabase usando as chaves do seu .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Usamos a chave secreta (admin) para ter permissão total
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Função para cadastrar um novo cliente no banco de dados.
 */
export async function cadastrarCliente(
  nome: string,
  telefone: string,
  data_nascimento: string,
  barbearia_id: string,
) {
  // O Supabase usa uma sintaxe bem parecida com SQL, mas em JavaScript!
  const { data, error } = await supabase
    .from("clientes") // Escolhemos a tabela
    .insert([
      {
        nome: nome,
        telefone: telefone || null,
        data_nascimento: data_nascimento || null,
        barbearia_id: barbearia_id,
      },
    ])
    .select(); // Pede para o banco devolver os dados recém-criados (com o ID e o código gerados)

  // Se o Supabase retornar um erro (ex: falha na conexão), nós avisamos
  if (error) {
    console.error("Erro no Supabase:", error.message);
    throw new Error("Não foi possível cadastrar o cliente.");
  }

  // Se deu certo, retornamos o cliente cadastrado
  return data[0] as Cliente;
}

export async function buscarClientes(barbeariaId: string) {
  const { data, error } = await supabase
    .from("clientes")
    .select(
      `
      *,
      agendamentos ( data_hora, status )
    `,
    )
    .eq("barbearia_id", barbeariaId);

  if (error) {
    console.error("Erro ao procurar clientes:", error.message);
    throw new Error("Não foi possível carregar a lista de clientes.");
  }

  // Pega a data e hora de hoje para sabermos o que é futuro
  const agora = new Date().toISOString();

  const clientesProcessados = data.map((cliente: any) => {
    // Passado: cortes que já aconteceram
    const concluidos =
      cliente.agendamentos?.filter((ag: any) => ag.status === "concluido") ||
      [];
    // Futuro: cortes marcados para hoje ou depois
    const futuros =
      cliente.agendamentos?.filter(
        (ag: any) => ag.status === "agendado" && ag.data_hora >= agora,
      ) || [];

    let dataUltimoCorte = null;
    let dataProximoAgendamento = null;

    if (concluidos.length > 0) {
      // Ordena do mais recente pro mais antigo e pega o primeiro
      concluidos.sort(
        (a: any, b: any) =>
          new Date(b.data_hora).getTime() - new Date(a.data_hora).getTime(),
      );
      dataUltimoCorte = concluidos[0].data_hora;
    }

    if (futuros.length > 0) {
      // Ordena do mais próximo pro mais distante e pega o primeiro
      futuros.sort(
        (a: any, b: any) =>
          new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime(),
      );
      dataProximoAgendamento = futuros[0].data_hora;
    }

    const { agendamentos, ...clienteLimpo } = cliente;

    return {
      ...clienteLimpo,
      ultimo_corte: dataUltimoCorte,
      proximo_agendamento: dataProximoAgendamento,
    };
  });

  // A MAGIA DA ORDENAÇÃO
  clientesProcessados.sort((a, b) => {
    // 1º Regra: Se um já tá agendado e o outro não, o agendado vai lá pro final da lista!
    if (a.proximo_agendamento && !b.proximo_agendamento) return 1;
    if (!a.proximo_agendamento && b.proximo_agendamento) return -1;

    // 2º Regra: Se ambos estão na mesma situação, mostra quem sumiu há mais tempo no topo
    if (!a.ultimo_corte) return 1; // Novatos sem corte pro final
    if (!b.ultimo_corte) return -1;

    return (
      new Date(a.ultimo_corte).getTime() - new Date(b.ultimo_corte).getTime()
    );
  });

  return clientesProcessados as Cliente[];
}

export async function atualizarCliente(
  id: string,
  nome: string,
  telefone: string,
  data_nascimento: string,
) {
  const { data, error } = await supabase
    .from("clientes")
    .update({
      nome: nome,
      telefone: telefone || null,
      data_nascimento: data_nascimento || null, // Adicionamos aqui!
    })
    .eq("id", id) // Procura exatamente o cliente com este ID
    .select();

  if (error) {
    console.error("Erro ao atualizar cliente:", error.message);
    throw new Error("Não foi possível atualizar o cliente.");
  }

  return data[0];
}

export async function buscarClientesPorNome(
  barbeariaId: string,
  termoBusca: string,
) {
  if (!termoBusca) return [];

  const { data, error } = await supabase
    .from("clientes")
    .select("id, nome, data_nascimento")
    .eq("barbearia_id", barbeariaId)
    .ilike("nome", `%${termoBusca}%`) // O 'ilike' busca partes do nome ignorando maiúsculas/minúsculas
    .limit(5);

  if (error) {
    console.error("Erro na busca de clientes:", error.message);
    return [];
  }

  return data;
}
