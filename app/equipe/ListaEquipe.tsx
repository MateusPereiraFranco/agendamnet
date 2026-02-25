"use client";

import { useState } from "react";
import {
  Edit2,
  Check,
  X,
  UserPlus,
  Shield,
  User,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Usuario } from "../../types/usuario";
import {
  cadastrarMembroEquipe,
  atualizarMembroEquipe,
} from "../../actions/usuarios";

export default function ListaEquipe({
  equipeInicial,
  barbeariaId,
}: {
  equipeInicial: Usuario[];
  barbeariaId: string;
}) {
  const [equipe, setEquipe] = useState<Usuario[]>(equipeInicial);
  const [mostrarInativos, setMostrarInativos] = useState(false);

  // Controles de Formulário (Criar e Editar)
  const [criandoNovo, setCriandoNovo] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  // Estados dos Inputs
  const [formNome, setFormNome] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formTelefone, setFormTelefone] = useState("");
  const [formFuncao, setFormFuncao] = useState<"ADMIN" | "FUNCIONARIO">(
    "FUNCIONARIO",
  );

  // Filtra a lista baseada no botão de "Mostrar Inativos"
  const equipeFiltrada = mostrarInativos
    ? equipe
    : equipe.filter((m) => m.ativo);

  const cancelarFormulario = () => {
    setCriandoNovo(false);
    setEditandoId(null);
    setFormNome("");
    setFormEmail("");
    setFormTelefone("");
    setFormFuncao("FUNCIONARIO");
  };

  const iniciarNovo = () => {
    cancelarFormulario();
    setCriandoNovo(true);
  };

  const iniciarEdicao = (membro: Usuario) => {
    cancelarFormulario();
    setEditandoId(membro.id);
    setFormNome(membro.nome);
    setFormEmail(membro.email);
    setFormTelefone(membro.telefone || "");
    // Ignora erro de tipagem caso você seja MASTER, forçamos para ADMIN na edição visual
    setFormFuncao(membro.funcao === "MASTER" ? "ADMIN" : membro.funcao);
  };

  const salvarMembro = async (ativoOriginal: boolean = true) => {
    if (!formNome || (!formEmail && criandoNovo)) {
      alert("Nome e Email são obrigatórios para novos cadastros.");
      return;
    }

    try {
      if (criandoNovo) {
        const novo = await cadastrarMembroEquipe(
          barbeariaId,
          formNome,
          formEmail,
          formTelefone,
          formFuncao,
        );
        setEquipe([...equipe, novo]);
      } else if (editandoId) {
        const atualizado = await atualizarMembroEquipe(
          editandoId,
          formNome,
          formTelefone,
          formFuncao,
          ativoOriginal,
        );
        setEquipe(equipe.map((m) => (m.id === editandoId ? atualizado : m)));
      }
      cancelarFormulario();
    } catch (error) {
      alert("Erro ao salvar dados.");
    }
  };

  const alternarStatus = async (membro: Usuario) => {
    const confirmacao = confirm(
      `Deseja realmente ${membro.ativo ? "INATIVAR" : "REATIVAR"} ${membro.nome}?`,
    );
    if (!confirmacao) return;

    try {
      const atualizado = await atualizarMembroEquipe(
        membro.id,
        membro.nome,
        membro.telefone || "",
        membro.funcao as "ADMIN" | "FUNCIONARIO",
        !membro.ativo,
      );
      setEquipe(equipe.map((m) => (m.id === membro.id ? atualizado : m)));
    } catch (e) {
      alert("Erro ao alterar status.");
    }
  };

  const renderFormulario = (éEdicao: boolean) => (
    <div className="p-4 bg-blue-50 dark:bg-gray-800 border-2 border-blue-200 rounded-xl grid grid-cols-1 md:grid-cols-12 gap-3 items-end mb-4 shadow-sm">
      <div className="md:col-span-3">
        <label className="text-xs font-bold text-blue-700 dark:text-blue-50 uppercase">
          Nome Completo
        </label>
        <input
          type="text"
          value={formNome}
          onChange={(e) => setFormNome(e.target.value)}
          className="w-full p-2 border rounded outline-none dark:text-white"
        />
      </div>
      <div className="md:col-span-3">
        <label className="text-xs font-bold text-blue-700 dark:text-blue-50 uppercase">
          Email (Login)
        </label>
        <input
          type="email"
          value={formEmail}
          onChange={(e) => setFormEmail(e.target.value)}
          disabled={éEdicao}
          className="w-full p-2 border rounded outline-none disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:text-gray-50"
          title={
            éEdicao ? "O email de login não pode ser alterado por aqui" : ""
          }
        />
      </div>
      <div className="md:col-span-2">
        <label className="text-xs font-bold text-blue-700 dark:text-white uppercase">
          Telefone
        </label>
        <input
          type="tel"
          value={formTelefone}
          onChange={(e) => setFormTelefone(e.target.value)}
          className="w-full p-2 border rounded outline-none dark:text-white"
        />
      </div>
      <div className="md:col-span-2">
        <label className="text-xs font-bold text-blue-700 dark:text-white uppercase">
          Permissão
        </label>
        <select
          value={formFuncao}
          onChange={(e) =>
            setFormFuncao(e.target.value as "ADMIN" | "FUNCIONARIO")
          }
          className="w-full p-2 border rounded outline-none bg-white dark:bg-gray-900 dark:text-white"
        >
          <option value="FUNCIONARIO">Barbeiro Padrão</option>
          <option value="ADMIN">Administrador</option>
        </select>
      </div>
      <div className="md:col-span-2 flex gap-2">
        <button
          onClick={() => salvarMembro(true)}
          className="flex-1 p-2 bg-green-600 text-white rounded hover:bg-green-700 dark:hover:bg-green-400 flex justify-center"
        >
          <Check size={20} />
        </button>
        <button
          onClick={cancelarFormulario}
          className="flex-1 p-2 bg-red-100 text-red-700 dark:text-white dark:bg-red-500 rounded hover:bg-red-200 dark:hover:bg-red-600 flex justify-center"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* CABEÇALHO E FILTRO */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-100">
        <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-white font-medium select-none">
          <input
            type="checkbox"
            checked={mostrarInativos}
            onChange={(e) => setMostrarInativos(e.target.checked)}
            className="w-4 h-4 text-blue-600 dark:text-white rounded"
          />
          Mostrar funcionários inativos
        </label>

        {!criandoNovo && (
          <button
            onClick={iniciarNovo}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-50 transition-colors font-medium"
          >
            <UserPlus size={20} /> Novo Membro
          </button>
        )}
      </div>

      {/* ÁREA DA LISTA */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 p-4">
        {criandoNovo && renderFormulario(false)}

        <div className="divide-y divide-gray-100">
          {equipeFiltrada.map((membro) => (
            <div key={membro.id}>
              {editandoId === membro.id ? (
                renderFormulario(true)
              ) : (
                <div
                  className={`p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors ${!membro.ativo ? "bg-gray-50 dark:bg-gray-700 opacity-60" : "hover:bg-gray-50 dark:hover:bg-gray-700"}`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-full ${membro.funcao === "ADMIN" || membro.funcao === "MASTER" ? "bg-purple-100 text-purple-700 dark:text-white" : "bg-blue-100 text-blue-700"}`}
                    >
                      {membro.funcao === "ADMIN" ||
                      membro.funcao === "MASTER" ? (
                        <Shield size={24} />
                      ) : (
                        <User size={24} />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-800 dark:text-white text-lg">
                          {membro.nome}
                        </p>
                        {!membro.ativo && (
                          <span className="text-xs bg-red-100 text-red-700 dark:text-white px-2 py-0.5 rounded-full font-bold">
                            INATIVO
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-200">
                        {membro.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 text-sm text-gray-600 dark:text-white">
                    <p>📱 {membro.telefone || "Sem telefone"}</p>
                    <p className="font-medium mt-1">
                      Cargo:{" "}
                      {membro.funcao === "MASTER"
                        ? "Dono (Master)"
                        : membro.funcao === "ADMIN"
                          ? "Administrador"
                          : "Barbeiro"}
                    </p>
                  </div>

                  {/* AÇÕES (Não deixa inativar/editar a si mesmo se for MASTER) */}
                  <div className="flex gap-2 shrink-0">
                    {membro.funcao !== "MASTER" && (
                      <>
                        <button
                          onClick={() => iniciarEdicao(membro)}
                          className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white rounded hover:bg-blue-50 hover:text-blue-600 dark:hover:text-blue-50 dark:hover:bg-blue-600 transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => alternarStatus(membro)}
                          className={`dark:bg-red-400 p-2 rounded flex items-center gap-1 transition-colors ${membro.ativo ? "bg-red-50 text-red-600 dark:text-white hover:bg-red-100 dark: hover:bg-red-500" : "bg-green-50 text-green-600 hover:bg-green-100"}`}
                          title={membro.ativo ? "Inativar" : "Reativar"}
                        >
                          {membro.ativo ? (
                            <ToggleLeft size={20} />
                          ) : (
                            <ToggleRight size={20} />
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
