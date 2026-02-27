"use client";

import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Plus,
  Check,
  X,
  Clock,
  Edit2,
  CheckCircle,
  XCircle,
  User,
} from "lucide-react";
import { Agendamento } from "../../types/agendamento";
import {
  buscarAgendaPorData,
  cadastrarAgendamento,
  atualizarAgendamento,
} from "../../actions/agendamentos";
import { buscarClientesPorNome } from "../../actions/clientes";
import { Usuario } from "../../types/usuario";

interface Props {
  agendaInicial: Agendamento[];
  barbeariaId: string;
  usuarioLogadoId: string;
  dataInicial: string; // Ex: '2026-02-23'
  barbeiros: Usuario[];
}

export default function AgendaInterativa({
  agendaInicial,
  barbeariaId,
  usuarioLogadoId,
  dataInicial,
  barbeiros,
}: Props) {
  // Estados da Página
  const [dataAtual, setDataAtual] = useState(dataInicial);
  const [agenda, setAgenda] = useState<Agendamento[]>(agendaInicial);
  const [carregando, setCarregando] = useState(false);
  const [usuarioSelecionadoId, setUsuarioSelecionadoId] =
    useState(usuarioLogadoId);

  // Controle de Interface (Criando ou Editando)
  const [criandoNovo, setCriandoNovo] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  // Estados do Formulário (Usados tanto para Criar quanto para Editar)
  const [formHora, setFormHora] = useState("");
  const [formServico, setFormServico] = useState("");
  const [formValor, setFormValor] = useState<number | "">("");
  const [buscaCliente, setBuscaCliente] = useState("");
  const [formClienteId, setFormClienteId] = useState("");

  // Estados do Autocomplete
  const [sugestoesClientes, setSugestoesClientes] = useState<
    { id: string; nome: string; data_nascimento: string | null }[]
  >([]);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const [mostrarServicos, setMostrarServicos] = useState(false);
  const opcoesServicos = ["Cabelo", "Barba", "Cabelo e Barba", "Degradê"];

  // ==========================================
  // LÓGICA DE DATAS E NAVEGAÇÃO
  // ==========================================

  // Busca a agenda no banco sempre que a dataAtual mudar
  const carregarAgendaDoDia = async (
    novaData: string,
    novoUsuarioId: string,
  ) => {
    setCarregando(true);
    try {
      const novaAgenda = await buscarAgendaPorData(
        barbeariaId,
        novoUsuarioId,
        novaData,
      );
      setAgenda(novaAgenda);
      setDataAtual(novaData);
      setUsuarioSelecionadoId(novoUsuarioId);
      cancelarFormulario();
    } catch (error) {
      alert("Erro ao carregar a agenda.");
    } finally {
      setCarregando(false);
    }
  };

  const mudarDia = (dias: number) => {
    const dataObj = new Date(dataAtual + "T12:00:00"); // T12:00 evita bugs de fuso horário
    dataObj.setDate(dataObj.getDate() + dias);
    const novaDataString = dataObj.toISOString().split("T")[0];
    carregarAgendaDoDia(novaDataString, usuarioSelecionadoId);
  };

  // ==========================================
  // LÓGICA DO FORMULÁRIO (AUTOCOMPLETE E ORDENAÇÃO)
  // ==========================================

  const extrairHora = (dataString: string) =>
    new Date(dataString).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

  // Reordena a lista por horário (do mais cedo pro mais tarde)
  const ordenarAgenda = (lista: Agendamento[]) =>
    [...lista].sort((a, b) => a.data_hora.localeCompare(b.data_hora));

  // Debounce do Autocomplete de Clientes
  useEffect(() => {
    if (buscaCliente.length < 2 || !mostrarSugestoes) {
      setSugestoesClientes([]);
      return;
    }
    const timer = setTimeout(async () => {
      const resultados = await buscarClientesPorNome(barbeariaId, buscaCliente);
      setSugestoesClientes(resultados);
    }, 300);
    return () => clearTimeout(timer);
  }, [buscaCliente, barbeariaId, mostrarSugestoes]);

  const selecionarCliente = (id: string, nome: string) => {
    setFormClienteId(id);
    setBuscaCliente(nome);
    setMostrarSugestoes(false);
  };

  const cancelarFormulario = () => {
    setCriandoNovo(false);
    setEditandoId(null);
    setFormHora("");
    setFormServico("");
    setFormValor("");
    setBuscaCliente("");
    setFormClienteId("");
    setMostrarSugestoes(false);
  };

  const iniciarNovoAgendamento = () => {
    cancelarFormulario();
    setCriandoNovo(true);
    setFormHora("09:00"); // Horário padrão inicial
  };

  const iniciarEdicao = (ag: Agendamento) => {
    cancelarFormulario();
    setEditandoId(ag.id);
    setFormHora(extrairHora(ag.data_hora));
    setFormServico(ag.servico);
    setFormValor(ag.valor);
    setBuscaCliente(ag.clientes?.nome || "");
    setFormClienteId(ag.cliente_id);
  };

  // ==========================================
  // SALVAR NO BANCO (CRIAR E ATUALIZAR)
  // ==========================================

  const salvarAgendamento = async () => {
    if (!formClienteId || !formHora || !formServico || formValor === "") {
      alert("Preencha todos os campos e selecione um cliente da lista.");
      return;
    }

    const dataHoraCompleta = `${dataAtual}T${formHora}:00.000-03:00`;

    try {
      if (criandoNovo) {
        // CADASTRA UM NOVO
        const novoAg = await cadastrarAgendamento(
          barbeariaId,
          usuarioSelecionadoId,
          formClienteId,
          dataHoraCompleta,
          formServico,
          Number(formValor),
        );
        setAgenda(ordenarAgenda([...agenda, novoAg])); // Adiciona e já reordena!
      } else if (editandoId) {
        // ATUALIZA UM EXISTENTE
        const agAtual = agenda.find((a) => a.id === editandoId);
        if (agAtual) {
          const agAtualizado = await atualizarAgendamento(
            editandoId,
            formServico,
            Number(formValor),
            agAtual.status,
            formClienteId,
            dataHoraCompleta,
          );
          setAgenda(
            ordenarAgenda(
              agenda.map((a) => (a.id === editandoId ? agAtualizado : a)),
            ),
          );
        }
      }
      cancelarFormulario();
    } catch (error) {
      alert("Erro ao salvar agendamento.");
    }
  };

  // Função rápida para mudar o status para concluído/cancelado com 1 clique
  const mudarStatusRapido = async (
    ag: Agendamento,
    novoStatus: "concluido" | "cancelado",
  ) => {
    try {
      const agAtualizado = await atualizarAgendamento(
        ag.id,
        ag.servico,
        ag.valor,
        novoStatus,
        ag.cliente_id,
        ag.data_hora,
      );
      setAgenda(agenda.map((a) => (a.id === ag.id ? agAtualizado : a)));
    } catch (e) {
      alert("Erro ao mudar status.");
    }
  };

  // ==========================================
  // RENDERIZAÇÃO DA LINHA DO FORMULÁRIO
  // ==========================================
  const renderLinhaFormulario = () => (
    <div className="p-4 bg-blue-50 dark:bg-blue-950 dark:hover:bg-blue-900 border-2 border-blue-200 rounded-xl flex flex-col md:flex-row gap-4 items-start md:items-center shadow-sm relative mb-4">
      <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Hora */}
        <div className="md:col-span-2">
          <label className="text-xs font-bold text-blue-700 dark:text-blue-200 uppercase">
            Horário
          </label>
          <input
            type="time"
            value={formHora}
            onChange={(e) => setFormHora(e.target.value)}
            className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-100 dark:bg-gray-800"
          />
        </div>

        {/* Cliente (Autocomplete) */}
        <div className="md:col-span-4 relative">
          <label className="text-xs font-bold text-blue-700 dark:text-blue-200 uppercase">
            Cliente
          </label>
          <input
            type="text"
            value={buscaCliente}
            placeholder="Buscar..."
            onChange={(e) => {
              setBuscaCliente(e.target.value);
              setFormClienteId("");
              setMostrarSugestoes(true);
            }}
            className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-100 dark:bg-gray-800"
          />
          {mostrarSugestoes && sugestoesClientes.length > 0 && (
            <div className="absolute z-50 mt-1 w-full bg-white border rounded shadow-lg max-h-48 overflow-y-auto dark:text-gray-100 dark:bg-gray-800">
              {sugestoesClientes.map((c) => (
                <div
                  key={c.id}
                  onClick={() => selecionarCliente(c.id, c.nome)}
                  className="p-2 hover:bg-blue-50 dark:hover:bg-gray-900 cursor-pointer border-b last:border-0"
                >
                  <p className="font-bold text-sm text-gray-800 dark:text-gray-100">
                    {c.nome}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Serviço */}
        <div className="md:col-span-3 relative">
          <label className="text-xs font-bold text-blue-700 dark:text-blue-200 uppercase">
            Serviço
          </label>
          <input
            type="text"
            value={formServico}
            onChange={(e) => {
              setFormServico(e.target.value);
              setMostrarServicos(true); // Abre a lista ao digitar
            }}
            onFocus={() => setMostrarServicos(true)} // Abre a lista ao clicar no campo
            onBlur={() => setTimeout(() => setMostrarServicos(false), 200)} // Fecha a lista se clicar fora (com atraso para dar tempo de clicar na opção)
            placeholder="Ex: Cabelo"
            className="w-full p-2 border dark:border-gray-700 rounded outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-100 dark:bg-gray-800"
          />

          {/* LISTA SUSPENSA DE SERVIÇOS */}
          {mostrarServicos && (
            <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border dark:border-gray-700 rounded shadow-lg max-h-48 overflow-y-auto">
              {opcoesServicos
                // Filtra a lista baseada no que o usuário já digitou
                .filter((servico) =>
                  servico.toLowerCase().includes(formServico.toLowerCase()),
                )
                .map((servico) => (
                  <div
                    key={servico}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setFormServico(servico);
                      setMostrarServicos(false);
                    }}
                    className="p-2 hover:bg-blue-50 dark:hover:bg-gray-900 cursor-pointer border-b dark:border-gray-700 last:border-0"
                  >
                    <p className="font-bold text-sm text-gray-800 dark:text-gray-100">
                      {servico}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Valor */}
        <div className="md:col-span-2">
          <label className="text-xs font-bold text-blue-700 dark:text-blue-200 uppercase">
            Valor (R$)
          </label>
          <input
            type="number"
            value={formValor}
            onChange={(e) =>
              setFormValor(e.target.value ? Number(e.target.value) : "")
            }
            placeholder="40"
            className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-50 dark:bg-gray-800"
          />
        </div>

        {/* Botões */}
        <div className="md:col-span-1 flex items-end justify-end gap-2 pb-1">
          <button
            onClick={salvarAgendamento}
            className="p-2 bg-green-600 text-white dark:text-gray-100 rounded hover:bg-green-500 flex-1 flex justify-center"
          >
            <Check size={20} />
          </button>
          <button
            onClick={cancelarFormulario}
            className="p-2 bg-red-100 dark:bg-red-600 dark:hover:bg-red-500 text-red-700 dark:text-red-50 rounded hover:bg-red-200 flex-1 flex justify-center"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* BARRA DE NAVEGAÇÃO DE DATAS */}
      <div className="bg-white dark:bg-gray-900 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-row items-center justify-between sm:justify-center gap-2 sm:gap-6">
        {/* BOTÃO ANTERIOR */}
        <button
          onClick={() => mudarDia(-1)}
          className="flex items-center justify-center p-2 sm:px-4 sm:py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-100 font-medium transition-colors"
          title="Dia Anterior"
        >
          <ChevronLeft size={20} />
          {/* Oculta a palavra "Anterior" no celular para economizar espaço */}
          <span className="hidden sm:inline ml-1">Anterior</span>
        </button>

        {/* CALENDÁRIO CENTRAL */}
        <div className="flex items-center justify-center gap-2 font-bold text-base sm:text-lg text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 px-2 sm:px-2 py-2 rounded-lg flex-1 sm:flex-none">
          <input
            type="date"
            value={dataAtual}
            onChange={(e) =>
              carregarAgendaDoDia(e.target.value, usuarioSelecionadoId)
            }
            className="bg-transparent border-none outline-none cursor-pointer w-full text-center"
          />
        </div>

        {/* BOTÃO PRÓXIMO */}
        <button
          onClick={() => mudarDia(1)}
          className="flex items-center justify-center p-2 sm:px-4 sm:py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-100 font-medium transition-colors"
          title="Próximo Dia"
        >
          {/* Oculta a palavra "Próximo" no celular */}
          <span className="hidden sm:inline mr-1">Próximo</span>
          <ChevronRight size={20} />
        </button>
      </div>

      {/* A NOVA BARRA DE SELEÇÃO DE PROFISSIONAL */}
      <div className="bg-blue-50 bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-blue-100 flex items-center gap-3">
        <User className="text-blue-600 dark:text-blue-300" size={20} />
        <label className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase">
          Agenda de:
        </label>

        <select
          value={usuarioSelecionadoId}
          onChange={(e) => carregarAgendaDoDia(dataAtual, e.target.value)}
          className="flex-1 max-w-xs bg-white dark:bg-gray-700 border border-blue-200 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-50 font-bold outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer shadow-sm"
        >
          {barbeiros.map((barbeiro) => (
            <option key={barbeiro.id} value={barbeiro.id}>
              {barbeiro.nome} {barbeiro.id === usuarioLogadoId ? "(Você)" : ""}
            </option>
          ))}
        </select>
      </div>

      {/* ÁREA DA AGENDA */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 p-4 min-h-[400px]">
        {/* CABEÇALHO DA LISTA E BOTÃO DE NOVO */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b">
          <h2 className="font-bold text-gray-800 dark:text-gray-100 text-lg">
            Agendamentos
          </h2>
          {!criandoNovo && (
            <button
              onClick={iniciarNovoAgendamento}
              className="flex items-center gap-2 bg-blue-600 dark:bg-blue-600 text-white dark:text-gray-100 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus size={20} /> <span className="hidden sm:inline">Novo</span>
            </button>
          )}
        </div>

        {carregando ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-100 animate-pulse">
            Carregando horários...
          </div>
        ) : (
          <div className="pb-32">
            {" "}
            {/* Espaço extra para o Autocomplete não cortar embaixo */}
            {/* LINHA DE CRIAR NOVO (Aparece no topo se ativo) */}
            {criandoNovo && renderLinhaFormulario()}
            {/* LISTA DE AGENDAMENTOS */}
            {agenda.length === 0 && !criandoNovo ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-100">
                Nenhum cliente agendado para este dia.
              </div>
            ) : (
              <div className="space-y-3">
                {agenda.map((ag) => (
                  <div key={ag.id}>
                    {editandoId === ag.id ? (
                      // RENDERIZA O FORMULÁRIO DE EDIÇÃO
                      renderLinhaFormulario()
                    ) : (
                      // RENDERIZA A VISUALIZAÇÃO DA AGENDA
                      <div
                        className={`dark:bg-gray-800 p-4 border rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors ${ag.status === "cancelado" ? "bg-gray-50 dark:bg-gray-800 opacity-60" : "bg-white hover:border-blue-100"}`}
                      >
                        <div className="flex items-center gap-4 min-w-[150px]">
                          <div
                            className={`dark:bg-gray-900 flex flex-col items-center justify-center rounded-lg p-2 min-w-[70px] ${ag.status === "concluido" ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"}`}
                          >
                            <Clock size={16} className="mb-1" />
                            <span className="font-bold text-lg dark:text-gray-100">
                              {extrairHora(ag.data_hora)}
                            </span>
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 dark:text-gray-100 text-lg">
                              {ag.clientes?.nome || "Desconhecido"}
                            </p>
                            {ag.status === "concluido" && (
                              <span className="text-xs bg-green-100 text-green-700 dark:text-green-100 dark:bg-green-600 px-2 py-0.5 rounded-full font-medium">
                                Atendido
                              </span>
                            )}
                            {ag.status === "cancelado" && (
                              <span className="text-xs bg-red-100 text-red-700 dark:text-white dark:bg-red-600 px-2 py-0.5 rounded-full font-medium">
                                Cancelado
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex-1 w-full text-gray-600 dark:text-gray-100">
                          <p className="text-md">{ag.servico}</p>
                          <p className="font-bold text-gray-800 dark:text-gray-100">
                            R$ {Number(ag.valor).toFixed(2)}
                          </p>
                        </div>

                        <div className="flex gap-2 shrink-0">
                          {ag.status === "agendado" && (
                            <>
                              <button
                                onClick={() => iniciarEdicao(ag)}
                                className="p-2 bg-blue-600 dark:bg-blue-600 text-gray-700 dark:text-gray-100 rounded hover:bg-blue-500 hover:text-blue-100 transition-colors"
                                title="Editar"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                onClick={() =>
                                  mudarStatusRapido(ag, "concluido")
                                }
                                className="p-2 bg-green-600 dark:bg-green-600 text-gray-700 dark:text-gray-100 rounded hover:bg-green-500 dark:hover:bg-green-500 hover:text-green-100 transition-colors"
                                title="Marcar como Atendido"
                              >
                                <CheckCircle size={18} />
                              </button>
                              <button
                                onClick={() =>
                                  mudarStatusRapido(ag, "cancelado")
                                }
                                className="p-2 bg-red-600 dark:bg-red-600 text-gray-700 dark:text-red-100 rounded hover:bg-red-500 dark:hover:bg-red-500 hover:text-red-600 transition-colors"
                                title="Cancelar Agendamento"
                              >
                                <XCircle size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
