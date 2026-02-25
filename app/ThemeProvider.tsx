"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark" /* A MÁGICA ESTÁ AQUI! */
      enableSystem={
        false
      } /* Desligamos o sistema para forçar o dark mode no primeiro acesso */
    >
      {children}
    </NextThemesProvider>
  );
}
