"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Scissors } from "lucide-react";
import { realizarLogin } from "../../actions/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      await realizarLogin(email, senha);
      // Login deu certo? Recarrega o site inteiro para atualizar o menu lateral
      window.location.href = "/";
    } catch (err: any) {
      setErro(err.message);
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden p-8">
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="bg-blue-600 p-4 rounded-full text-white dark:text-gray-200 mb-4">
            <Scissors size={40} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            SaaS Barbearia
          </h1>
          <p className="text-gray-500 dark:text-gray-200">
            Faça login para gerenciar sua agenda
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1 uppercase">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 text-black dark:text-gray-200"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1 uppercase">
              Senha
            </label>
            <input
              type="password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 text-black dark:text-gray-200"
              placeholder="••••••"
            />
          </div>

          {erro && (
            <div className="p-3 bg-red-50 text-red-600 dark:text-red-200 rounded-lg text-sm text-center font-medium">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors"
          >
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
