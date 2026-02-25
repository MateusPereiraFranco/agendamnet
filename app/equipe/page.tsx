import { buscarTodosUsuariosAdmin } from "../../actions/usuarios";
import ListaEquipe from "./ListaEquipe";
import { obterSessao } from "../../actions/auth";

export default async function EquipePage() {
  const sessao = await obterSessao();
  if (!sessao) return null;

  const { barbeariaId } = sessao;

  const equipe = await buscarTodosUsuariosAdmin(barbeariaId);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Gestão de Equipe
          </h1>
          <p className="text-gray-500 dark:text-gray-200">
            Cadastre barbeiros, defina permissões e ative/inative acessos
          </p>
        </div>
      </div>

      <ListaEquipe barbeariaId={barbeariaId} equipeInicial={equipe} />
    </div>
  );
}
