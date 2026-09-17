import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <div className="max-w-xl">
        <p className="text-sm font-medium uppercase tracking-wide text-blue-600">
          Tech4Change 2026, PosTech FIAP
        </p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
          Uma IA que orienta, não entrega a resposta pronta
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-600">
          Protótipo de demonstração de uma plataforma que ajuda estudantes do
          fundamental e médio a construir hábito de estudo. Em vez de dar a
          resposta de um exercício, a IA faz perguntas guiadas até o aluno
          chegar sozinho na solução, construindo autonomia em vez de
          dependência.
        </p>
        <Link
          href="/tutor"
          className="mt-8 inline-block rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Testar o fluxo de tutoria
        </Link>
      </div>
    </div>
  );
}
