"use client";

import { useState, useEffect } from "react";
import { Calendar, DollarSign, Scissors, Search, User } from "lucide-react";
import { buscarFechamento } from "../../actions/relatorios";
import { Usuario } from "../../types/usuario";

interface Props {
  barbeariaId: string;
  barbeiros: Usuario[];
}

export default function FechamentoInterativo({
  barbeariaId,
  barbeiros,
}: Props) {
  // Lógica para pegar o primeiro dia e o dia de hoje do mês atual como padrão
  const hoje = new Date();
  const primeiroDiaDoMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const dataHojeString = hoje.toISOString().split("T")[0];

  // Estados dos Filtros
  const [dataInicio, setDataInicio] = useState(primeiroDiaDoMes);
  const [dataFim, setDataFim] = useState(dataHojeString);
  const [usuarioFiltro, setUsuarioFiltro] = useState("todos");

  // Estados dos Resultados
  const [resultados, setResultados] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [buscou, setBuscou] = useState(false);

  // Função que vai no banco buscar o dinheiro
  const gerarRelatorio = async () => {
    if (!dataInicio || !dataFim) {
      alert("Preencha as duas datas!");
      return;
    }
    if (dataInicio > dataFim) {
      alert("A data inicial não pode ser maior que a final.");
      return;
    }

    setCarregando(true);
    try {
      const dados = await buscarFechamento(
        barbeariaId,
        dataInicio,
        dataFim,
        usuarioFiltro,
      );
      setResultados(dados);
      setBuscou(true);
    } catch (error) {
      alert("Erro ao buscar fechamento.");
    } finally {
      setCarregando(false);
    }
  };

  // ==========================================
  // A MÁGICA DA MATEMÁTICA (Reduce)
  // ==========================================
  const totalCortes = resultados.length;
  const totalFaturamento = resultados.reduce(
    (acumulador, item) => acumulador + Number(item.valor),
    0,
  );

  // Formata a data para ficar bonita na tabela (Ex: 23/02/2026 às 14:30)
  const formatarDataHora = (dataIso: string) => {
    const data = new Date(dataIso);
    return (
      data.toLocaleDateString("pt-BR") +
      " às " +
      data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    );
  };

  return (
    <div className="space-y-6">
      {/* BARRA DE FILTROS */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-end">
        <div className="w-full md:w-auto flex-1">
          <label className="block text-sm font-bold dark:text-white text-gray-700 mb-1 uppercase">
            Data Inicial
          </label>
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
          />
        </div>

        <div className="w-full md:w-auto flex-1">
          <label className="block text-sm font-bold text-gray-700 mb-1 uppercase dark:text-white">
            Data Final
          </label>
          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
          />
        </div>

        <div className="w-full md:w-auto flex-1">
          <label className="block text-sm font-bold text-gray-700 mb-1 uppercase dark:text-white">
            Profissional
          </label>
          <select
            value={usuarioFiltro}
            onChange={(e) => setUsuarioFiltro(e.target.value)}
            className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 dark:text-white"
          >
            <option value="todos">Todos da Barbearia</option>
            {barbeiros.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nome}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={gerarRelatorio}
          disabled={carregando}
          className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg flex items-center justify-center gap-2 h-[42px] transition-colors"
        >
          {carregando ? (
            "Buscando..."
          ) : (
            <>
              <Search size={18} /> Buscar
            </>
          )}
        </button>
      </div>

      {/* RESULTADOS (Só aparece depois que clica em buscar) */}
      {buscou && (
        <div className="space-y-6 animate-fade-in">
          {/* CARDS DE RESUMO FINANCEIRO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow text-white flex items-center gap-4">
              <div className="bg-white/20 p-4 rounded-full">
                <DollarSign size={32} />
              </div>
              <div>
                <p className="text-green-100 font-medium">Faturamento Total</p>
                <h2 className="text-4xl font-bold">
                  R$ {totalFaturamento.toFixed(2)}
                </h2>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow text-white flex items-center gap-4">
              <div className="bg-white/20 p-4 rounded-full">
                <Scissors size={32} />
              </div>
              <div>
                <p className="text-blue-100 font-medium">Serviços Realizados</p>
                <h2 className="text-4xl font-bold">{totalCortes}</h2>
              </div>
            </div>
          </div>

          {/* LISTA DETALHADA PARA AUDITORIA */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b bg-gray-50 dark:bg-gray-700">
              <h3 className="font-bold text-gray-800 dark:text-white">
                Detalhamento dos Serviços
              </h3>
            </div>

            {resultados.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-200">
                Nenhum serviço concluído neste período.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-200 text-sm uppercase">
                      <th className="p-4 border-b">Data e Hora</th>
                      <th className="p-4 border-b">Cliente</th>
                      <th className="p-4 border-b">Serviço</th>
                      <th className="p-4 border-b">Profissional</th>
                      <th className="p-4 border-b text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {resultados.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="p-4 text-sm text-gray-600 dark:text-white">
                          {formatarDataHora(item.data_hora)}
                        </td>
                        <td className="p-4 font-medium text-gray-800 dark:text-white">
                          {item.clientes?.nome}
                        </td>
                        <td className="p-4 text-sm text-gray-600 dark:text-white">
                          {item.servico}
                        </td>
                        <td className="p-4 text-sm text-gray-600 dark:text-white flex items-center gap-1">
                          <User size={14} /> {item.usuarios?.nome}
                        </td>
                        <td className="p-4 font-bold text-gray-800 text-right dark:text-white">
                          R$ {Number(item.valor).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
