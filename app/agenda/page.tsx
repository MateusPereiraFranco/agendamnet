import { buscarAgendaPorData } from "../../actions/agendamentos";
import { buscarUsuariosDaBarbearia } from "../../actions/usuarios"; // Nova importação!
import AgendaInterativa from "./AgendaInterativa";
import { obterSessao } from "../../actions/auth";

export default async function AgendaPage() {
  const sessao = await obterSessao();
  if (!sessao) return null; // O middleware já mandou pro login

  // Olhe que lindeza: o sistema sabe quem está acessando!
  const { barbeariaId, usuarioId, nome } = sessao;

  const hojeDate = new Date();
  const hojeString = hojeDate.toISOString().split("T")[0];

  // 1. Busca a agenda do usuário logado para o dia de hoje
  const agendaDeHoje = await buscarAgendaPorData(
    barbeariaId,
    usuarioId,
    hojeString,
  );

  // 2. Busca todos os barbeiros da barbearia para montar o Dropdown
  const barbeiros = await buscarUsuariosDaBarbearia(barbeariaId);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Agenda da Equipe
          </h1>
          <p className="text-gray-500 dark:text-gray-200">
            Gerencie os horários de todos os profissionais
          </p>
        </div>
      </div>

      {/* Passamos a lista de barbeiros e quem está logado para o componente */}
      <AgendaInterativa
        agendaInicial={agendaDeHoje}
        barbeariaId={barbeariaId}
        usuarioLogadoId={usuarioId}
        dataInicial={hojeString}
        barbeiros={barbeiros}
      />
    </div>
  );
}
