"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Send } from "lucide-react";

import { ThemeToggle } from "../theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";

type Message = {
  role: "user" | "model";
  text: string;
};

const EXERCICIO = "3(2x - 4) + 8 = 2x + 20";

const MENSAGEM_INICIAL: Message = {
  role: "model",
  text: `Vamos resolver uma equacao com distributiva e termos dos dois lados: ${EXERCICIO}. Antes de tentar isolar o x, qual e o primeiro passo para lidar com os parenteses?`,
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
        "Nao consegui falar com o tutor agora. Confira a chave de IA no arquivo .env.local e tente de novo."
      );
    } finally {
      setCarregando(false);
    }
  }

  function aoPressionarTecla(evento: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (evento.key === "Enter" && (evento.ctrlKey || evento.metaKey)) {
      enviarMensagem();
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-5 sm:px-8">
        <nav className="flex items-center justify-between gap-4">
          <Link href="/" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            <ArrowLeft className="size-4" />
            Inicio
          </Link>
          <ThemeToggle />
        </nav>

        <div className="mt-6 grid flex-1 gap-5 lg:grid-cols-[300px_1fr_300px]">
          <aside className="space-y-4">
            <Card className="bg-card/80">
              <CardHeader>
                <Badge variant="secondary" className="w-fit">
                  Aluno
                </Badge>
                <CardTitle>Atividade assistida</CardTitle>
                <CardDescription>
                  Resolva mostrando o raciocinio. A IA vai ajudar com perguntas, nao com a
                  resposta pronta.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card/80">
              <CardHeader>
                <CardTitle>Questao 1</CardTitle>
                <CardDescription>Equacao de 1o grau com distributiva.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="rounded-xl border bg-background p-4 font-mono text-2xl font-semibold">
                  {EXERCICIO}
                </p>
                <div className="mt-4 rounded-xl border border-dashed bg-muted/60 p-3">
                  <p className="text-xs font-medium text-muted-foreground">Exemplo de erro comum</p>
                  <p className="mt-1 font-mono text-sm">6x - 4 + 8 = 2x + 20</p>
                </div>
              </CardContent>
            </Card>
          </aside>

          <Card className="flex min-h-[72vh] bg-card/80">
            <CardHeader className="border-b">
              <CardTitle>Conversa com a IA tutora</CardTitle>
              <CardDescription>
                Cada resposta deve aproximar o aluno do proximo passo.
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col px-0 pb-0">
              <div className="flex-1 space-y-4 overflow-y-auto bg-background/70 p-4">
                {messages.map((mensagem, indice) => (
                  <div
                    key={indice}
                    className={`flex ${mensagem.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[86%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                        mensagem.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "border bg-card text-card-foreground"
                      }`}
                    >
                      {mensagem.text}
                    </div>
                  </div>
                ))}

                {carregando && (
                  <div className="flex justify-start">
                    <div className="max-w-[86%] rounded-2xl border bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm">
                      A IA esta lendo o raciocinio...
                    </div>
                  </div>
                )}

                {erro && (
                  <div className="rounded-xl border border-destructive bg-card px-4 py-3 text-sm text-destructive">
                    {erro}
                  </div>
                )}

                <div ref={fimDaConversaRef} />
              </div>

              <div className="border-t p-4">
                <Textarea
                  value={input}
                  onChange={(evento) => setInput(evento.target.value)}
                  onKeyDown={aoPressionarTecla}
                  placeholder="Escreva seu passo a passo. Ex: apliquei a distributiva..."
                  disabled={carregando}
                  className="min-h-24 resize-none bg-background"
                />
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">Use Ctrl + Enter para enviar.</p>
                  <Button onClick={enviarMensagem} disabled={carregando || !input.trim()}>
                    <Send className="size-4" />
                    Enviar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <aside className="space-y-4">
            <Card className="bg-card/80">
              <CardHeader>
                <CardTitle>Analise esperada</CardTitle>
                <CardDescription>Sinais que a IA deve observar nesta questao.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Badge variant="outline">Distributiva</Badge>
                <Badge variant="outline">Termos semelhantes</Badge>
                <Badge variant="outline">Isolamento de x</Badge>
              </CardContent>
            </Card>

            <Card className="bg-card/80">
              <CardHeader>
                <CardTitle>Progresso da tentativa</CardTitle>
                <CardDescription>Exemplo de leitura para a demo.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={64}>
                  <ProgressLabel>Distributiva</ProgressLabel>
                  <ProgressValue />
                </Progress>
                <Progress value={46}>
                  <ProgressLabel>Organizacao dos termos</ProgressLabel>
                  <ProgressValue />
                </Progress>
              </CardContent>
            </Card>

            <Card className="bg-card/80">
              <CardHeader>
                <CardTitle>Reforco sugerido</CardTitle>
                <CardDescription>
                  Uma lista curta de exercicios com parenteses antes de passar para questoes
                  com fracoes.
                </CardDescription>
              </CardHeader>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}
