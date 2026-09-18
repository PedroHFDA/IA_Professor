import Link from "next/link";
import { ArrowLeft, Plus, Search } from "lucide-react";

import { ThemeToggle } from "../theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const turma = [
  { aluno: "Joao", status: "Evoluindo", acertos: "7/10", dominio: 72 },
  { aluno: "Maria", status: "Reforco leve", acertos: "6/10", dominio: 61 },
  { aluno: "Pedro", status: "Precisa de apoio", acertos: "4/10", dominio: 38 },
];

const questoes = [
  "3(2x - 4) + 8 = 2x + 20",
  "5x - 2(3x - 1) = 14",
  "(x + 6) / 3 + 2x = 10",
];

export default function ProfessorPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-6xl px-5 py-5 sm:px-8">
        <nav className="flex items-center justify-between gap-4">
          <Link href="/" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            <ArrowLeft className="size-4" />
            Inicio
          </Link>
          <ThemeToggle />
        </nav>

        <header className="mt-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <Badge variant="secondary">Painel do professor</Badge>
            <h1 className="mt-4 text-3xl font-semibold tracking-normal sm:text-4xl">
              Acompanhamento tranquilo, com sinais claros de dificuldade.
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Crie atividades curtas, escolha questoes do banco e veja quais lacunas a IA
              encontrou durante a resolucao dos alunos.
            </p>
          </div>
          <Button size="lg">
            <Plus className="size-4" />
            Nova atividade
          </Button>
        </header>

        <div className="mt-8 grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
          <Card className="bg-card/80">
            <CardHeader>
              <CardTitle>Banco de questoes</CardTitle>
              <CardDescription>Exercicios prontos para o MVP de equacoes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2 size-4 text-muted-foreground" />
                <Input className="pl-8" placeholder="Buscar por assunto" />
              </div>

              <div className="space-y-3">
                {questoes.map((questao, index) => (
                  <div key={questao} className="rounded-xl border bg-background p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Questao {index + 1}</p>
                        <p className="mt-1 font-mono text-base font-semibold">{questao}</p>
                      </div>
                      <Badge variant={index === 0 ? "default" : "outline"}>
                        {index === 0 ? "Selecionada" : "Pronta"}
                      </Badge>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                      Avalia distributiva, isolamento da variavel e organizacao dos termos.
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80">
            <CardHeader>
              <CardTitle>Turma 8B, atividade de hoje</CardTitle>
              <CardDescription>
                Dados gerados a partir das tentativas guiadas pela IA tutora.
              </CardDescription>
              <CardAction>
                <Badge variant="secondary">28 alunos</Badge>
              </CardAction>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="desempenho">
                <TabsList>
                  <TabsTrigger value="desempenho">Desempenho</TabsTrigger>
                  <TabsTrigger value="lacunas">Lacunas</TabsTrigger>
                </TabsList>

                <TabsContent value="desempenho" className="mt-5 space-y-3">
                  {turma.map((linha) => (
                    <div key={linha.aluno} className="rounded-xl border bg-background p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium">{linha.aluno}</p>
                          <p className="text-xs text-muted-foreground">{linha.status}</p>
                        </div>
                        <Badge variant="outline">{linha.acertos}</Badge>
                      </div>
                      <Progress value={linha.dominio} className="mt-4">
                        <ProgressLabel>Dominio estimado</ProgressLabel>
                        <ProgressValue />
                      </Progress>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="lacunas" className="mt-5 space-y-4">
                  <Progress value={68}>
                    <ProgressLabel>Propriedade distributiva</ProgressLabel>
                    <ProgressValue />
                  </Progress>
                  <Progress value={54}>
                    <ProgressLabel>Troca de sinal ao isolar termos</ProgressLabel>
                    <ProgressValue />
                  </Progress>
                  <Progress value={37}>
                    <ProgressLabel>Conferencia substituindo x</ProgressLabel>
                    <ProgressValue />
                  </Progress>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
