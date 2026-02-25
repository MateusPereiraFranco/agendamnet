"use client"; // Diz ao Next.js que esta página interage com o usuário (tem botões, campos de texto)

import { useState } from "react";
// Importando a Server Action que criamos (o caminho pode variar, mas geralmente é com @ ou ../)
import { cadastrarCliente } from "../../../actions/clientes";

export default function ClientesPage() {
  // O 'useState' é a memória de curto prazo do React. Ele guarda o que o usuário digita.
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);

  // ⚠️ SUBSTITUA AQUI PELO ID DA BARBEARIA QUE VOCÊ COPIOU NO SUPABASE
  const BARBEARIA_ID_TESTE = "4a649727-5473-4f95-b44a-ba89433d87d9";

  // Função disparada quando o usuário clica no botão "Salvar"
  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault(); // Evita que a página recarregue (padrão de sites modernos)
    setCarregando(true);
    setMensagem("Salvando...");

    try {
      // Chama a função do servidor passando os dados digitados
      const novoCliente = await cadastrarCliente(
        nome,
        telefone,
        dataNascimento,
        BARBEARIA_ID_TESTE,
      );

      setMensagem(
        `Sucesso! ${novoCliente.nome} cadastrado com o Código #${novoCliente.codigo}`,
      );

      // Limpa os campos após salvar
      setNome("");
      setTelefone("");
      setDataNascimento("");
    } catch (error) {
      console.error(error);
      setMensagem("Erro ao salvar. Verifique o console.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-700 p-4 md:p-8">
      {/* O Tailwind cuida para o cartão ficar no centro e com tamanho máximo agradável */}
      <div className="max-w-md mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 text-center">
          Novo Cliente
        </h2>

        <form onSubmit={handleSalvar} className="space-y-4">
          {/* Campo de Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Nome Completo *
            </label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black dark:text-gray-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Ex: João da Silva"
            />
          </div>

          {/* Campo de Telefone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Telefone (WhatsApp)
            </label>
            <input
              type="tel"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black dark:text-gray-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="(11) 99999-9999"
            />
          </div>

          {/* Campo de Data de Nascimento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Data de Nascimento
            </label>
            <input
              type="date"
              value={dataNascimento}
              onChange={(e) => setDataNascimento(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black dark:text-gray-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Botão de Salvar */}
          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-blue-600 text-white dark:text-gray-100 font-bold py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {carregando ? "Salvando..." : "Salvar Cliente"}
          </button>
        </form>

        {/* Mensagem de Feedback (Sucesso ou Erro) */}
        {mensagem && (
          <div className="mt-4 p-3 rounded bg-blue-50 text-blue-800 dark:text-blue-100 dark:bg-gray-800 text-center text-sm font-medium">
            {mensagem}
          </div>
        )}
      </div>
    </div>
  );
}
