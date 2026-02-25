import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const caminho = request.nextUrl.pathname;

  // Pegamos os crachás
  const usuarioId = request.cookies.get("saas_usuario_id")?.value;
  const funcao = request.cookies.get("saas_funcao")?.value;

  const rotaPublica = caminho === "/login";

  // REGRA 1: Não tá logado e tentou acessar o sistema? Vai pro login!
  if (!rotaPublica && !usuarioId) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // REGRA 2: Tá logado e tentou acessar a tela de login? Vai pro Dashboard!
  if (rotaPublica && usuarioId) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // REGRA 3: É funcionário comum e tentou acessar a Equipe? Bloqueado!
  if (caminho.startsWith("/equipe") && funcao === "FUNCIONARIO") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next(); // Tudo certo, pode passar!
}

// Dizemos ao guarda para vigiar o site inteiro, exceto imagens e arquivos do Next
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
