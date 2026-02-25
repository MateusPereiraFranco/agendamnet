import Link from "next/link";
import { UserPlus } from "lucide-react";
import { buscarClientes } from "../../actions/clientes";
import ListaInterativa from "./ListaInterativa"; // Importando o nosso novo componente!
import { obterSessao } from "../../actions/auth";

export default async function ListaClientesPage() {
  const sessao = await obterSessao();
  if (!sessao) return null; // O middleware já mandou pro login

  // Olhe que lindeza: o sistema sabe quem está acessando!
  const { barbeariaId } = sessao;

  // 1. O Servidor busca os clientes no banco de dados primeiro
  const clientes = await buscarClientes(barbeariaId);

  return (
    <div className="space-y-6">
      {/* CABEÇALHO */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Meus Clientes
        </h1>

        <Link
          href="/clientes/novo"
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <UserPlus size={20} />
          <span>Novo Cliente</span>
        </Link>
      </div>

      {/* 2. Passamos os clientes para o componente interativo cuidar do resto! */}
      <ListaInterativa clientesIniciais={clientes} />
    </div>
  );
}
