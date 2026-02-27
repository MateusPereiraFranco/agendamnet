"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  Menu,
  X,
  Users,
  Calendar,
  LayoutDashboard,
  LineChart,
  ShieldAlert,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import { realizarLogout } from "../actions/auth";

export default function Sidebar({
  funcaoUsuario,
  nomeUsuario,
}: {
  funcaoUsuario?: string;
  nomeUsuario?: string;
}) {
  const [menuAberto, setMenuAberto] = useState(false);

  // Lógica do Tema
  const { theme, setTheme } = useTheme();
  const [montado, setMontado] = useState(false);

  // Garante que o ícone do tema só renderize no cliente (evita erros no Next.js)
  useEffect(() => setMontado(true), []);

  const links = [
    { nome: "Início", rota: "/", icone: <LayoutDashboard size={20} /> },
    { nome: "Agenda", rota: "/agenda", icone: <Calendar size={20} /> },
    { nome: "Clientes", rota: "/clientes", icone: <Users size={20} /> },
    { nome: "Fechamento", rota: "/fechamento", icone: <LineChart size={20} /> },
  ];

  if (funcaoUsuario !== "FUNCIONARIO") {
    links.push({
      nome: "Equipe",
      rota: "/equipe",
      icone: <ShieldAlert size={20} />,
    });
  }

  const sair = async () => {
    await realizarLogout();
    window.location.href = "/login";
  };

  return (
    <>
      {/* BARRA SUPERIOR PARA CELULAR */}
      <div className="md:hidden flex items-center justify-between bg-gray-900 dark:bg-gray-950 text-white p-4 transition-colors">
        <span className="text-green-200 font-bold text-xl">AGENDA MNET</span>
        <button onClick={() => setMenuAberto(!menuAberto)}>
          {menuAberto ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* MENU LATERAL (Sidebar) */}
      <div
        className={`
        fixed inset-y-0 left-0 transform bg-gray-900 dark:bg-gray-950 text-white w-64 p-6 transition-transform duration-300 ease-in-out z-50
        ${menuAberto ? "translate-x-0" : "-translate-x-full"} 
        md:relative md:translate-x-0
        flex flex-col border-r border-gray-800
      `}
      >
        <div className="text-green-200 hidden md:block text-2xl font-bold mb-8">
          AGENDA MNET
        </div>

        <nav className="space-y-4">
          {links.map((link) => (
            <Link
              key={link.nome}
              href={link.rota}
              onClick={() => setMenuAberto(false)}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-800 transition-colors"
            >
              {link.icone}
              <span>{link.nome}</span>
            </Link>
          ))}
        </nav>

        {/* RODAPÉ DO MENU */}
        <div className="mt-auto pt-8 border-t border-gray-800 space-y-4">
          {/* BOTÃO DE TEMA */}
          {montado && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex items-center justify-between w-full p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              <span className="text-sm font-medium">
                Modo {theme === "dark" ? "Claro" : "Escuro"}
              </span>
              {theme === "dark" ? (
                <Sun size={18} className="text-yellow-400" />
              ) : (
                <Moon size={18} className="text-blue-400" />
              )}
            </button>
          )}

          <div>
            {nomeUsuario && (
              <div className="mb-2 text-sm text-gray-400 px-3">
                Olá, <span className="font-bold text-white">{nomeUsuario}</span>
              </div>
            )}

            <button
              onClick={sair}
              className="flex items-center gap-3 p-3 w-full rounded-lg text-red-400 hover:bg-red-500 hover:text-white transition-colors"
            >
              <LogOut size={20} />
              <span>Sair do Sistema</span>
            </button>
          </div>
        </div>
      </div>

      {menuAberto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setMenuAberto(false)}
        />
      )}
    </>
  );
}
