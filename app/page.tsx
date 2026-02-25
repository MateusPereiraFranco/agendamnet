import Link from "next/link";
import { CalendarPlus, Users, CalendarDays, TrendingUp } from "lucide-react";
import { buscarAgendaHoje } from "../actions/agendamentos";
import ListaAgendaDashboard from "../components/ListaAgendaDashboard";
import { obterSessao } from "../actions/auth";

export default async function DashboardPage() {
  const sessao = await obterSessao();
  if (!sessao) return null;

  const { barbeariaId, usuarioId, nome, barbeariaNome } = sessao;

  const agendaDeHoje = await buscarAgendaHoje(barbeariaId, usuarioId);

  // Calcula o Faturamento e Cortes de hoje (Apenas os que o status é 'concluido')

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-50">
            {barbeariaNome}
          </h1>
          <p className="text-gray-500 dark:text-gray-50 font-medium">{nome}</p>
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <Link
            href="/agenda"
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-800 text-white dark:text-gray-100 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <CalendarPlus size={20} />
            <span>Agendamento</span>
          </Link>
          <Link
            href="/clientes"
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-950 text-gray-800 dark:text-gray-50 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Users size={20} />
            <span>Ver Clientes</span>
          </Link>
        </div>
      </div>

      {/* COMPONENTE INTERATIVO DA AGENDA */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
          <h2 className="font-bold text-gray-800 dark:text-gray-50 flex items-center gap-2">
            <CalendarDays
              size={20}
              className="text-blue-600 dark:text-blue-200"
            />
            Sua Agenda de Hoje
          </h2>
        </div>

        {/* Passa a agenda buscada no banco para o componente */}
        <ListaAgendaDashboard
          agendaInicial={agendaDeHoje}
          barbeariaId={barbeariaId}
        />
      </div>
    </div>
  );
}
