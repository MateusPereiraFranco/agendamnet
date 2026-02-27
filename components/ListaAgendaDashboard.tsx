"use client";

import { useState, useEffect } from "react";
import {
  Edit2,
  CheckCircle,
  XCircle,
  Check,
  X,
  Clock,
  DollarSign,
} from "lucide-react";
import { Agendamento } from "../types/agendamento";
import { atualizarAgendamento } from "../actions/agendamentos";
import { buscarClientesPorNome } from "../actions/clientes";

// Adicionamos a prop 'barbeariaId' para poder fazer a busca de clientes
export default function ListaAgendaDashboard({
  agendaInicial,
  barbeariaId,
}: {
  agendaInicial: Agendamento[];
  barbeariaId: string;
}) {
  const [agenda, setAgenda] = useState<Agendamento[]>(agendaInicial);

  // Estados da Edição
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editServico, setEditServico] = useState("");
  const [editValor, setEditValor] = useState<number>(0);
  const [editHora, setEditHora] = useState("");

  // Estados do Autocomplete do Cliente
  const [buscaCliente, setBuscaCliente] = useState("");
  const [editClienteId, setEditClienteId] = useState("");
  const [sugestoesClientes, setSugestoesClientes] = useState<
    { id: string; nome: string; data_nascimento: string | null }[]
  >([]);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);

  // EXTRAI A HORA: de "2026-02-23T14:30:00" para "14:30"
  const extrairHora = (dataString: string) => {
    return new Date(dataString).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Prepara os inputs quando clica em Editar
  const iniciarEdicao = (ag: Agendamento) => {
    setEditandoId(ag.id);
    setEditServico(ag.servico);
    setEditValor(ag.valor);
    setEditHora(extrairHora(ag.data_hora));
    setBuscaCliente(ag.clientes?.nome || "");
    setEditClienteId(ag.cliente_id);
    setMostrarSugestoes(false);
  };

  // EFEITO COLATERAL (Debounce): Busca clientes na hora que o usuário digita
  useEffect(() => {
    if (buscaCliente.length < 2 || !mostrarSugestoes) {
      setSugestoesClientes([]);
      return;
    }

    // Espera 300ms depois que parou de digitar para não flodar o banco
    const timer = setTimeout(async () => {
      const resultados = await buscarClientesPorNome(barbeariaId, buscaCliente);
      setSugestoesClientes(resultados);
    }, 300);

    return () => clearTimeout(timer); // Limpa o timer se digitar novamente rápido
  }, [buscaCliente, barbeariaId, mostrarSugestoes]);

  // Função para quando clica em um cliente da lista de sugestões
  const selecionarCliente = (id: string, nome: string) => {
    setEditClienteId(id);
    setBuscaCliente(nome);
    setMostrarSugestoes(false);
  };

  // Salva no banco
  const salvarAlteracao = async (
    id: string,
    statusOriginal: any,
    dataHoraOriginal: string,
  ) => {
    // Se digitou algo mas não selecionou da lista, bloqueia
    if (!editClienteId) {
      alert("Por favor, selecione um cliente da lista suspensa.");
      return;
    }

    try {
      // Reconstrói a data com a nova hora (Mantém o dia, troca só a hora)
      const dataApenas = dataHoraOriginal.split("T")[0];
      const novaDataHora = `${dataApenas}T${editHora}:00.000-03:00`;

      const agAtualizado = await atualizarAgendamento(
        id,
        editServico,
        editValor,
        statusOriginal,
        editClienteId,
        novaDataHora,
      );

      // Atualiza a tela instantaneamente
      setAgenda(agenda.map((a) => (a.id === id ? agAtualizado : a)));
      setEditandoId(null);
    } catch (error) {
      alert("Erro ao atualizar o agendamento.");
    }
  };

  if (agenda.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-200">
        Sua agenda de hoje está livre!
      </div>
    );
  }

  const atendidosHoje = agenda.filter((ag) => ag.status === "concluido");
  const faturamentoHoje = atendidosHoje.reduce(
    (total, ag) => total + Number(ag.valor),
    0,
  );

  return (
    <div className=" divide-y divide-gray-100 dark:divide-gray-500 flex-1 overflow-y-auto md:pb-20">
      {" "}
      {/* pb-20 dá espaço extra para o dropdown não ser cortado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-1000 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-50">
              Cortes Realizados (Hoje)
            </p>
            <p className="text-xl font-bold text-gray-800 dark:text-gray-50 ">
              {atendidosHoje.length}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-1000 flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <DollarSign size={24} />
          </div>{" "}
          {/* Importe o DollarSign do lucide-react */}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-50">
              Seu Faturamento (Hoje)
            </p>
            <p className="text-xl font-bold text-gray-800 dark:text-gray-50">
              R$ {faturamentoHoje.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
      {agenda.map((ag) => (
        <div
          key={ag.id}
          className={`p-4 flex flex-col dark:text-gray-50 dark:bg-gray-800 md:flex-row justify-between items-start md:items-center gap-4 transition-colors relative ${ag.status === "cancelado" ? "opacity-50 bg-gray-50" : "hover:bg-gray-50 dark:hover:bg-gray-900"}`}
        >
          {editandoId === ag.id ? (
            // ==========================================
            // MODO DE EDIÇÃO
            // ==========================================
            <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-12 gap-2">
              {/* INPUT DE HORÁRIO */}
              <div className="md:col-span-2">
                <input
                  type="time"
                  value={editHora}
                  onChange={(e) => setEditHora(e.target.value)}
                  className="dark:text-white border rounded px-2 py-2 text-black w-full"
                />
              </div>

              {/* AUTOCOMPLETE DO CLIENTE */}
              <div className="md:col-span-4 relative">
                <input
                  type="text"
                  value={buscaCliente}
                  onChange={(e) => {
                    setBuscaCliente(e.target.value);
                    setEditClienteId(""); // Apaga o ID se mudar o texto
                    setMostrarSugestoes(true);
                  }}
                  placeholder="Buscar cliente..."
                  className="dark:text-white border rounded px-2 py-2 text-black w-full"
                />

                {/* LISTA SUSPENSA DE SUGESTÕES */}
                {mostrarSugestoes && sugestoesClientes.length > 0 && (
                  <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-900 border rounded shadow-lg max-h-48 overflow-y-auto">
                    {sugestoesClientes.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => selecionarCliente(c.id, c.nome)}
                        className="dark:text-white p-2 hover:bg-blue-50 cursor-pointer border-b last:border-0 dark:hover:bg-gray-950"
                      >
                        <p className="font-bold text-sm text-gray-800 dark:text-white">
                          {c.nome}
                        </p>
                        {c.data_nascimento && (
                          <p className="dark:text-white text-xs text-gray-500 dark:text-gray-200">
                            Data Nasc:{" "}
                            {new Date(c.data_nascimento).toLocaleDateString(
                              "pt-BR",
                            )}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* INPUTS DE SERVIÇO E VALOR */}
              <div className="md:col-span-3">
                <input
                  type="text"
                  value={editServico}
                  onChange={(e) => setEditServico(e.target.value)}
                  className="dark:text-white border rounded px-2 py-2 text-black w-full"
                  placeholder="Serviço"
                />
              </div>
              <div className="md:col-span-2">
                <input
                  type="number"
                  value={editValor}
                  onChange={(e) => setEditValor(Number(e.target.value))}
                  className="dark:text-white border rounded px-2 py-2 text-black w-full"
                  placeholder="R$ Valor"
                />
              </div>

              {/* BOTÕES SALVAR/CANCELAR */}
              <div className="md:col-span-1 flex items-center justify-end gap-1">
                <button
                  onClick={() =>
                    salvarAlteracao(ag.id, ag.status, ag.data_hora)
                  }
                  className="p-2 bg-green-100 dark:bg-green-600 text-green-700 dark:text-green-50 rounded h-10 w-10 flex items-center justify-center dark:hover:bg-green-500"
                >
                  <Check size={18} />
                </button>
                <button
                  onClick={() => setEditandoId(null)}
                  className="p-2 bg-gray-100 dark:bg-red-600 dark:hover:bg-red-500 text-gray-700 dark:text-gray-50 rounded h-10 w-10 flex items-center justify-center"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          ) : (
            // ==========================================
            // MODO DE VISUALIZAÇÃO (Lado a Lado)
            // ==========================================
            <>
              <div className="flex items-center gap-4 min-w-[150px]">
                <div className="flex flex-col items-center justify-center bg-blue-50 text-blue-700 dark:text-blue-50 dark:bg-gray-900 rounded-lg p-2 min-w-[60px]">
                  <Clock size={16} className="mb-1" />
                  <span className="font-bold text-sm">
                    {extrairHora(ag.data_hora)}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-gray-800 dark:text-white">
                    {ag.clientes?.nome || "Desconhecido"}
                  </p>
                  {ag.status === "concluido" && (
                    <span className="text-xs bg-green-100 dark:bg-green-600 text-green-700 dark:text-green-100 px-2 py-0.5 rounded-full font-medium">
                      Atendido
                    </span>
                  )}
                  {ag.status === "cancelado" && (
                    <span className="text-xs dark:text-white dark:bg-red-600 bg-red-100 text-red-700 dark:text-red-100 px-2 py-0.5 rounded-full font-medium">
                      Cancelado
                    </span>
                  )}
                </div>
              </div>

              <div className="flex-1 w-full">
                <div className="text-sm text-gray-600 dark:text-white">
                  <p>{ag.servico}</p>
                  <p className="font-medium">
                    R$ {Number(ag.valor).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 shrink-0">
                {ag.status === "agendado" && (
                  <>
                    <button
                      onClick={() => iniciarEdicao(ag)}
                      className="p-2 bg-gray-100 dark:bg-gray-1000 text-gray-700 dark:text-white dark:bg-blue-600 rounded hover:bg-blue-500"
                    >
                      <Edit2 size={18} />
                    </button>
                    {/* Alteramos a ação rápida para usar os dados que já existem no agendamento para não quebrar a lógica */}
                    <button
                      onClick={() =>
                        atualizarAgendamento(
                          ag.id,
                          ag.servico,
                          ag.valor,
                          "concluido",
                          ag.cliente_id,
                          ag.data_hora,
                        ).then((res) =>
                          setAgenda(
                            agenda.map((a) => (a.id === ag.id ? res : a)),
                          ),
                        )
                      }
                      className="p-2 bg-green-50 text-green-600 dark:text-white dark:bg-green-600 rounded hover:bg-green-500"
                    >
                      <CheckCircle size={18} />
                    </button>
                    <button
                      onClick={() =>
                        atualizarAgendamento(
                          ag.id,
                          ag.servico,
                          ag.valor,
                          "cancelado",
                          ag.cliente_id,
                          ag.data_hora,
                        ).then((res) =>
                          setAgenda(
                            agenda.map((a) => (a.id === ag.id ? res : a)),
                          ),
                        )
                      }
                      className="p-2 bg-red-50 text-red-600 dark:text-white dark:bg-red-600 rounded hover:bg-red-500"
                    >
                      <XCircle size={18} />
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
