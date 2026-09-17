"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  role: "user" | "model";
  text: string;
};

const EXERCICIO = "2x + 6 = 14";

const MENSAGEM_INICIAL: Message = {
  role: "model",
  text: `Vamos praticar equação do primeiro grau. Resolva: ${EXERCICIO}. Qual você acha que é o primeiro passo pra começar a resolver isso?`,
};

export default function TutorPage() {
  const [messages, setMessages] = useState<Message[]>([MENSAGEM_INICIAL]);
  const [input, setInput] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const fimDaConversaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fimDaConversaRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function enviarMensagem() {
    const texto = input.trim();
    if (!texto || carregando) return;

    const novoHistorico: Message[] = [...messages, { role: "user", text: texto }];
    setMessages(novoHistorico);
    setInput("");
    setCarregando(true);
    setErro(null);

    try {
      const resposta = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: novoHistorico }),
      });

      if (!resposta.ok) {
        throw new Error("Falha ao consultar o tutor");
      }

      const dados = await resposta.json();
      setMessages((atual) => [...atual, { role: "model", text: dados.reply }]);
    } catch {
      setErro(
        "Não consegui falar com o tutor agora. Confira a chave de IA no arquivo .env.local e tente de novo."
      );
    } finally {
      setCarregando(false);
    }
  }

  function aoPressionarTecla(evento: React.KeyboardEvent<HTMLInputElement>) {
    if (evento.key === "Enter") {
      enviarMensagem();
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <h1 className="text-lg font-semibold text-slate-800">
          Tutor de matemática, versão de demonstração
        </h1>
        <p className="text-sm text-slate-500">
          Exercício de hoje: equação do primeiro grau
        </p>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-3 px-4 py-6">
        {messages.map((mensagem, indice) => (
          <div
            key={indice}
            className={`flex ${
              mensagem.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                mensagem.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-800 shadow-sm ring-1 ring-slate-200"
              }`}
            >
              {mensagem.text}
            </div>
          </div>
        ))}

        {carregando && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl bg-white px-4 py-2 text-sm text-slate-400 shadow-sm ring-1 ring-slate-200">
              o tutor está pensando...
            </div>
          </div>
        )}

        {erro && (
          <div className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600 ring-1 ring-red-200">
            {erro}
          </div>
        )}

        <div ref={fimDaConversaRef} />
      </main>

      <footer className="border-t border-slate-200 bg-white px-4 py-4">
        <div className="mx-auto flex w-full max-w-2xl gap-2">
          <input
            value={input}
            onChange={(evento) => setInput(evento.target.value)}
            onKeyDown={aoPressionarTecla}
            placeholder="Escreva sua resposta ou seu raciocínio aqui"
            className="flex-1 rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-blue-500"
            disabled={carregando}
          />
          <button
            onClick={enviarMensagem}
            disabled={carregando || !input.trim()}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
          >
            Enviar
          </button>
        </div>
      </footer>
    </div>
  );
}
