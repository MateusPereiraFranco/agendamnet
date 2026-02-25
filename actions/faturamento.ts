"use server"; // Isso diz ao Next.js que este código NUNCA vai para o navegador (segurança)

import { createClient } from "@supabase/supabase-js";

// Inicializando o Supabase (você pegará essas chaves no painel do Supabase)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Calcula o faturamento de uma barbearia em um período de datas.
 * @param barbeariaId - O ID da barbearia atual
 * @param dataInicio - Data inicial (ex: '2026-02-01')
 * @param dataFim - Data final (ex: '2026-02-28')
 */
export async function calcularFaturamento(
  barbeariaId: string,
  dataInicio: string,
  dataFim: string,
) {
  // Fazemos uma consulta ao Supabase chamando a tabela 'agendamentos'
  const { data, error } = await supabase
    .from("agendamentos")
    .select("valor") // Queremos apenas a coluna de valor para ficar mais leve
    .eq("barbearia_id", barbeariaId) // Filtro do SaaS (Apenas desta barbearia)
    .eq("status", "concluido") // Apenas serviços que realmente aconteceram
    .gte("data_hora", `${dataInicio}T00:00:00.000Z`) // Maior ou igual a data inicial
    .lte("data_hora", `${dataFim}T23:59:59.999Z`); // Menor ou igual a data final

  if (error) {
    console.error("Erro ao buscar faturamento:", error);
    throw new Error("Não foi possível calcular o faturamento.");
  }

  // Se deu tudo certo, 'data' será um array assim: [{ valor: 45 }, { valor: 50 }]
  // Usamos o método 'reduce' do JavaScript para somar todos os valores.
  const totalGasto = data.reduce((acumulador, agendamento) => {
    return acumulador + Number(agendamento.valor);
  }, 0);

  return totalGasto;
}
