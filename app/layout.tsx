import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "../components/Sidebar";
import { cookies } from "next/headers";
import { ThemeProvider } from "./ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sistema de Barbearia",
  description: "SaaS para gestão de barbearias",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const funcao = cookieStore.get("saas_funcao")?.value;
  const nome = cookieStore.get("saas_usuario_nome")?.value;

  const logado = !!funcao;

  return (
    // suppressHydrationWarning é OBRIGATÓRIO para o next-themes funcionar no Next.js
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${inter.className} flex flex-col md:flex-row min-h-screen bg-gray-100 dark:bg-gray-800 text-gray-900 dark:bg-gray-950 dark:text-gray-100 transition-colors duration-300`}
      >
        <ThemeProvider>
          {logado && <Sidebar funcaoUsuario={funcao} nomeUsuario={nome} />}

          <main className=" bg-white dark:bg-gray-900 flex-1 overflow-y-auto flex-1 p-4 pb-10 md:p-8">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
