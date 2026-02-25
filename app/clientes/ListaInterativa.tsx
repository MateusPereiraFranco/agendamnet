"use client";

import { useState } from "react";
import { Search, Edit2, Check, X } from "lucide-react";
import { Cliente } from "../../types/cliente";
import { atualizarCliente } from "../../actions/clientes";

export default function ListaInterativa({
  clientesIniciais,
}: {
  clientesIniciais: Cliente[];
}) {
  const [clientes, setClientes] = useState<Cliente[]>(clientesIniciais);
  const [busca, setBusca] = useState("");

  // Controle de Edição Inline (Agora com Data de Nascimento!)
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editTelefone, setEditTelefone] = useState("");
  const [editDataNascimento, setEditDataNascimento] = useState("");
  const [salvando, setSalvando] = useState(false);

  const clientesFiltrados = clientes.filter(
    (cliente) =>
      cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
      cliente.codigo.toString() === busca,
  );

  // Prepara os inputs quando clica em Editar
  const iniciarEdicao = (cliente: Cliente) => {
    setEditandoId(cliente.id);
    setEditNome(cliente.nome);
    setEditTelefone(cliente.telefone || "");
    setEditDataNascimento(cliente.data_nascimento || "");
  };

  // Salva no banco e atualiza a tela
  const confirmarEdicao = async (id: string) => {
    setSalvando(true);
    try {
      // Passamos a data_nascimento para a Action
      await atualizarCliente(id, editNome, editTelefone, editDataNascimento);

      // Atualiza a lista na tela com todos os novos dados
      setClientes(
        clientes.map((c) =>
          c.id === id
            ? {
                ...c,
                nome: editNome,
                telefone: editTelefone,
                data_nascimento: editDataNascimento,
              }
            : c,
        ),
      );

      setEditandoId(null);
    } catch (error) {
      alert("Erro ao salvar alterações.");
    } finally {
      setSalvando(false);
    }
  };

  // Função auxiliar para deixar a data no padrão brasileiro (DD/MM/AAAA)
  const formatarDataBR = (dataSql: string) => {
    if (!dataSql) return "";
    const apenasData = dataSql.includes("T") ? dataSql.split("T")[0] : dataSql;
    const [ano, mes, dia] = apenasData.split("-");
    return `${dia}/${mes}/${ano}`;
  };

  const formatarDataHoraBR = (dataSql: string) => {
    if (!dataSql) return "";
    const data = new Date(dataSql);
    return (
      data.toLocaleDateString("pt-BR") +
      " às " +
      data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    );
  };

  return (
    <div className="space-y-6">
      {/* BARRA DE PESQUISA */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="text-gray-400 dark:text-gray-100" size={20} />
        </div>
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar cliente por nome ou código..."
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black dark:text-gray-200 transition-all"
        />
      </div>

      {/* LISTA DE CLIENTES */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {clientesFiltrados.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-200">
            {busca
              ? "Nenhum cliente encontrado."
              : "Nenhum cliente cadastrado."}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {clientesFiltrados.map((cliente) => (
              <div
                key={cliente.id}
                className=" dark:bg-gray-900 p-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                {/* Lógica do Inline Edit */}
                {editandoId === cliente.id ? (
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
                    <input
                      type="text"
                      value={editNome}
                      onChange={(e) => setEditNome(e.target.value)}
                      className="border border-gray-300 rounded px-3 py-2 text-black dark:text-gray-200 w-full"
                      placeholder="Nome completo"
                    />
                    <input
                      type="tel"
                      value={editTelefone}
                      onChange={(e) => setEditTelefone(e.target.value)}
                      className="border border-gray-300 rounded px-3 py-2 text-black dark:text-gray-200 w-full"
                      placeholder="Telefone"
                    />
                    <input
                      type="date"
                      value={editDataNascimento}
                      onChange={(e) => setEditDataNascimento(e.target.value)}
                      className="border border-gray-300 rounded px-3 py-2 text-black dark:text-gray-200 w-full"
                    />
                  </div>
                ) : (
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800 dark:text-gray-200">
                      <span className="text-blue-600 dark:text-blue-300 mr-2 text-sm">
                        #{cliente.codigo}
                      </span>
                      {cliente.nome}
                    </div>

                    {/* Agrupando telefone e data de nascimento */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-200 mt-1">
                      {cliente.telefone && <span>📱 {cliente.telefone}</span>}
                      {cliente.data_nascimento && (
                        <span>
                          🎂 {formatarDataBR(cliente.data_nascimento)}
                        </span>
                      )}
                    </div>
                    {cliente.proximo_agendamento ? (
                      <span className="text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 px-2 py-1 rounded-md flex items-center gap-1 border border-green-200 dark:border-green-800">
                        📅 Agendado para:{" "}
                        {formatarDataHoraBR(cliente.proximo_agendamento)}
                      </span>
                    ) : cliente.ultimo_corte ? (
                      <span className="text-xs font-medium bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300 px-2 py-1 rounded-md flex items-center gap-1 border border-gray-300 dark:border-gray-700">
                        ✂️ Último corte: {formatarDataBR(cliente.ultimo_corte)}
                      </span>
                    ) : (
                      <span className="text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 px-2 py-1 rounded-md border border-blue-200 dark:border-blue-800">
                        Novo Cliente
                      </span>
                    )}
                  </div>
                )}

                {/* BOTÕES DE AÇÃO */}
                <div className="flex gap-2 shrink-0">
                  {editandoId === cliente.id ? (
                    <>
                      <button
                        onClick={() => confirmarEdicao(cliente.id)}
                        disabled={salvando}
                        className="p-2 bg-green-100 text-green-700 dark:bg-green-300 rounded hover:bg-green-200"
                        title="Salvar"
                      >
                        <Check size={18} />
                      </button>
                      <button
                        onClick={() => setEditandoId(null)}
                        className="p-2 bg-red-100 text-red-700  rounded hover:bg-red-200"
                        title="Cancelar"
                      >
                        <X size={18} />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => iniciarEdicao(cliente)}
                      className="p-2 bg-blue-50 dark:bg-gray-800 text-blue-600 dark:text-blue-300 rounded hover:bg-blue-100 dark:hover:bg-blue-900"
                      title="Editar Cliente"
                    >
                      <Edit2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
