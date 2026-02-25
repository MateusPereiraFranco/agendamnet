import { buscarUsuariosDaBarbearia } from "../../actions/usuarios";
import FechamentoInterativo from "./FechamentoInterativo";
import { obterSessao } from "../../actions/auth";

export default async function FechamentoPage() {
  const sessao = await obterSessao();
  if (!sessao) return null; // O middleware já mandou pro login

  // Olhe que lindeza: o sistema sabe quem está acessando!
  const { barbeariaId } = sessao;

  // Busca os barbeiros para colocarmos no filtro "Profissional"
  const barbeiros = await buscarUsuariosDaBarbearia(barbeariaId);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            Fechamento de Caixa
          </h1>
          <p className="text-gray-500 dark:text-gray-100">
            Acompanhe o faturamento e o desempenho da equipe
          </p>
        </div>
      </div>

      <FechamentoInterativo barbeariaId={barbeariaId} barbeiros={barbeiros} />
    </div>
  );
}
