"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  BookOpen,
  Brain,
  Camera,
  Check,
  ChevronRight,
  ClipboardList,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Plus,
  Search,
  Settings,
  Sparkles,
  Trash2,
  Upload,
  UserRound,
  Users,
} from "lucide-react";

import { ThemeToggle } from "./theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";

type Role = "professor" | "student";
type AppView =
  | "login"
  | "teacher-overview"
  | "teacher-activities"
  | "teacher-new-activity"
  | "teacher-results"
  | "teacher-student"
  | "student-activities"
  | "student-solve"
  | "student-progress";
type ActivityStatus = "Rascunho" | "Ativa" | "Concluida";
type StudentActivityStatus = "Nao iniciada" | "Em andamento" | "Concluida";
type Attempt = {
  id: string;
  number: number;
  answer: string;
  imageName?: string;
  correct: boolean;
  detectedError?: string;
  knowledgeGap?: string;
  guidance: string;
};
type TutorMessage = {
  role: "user" | "model";
  text: string;
};
type Activity = {
  id: string;
  title: string;
  subject: string;
  topic: string;
  status: ActivityStatus;
  questions: string[];
  students: number;
  completed: number;
};
type DemoState = {
  activities: Activity[];
  studentStatus: StudentActivityStatus;
  attempts: Attempt[];
  messages: TutorMessage[];
  completed: boolean;
};

const STORAGE_KEY = "ia-professor-mvp-state";

const QUESTION_BANK = [
  {
    id: "q1",
    subject: "Matematica",
    topic: "Equacoes de 1o grau",
    difficulty: "Facil",
    statement: "2x + 5 = 15",
    focus: "Operacoes inversas",
  },
  {
    id: "q2",
    subject: "Matematica",
    topic: "Equacoes de 1o grau",
    difficulty: "Facil",
    statement: "3x - 6 = 12",
    focus: "Isolamento da variavel",
  },
  {
    id: "q3",
    subject: "Matematica",
    topic: "Equacoes de 1o grau",
    difficulty: "Media",
    statement: "4x + 8 = 24",
    focus: "Operacoes basicas",
  },
  {
    id: "q4",
    subject: "Matematica",
    topic: "Equacoes de 1o grau",
    difficulty: "Media",
    statement: "5x - 10 = 20",
    focus: "Manipulacao algebrica",
  },
];

const INITIAL_MESSAGES: TutorMessage[] = [
  {
    role: "model",
    text: "Envie sua resolucao quando terminar. Eu vou olhar seu raciocinio e fazer uma pergunta para ajudar, sem entregar a resposta.",
  },
];

const DEFAULT_STATE: DemoState = {
  activities: [
    {
      id: "act-1",
      title: "Equacoes de 1o grau",
      subject: "Matematica",
      topic: "Equacoes",
      status: "Ativa",
      questions: ["2x + 5 = 15", "3x - 6 = 12", "4x + 8 = 24"],
      students: 24,
      completed: 18,
    },
    {
      id: "act-2",
      title: "Operacoes inversas",
      subject: "Matematica",
      topic: "Equacoes",
      status: "Concluida",
      questions: ["5x - 10 = 20"],
      students: 24,
      completed: 24,
    },
  ],
  studentStatus: "Em andamento",
  attempts: [
    {
      id: "att-1",
      number: 1,
      answer: "x = 10",
      imageName: "resolucao-pedro.jpg",
      correct: false,
      detectedError: "Erro no isolamento da variavel",
      knowledgeGap: "Operacoes inversas",
      guidance:
        "Voce encontrou um valor para x, mas vamos revisar seu raciocinio. Qual operacao voce precisa fazer primeiro para eliminar o +5?",
    },
  ],
  messages: [
    ...INITIAL_MESSAGES,
    { role: "user", text: "Minha primeira tentativa foi x = 10." },
    {
      role: "model",
      text: "Voce encontrou um valor para x, mas vamos revisar seu raciocinio. Qual operacao voce precisa fazer primeiro para eliminar o +5?",
    },
  ],
  completed: false,
};

const STUDENTS = [
  { name: "Joao", initials: "JO", correct: "8/10", progress: 82, status: "Bom progresso" },
  { name: "Maria", initials: "MA", correct: "6/10", progress: 66, status: "Evoluindo" },
  { name: "Pedro", initials: "PE", correct: "4/10", progress: 48, status: "Precisa de atencao" },
];

const DIFFICULTIES = [
  { name: "Operacoes inversas", percent: 70, students: "5 alunos", tone: "bg-amber-500" },
  { name: "Equacoes basicas", percent: 50, students: "4 alunos", tone: "bg-blue-500" },
  { name: "Isolamento da variavel", percent: 30, students: "3 alunos", tone: "bg-emerald-500" },
];

function loadState(): DemoState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return DEFAULT_STATE;

    const parsed = { ...DEFAULT_STATE, ...JSON.parse(saved) } as DemoState;
    return {
      ...parsed,
      messages: parsed.messages.filter((message, index, messages) => {
        const previous = messages[index - 1];
        return !previous || previous.role !== message.role || previous.text !== message.text;
      }),
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export default function Home() {
  const [role, setRole] = useState<Role>("professor");
  const [view, setView] = useState<AppView>("login");
  const [state, setState] = useState<DemoState>(DEFAULT_STATE);
  const [loaded, setLoaded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>(["q1", "q2", "q3"]);
  const [activityTitle, setActivityTitle] = useState("Lista de Equacoes");
  const [answer, setAnswer] = useState("");
  const [imageName, setImageName] = useState("");
  const [analysisStage, setAnalysisStage] = useState<
    "idle" | "uploading" | "analyzing" | "done" | "error"
  >("idle");
  const [chatInput, setChatInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setState(loadState());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [loaded, state]);

  const activeActivity = state.activities[0];
  const lastAttempt = state.attempts[state.attempts.length - 1];
  const hasCorrectAttempt = state.attempts.some((attempt) => attempt.correct);
  const teacherName = "Professor Joao";
  const studentName = "Pedro";

  const navItems = useMemo(
    () =>
      role === "professor"
        ? [
            { label: "Visao geral", view: "teacher-overview" as AppView, icon: LayoutDashboard },
            { label: "Atividades", view: "teacher-activities" as AppView, icon: ClipboardList },
            { label: "Alunos", view: "teacher-student" as AppView, icon: Users },
            { label: "Desempenho", view: "teacher-results" as AppView, icon: BookOpen },
          ]
        : [
            { label: "Inicio", view: "student-activities" as AppView, icon: LayoutDashboard },
            { label: "Minhas atividades", view: "student-activities" as AppView, icon: ClipboardList },
            { label: "Meu progresso", view: "student-progress" as AppView, icon: BookOpen },
          ],
    [role]
  );

  function signIn(nextRole: Role) {
    setRole(nextRole);
    setView(nextRole === "professor" ? "teacher-overview" : "student-activities");
  }

  function saveActivity(sendNow: boolean) {
    const questions = QUESTION_BANK.filter((question) => selectedQuestions.includes(question.id));
    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      title: activityTitle || "Nova atividade",
      subject: "Matematica",
      topic: "Equacoes de 1o grau",
      status: sendNow ? "Ativa" : "Rascunho",
      questions: questions.map((question) => question.statement),
      students: 24,
      completed: 0,
    };
    setState((current) => ({
      ...current,
      activities: [newActivity, ...current.activities],
      studentStatus: sendNow ? "Nao iniciada" : current.studentStatus,
    }));
    setToast(sendNow ? "Atividade enviada com sucesso. 24 alunos receberam esta atividade." : "Rascunho salvo.");
    setView("teacher-activities");
  }

  async function requestTutorReply(history: TutorMessage[], attempts: Attempt[]) {
    const response = await fetch("/api/tutor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        history,
        context: {
          role: "tutor",
          question: "2x + 5 = 15",
          student: studentName,
          attempts,
          instruction:
            "A IA deve analisar a tentativa do aluno, identificar lacunas e orientar com pistas ou perguntas, sem entregar a resposta final.",
        },
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error ?? "Tutor IA indisponivel no momento.");
    }

    return String(data.reply ?? "").trim();
  }

  async function submitAttempt() {
    if (!answer.trim() && !imageName) return;
    setAiError(null);
    setAnalysisStage(imageName ? "uploading" : "analyzing");
    await wait(650);
    setAnalysisStage("analyzing");
    await wait(900);

    const correct = /x\s*=\s*5\b/i.test(answer);
    const answerText = answer.trim() || "Resolucao enviada por foto";
    const attempt: Attempt = {
      id: `att-${Date.now()}`,
      number: state.attempts.length + 1,
      answer: answerText,
      imageName: imageName || undefined,
      correct,
      detectedError: correct ? undefined : "Erro no isolamento da variavel",
      knowledgeGap: correct ? undefined : "Operacoes inversas",
      guidance: correct ? "Boa! Voce chegou a solucao correta." : "Orientacao pendente do Tutor IA.",
    };
    const nextAttempts = [...state.attempts, attempt];
    const nextHistory: TutorMessage[] = [
      ...state.messages,
      { role: "user", text: `Minha resolucao: ${answerText}` },
    ];

    try {
      const reply = await requestTutorReply(nextHistory, nextAttempts);
      const guidance = reply || attempt.guidance;

      setState((current) => ({
        ...current,
        studentStatus: correct ? "Concluida" : "Em andamento",
        completed: correct,
        attempts: [...current.attempts, { ...attempt, guidance }],
        messages: [...nextHistory, { role: "model", text: guidance }],
      }));
      setAnalysisStage("done");
      setAnswer("");
      setImageName("");
      setToast(correct ? "Progresso registrado." : "Orientacao disponivel para uma nova tentativa.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Tutor IA indisponivel no momento. Tente novamente em instantes.";

      setState((current) => ({
        ...current,
        studentStatus: "Em andamento",
        attempts: [...current.attempts, attempt],
        messages: nextHistory,
      }));
      setAiError(message);
      setAnalysisStage("error");
      setToast("Tutor IA indisponivel. Sua resolucao foi registrada, mas a orientacao nao foi gerada.");
    }
  }

  async function sendTutorMessage() {
    const text = chatInput.trim();
    if (!text || aiLoading) return;
    const nextHistory: TutorMessage[] = [...state.messages, { role: "user", text }];
    setState((current) => ({ ...current, messages: nextHistory }));
    setChatInput("");
    setAiError(null);
    setAiLoading(true);

    try {
      const reply = await requestTutorReply(nextHistory, state.attempts);
      setState((current) => ({
        ...current,
        messages: [...current.messages, { role: "model", text: reply }],
      }));
    } catch (error) {
      setAiError(
        error instanceof Error
          ? error.message
          : "Tutor IA indisponivel no momento. Tente novamente em instantes."
      );
    } finally {
      setAiLoading(false);
    }
  }

  if (view === "login") {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-5 py-8">
          <section className="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <Badge variant="secondary">MVP EdTech com IA</Badge>
              <h1 className="mt-5 max-w-xl text-4xl font-semibold leading-tight sm:text-5xl">
                IA Professor
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
                Professores enviam atividades, alunos resolvem com apoio tutorado e a escola
                enxerga lacunas reais de aprendizagem.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {["Erro", "Pista", "Progresso"].map((label, index) => (
                  <div key={label} className="rounded-lg border bg-card p-4">
                    <p className="text-xs text-muted-foreground">Etapa {index + 1}</p>
                    <p className="mt-1 font-medium">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <Card className="mx-auto w-full max-w-md shadow-sm">
              <CardHeader>
                <div className="mb-3 flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <GraduationCap className="size-6" />
                </div>
                <CardTitle className="text-2xl">Bem-vindo</CardTitle>
                <CardDescription>Entre para continuar seus estudos.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="block text-sm font-medium">
                  E-mail
                  <Input className="mt-2" defaultValue="demo@iaprofessor.com" type="email" />
                </label>
                <label className="block text-sm font-medium">
                  Senha
                  <Input className="mt-2" defaultValue="123456" type="password" />
                </label>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <label className="flex items-center gap-2 text-muted-foreground">
                    <input className="size-4 accent-primary" type="checkbox" defaultChecked />
                    Lembrar de mim
                  </label>
                  <button className="text-primary">Esqueci minha senha</button>
                </div>
                <div className="rounded-lg border bg-muted/50 p-3">
                  <p className="text-sm font-medium">Entrar como</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Button onClick={() => signIn("professor")}>Professor</Button>
                    <Button variant="outline" onClick={() => signIn("student")}>
                      Aluno
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 border-r bg-sidebar p-4 transition-transform md:sticky md:translate-x-0 ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Brain className="size-5" />
            </div>
            <div>
              <p className="font-semibold">IA Professor</p>
              <p className="text-xs text-muted-foreground">Tutor, atividades e progresso</p>
            </div>
          </div>

          <nav className="mt-8 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  setView(item.view);
                  setMenuOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${
                  view === item.view ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-muted"
                }`}
              >
                <item.icon className="size-4" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="absolute bottom-4 left-4 right-4 space-y-2">
            <div className="rounded-lg border bg-card p-3">
              <p className="text-sm font-medium">{role === "professor" ? teacherName : studentName}</p>
              <p className="text-xs text-muted-foreground">
                {role === "professor" ? "Matematica" : "Turma A"}
              </p>
            </div>
            <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted">
              <Settings className="size-4" />
              Configuracoes
            </button>
            <button
              onClick={() => setView("login")}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
            >
              <LogOut className="size-4" />
              Sair
            </button>
          </div>
        </aside>

        {menuOpen && (
          <button
            aria-label="Fechar menu"
            className="fixed inset-0 z-30 bg-foreground/20 md:hidden"
            onClick={() => setMenuOpen(false)}
          />
        )}

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur md:px-6">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setMenuOpen(true)} className="md:hidden">
                <Menu className="size-5" />
              </Button>
              <div>
                <p className="text-sm font-medium">
                  {role === "professor" ? teacherName : `Ola, ${studentName}`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {role === "professor"
                    ? "Acompanhe lacunas e evolucao da turma."
                    : "Continue seus estudos com apoio do Tutor IA."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Bell className="size-4" />
              </Button>
              <ThemeToggle />
              <Avatar initials={role === "professor" ? "PJ" : "PE"} />
            </div>
          </header>

          <div className="w-full max-w-7xl px-4 py-6 md:px-6">
            {toast && (
              <div className="mb-4 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
                <span>{toast}</span>
                <button onClick={() => setToast(null)}>Fechar</button>
              </div>
            )}

            {view === "teacher-overview" && (
              <TeacherOverview
                attempts={state.attempts}
                onActivities={() => setView("teacher-activities")}
                onResults={() => setView("teacher-results")}
                onStudent={() => setView("teacher-student")}
              />
            )}
            {view === "teacher-activities" && (
              <TeacherActivities
                activities={state.activities}
                onNew={() => setView("teacher-new-activity")}
                onResults={() => setView("teacher-results")}
              />
            )}
            {view === "teacher-new-activity" && (
              <TeacherNewActivity
                selectedQuestions={selectedQuestions}
                setSelectedQuestions={setSelectedQuestions}
                title={activityTitle}
                setTitle={setActivityTitle}
                onSave={saveActivity}
              />
            )}
            {view === "teacher-results" && (
              <TeacherResults attempts={state.attempts} onStudent={() => setView("teacher-student")} />
            )}
            {view === "teacher-student" && <StudentDetail attempts={state.attempts} />}
            {view === "student-activities" && (
              <StudentActivities
                activity={activeActivity}
                status={state.studentStatus}
                onStart={() => {
                  setState((current) => ({ ...current, studentStatus: "Em andamento" }));
                  setView("student-solve");
                }}
                onProgress={() => setView("student-progress")}
              />
            )}
            {view === "student-solve" && (
              <StudentSolve
                activity={activeActivity}
                attempts={state.attempts}
                messages={state.messages}
                answer={answer}
                setAnswer={setAnswer}
                imageName={imageName}
                setImageName={setImageName}
                analysisStage={analysisStage}
                submitAttempt={submitAttempt}
                chatInput={chatInput}
                setChatInput={setChatInput}
                sendTutorMessage={sendTutorMessage}
                aiLoading={aiLoading}
                aiError={aiError}
                completed={hasCorrectAttempt || state.completed}
                lastAttempt={lastAttempt}
              />
            )}
            {view === "student-progress" && <StudentProgress completed={hasCorrectAttempt} />}
          </div>
        </section>
      </div>
    </main>
  );
}

function TeacherOverview({
  attempts,
  onActivities,
  onResults,
  onStudent,
}: {
  attempts: Attempt[];
  onActivities: () => void;
  onResults: () => void;
  onStudent: () => void;
}) {
  return (
    <div className="space-y-6">
      <PageTitle
        badge="Professor"
        title="Visao geral"
        subtitle="Acompanhe o desempenho dos seus alunos."
        action={
          <Button onClick={onActivities}>
            <Plus className="size-4" />
            Nova atividade
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Atividades ativas" value="4" icon={ClipboardList} />
        <StatCard label="Alunos" value="28" icon={Users} />
        <StatCard label="Taxa de acerto" value="72%" icon={Check} />
        <StatCard label="Alunos com dificuldade" value="5" icon={Brain} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Desempenho da turma</CardTitle>
            <CardDescription>Alunos, acertos, progresso e status.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-sm">
              <thead className="text-left text-muted-foreground">
                <tr className="border-b">
                  <th className="py-3 font-medium">Aluno</th>
                  <th className="py-3 font-medium">Acertos</th>
                  <th className="py-3 font-medium">Progresso</th>
                  <th className="py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {STUDENTS.map((student) => (
                  <tr key={student.name} className="border-b last:border-0">
                    <td className="py-3">
                      <button onClick={onStudent} className="flex items-center gap-3 text-left">
                        <Avatar initials={student.initials} />
                        <span className="font-medium">{student.name}</span>
                      </button>
                    </td>
                    <td className="py-3">{student.correct}</td>
                    <td className="py-3">
                      <span className="text-emerald-600">↑</span> {student.progress}%
                    </td>
                    <td className="py-3">
                      <Badge variant={student.name === "Pedro" ? "secondary" : "outline"}>
                        {student.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Principais dificuldades</CardTitle>
            <CardDescription>Lacunas identificadas pela IA nas tentativas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {DIFFICULTIES.map((difficulty) => (
              <button
                key={difficulty.name}
                onClick={onResults}
                className="w-full rounded-lg border p-3 text-left transition hover:bg-muted/60"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{difficulty.name}</p>
                    <p className="text-xs text-muted-foreground">{difficulty.students} afetados</p>
                  </div>
                  <span className="text-sm text-muted-foreground">{difficulty.percent}%</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-muted">
                  <div
                    className={`h-2 rounded-full ${difficulty.tone}`}
                    style={{ width: `${difficulty.percent}%` }}
                  />
                </div>
              </button>
            ))}
            <div className="rounded-lg bg-muted/60 p-3 text-sm">
              Recomendacao de reforco: retomar operacoes inversas antes da proxima lista.
            </div>
            <p className="text-xs text-muted-foreground">
              Demo atual: {attempts.length} tentativa(s) registradas para Pedro.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TeacherActivities({
  activities,
  onNew,
  onResults,
}: {
  activities: Activity[];
  onNew: () => void;
  onResults: () => void;
}) {
  return (
    <div className="space-y-6">
      <PageTitle
        badge="Atividades"
        title="Minhas atividades"
        subtitle="Crie e acompanhe atividades para seus alunos."
        action={
          <Button onClick={onNew}>
            <Plus className="size-4" />
            Nova atividade
          </Button>
        }
      />
      <div className="flex flex-col gap-3 rounded-lg border bg-card p-3 md:flex-row md:items-center">
        <div className="flex flex-wrap gap-2">
          {["Todas", "Ativas", "Concluidas", "Rascunhos"].map((filter) => (
            <Button key={filter} size="sm" variant={filter === "Todas" ? "default" : "outline"}>
              {filter}
            </Button>
          ))}
        </div>
        <div className="relative md:ml-auto md:w-80">
          <Search className="absolute left-2.5 top-2 size-4 text-muted-foreground" />
          <Input className="pl-8" placeholder="Buscar atividade..." />
        </div>
      </div>

      {activities.length === 0 ? (
        <EmptyState
          title="Nenhuma atividade criada ainda."
          text="Crie sua primeira atividade para comecar."
          actionLabel="+ Nova atividade"
          onAction={onNew}
        />
      ) : (
        <div className="grid gap-4">
          {activities.map((activity) => (
            <Card key={activity.id}>
              <CardHeader>
                <CardTitle>{activity.title}</CardTitle>
                <CardDescription>
                  {activity.subject} • {activity.topic} • {activity.questions.length} questoes •{" "}
                  {activity.students} alunos
                </CardDescription>
                <CardAction>
                  <Badge variant={activity.status === "Ativa" ? "default" : "outline"}>
                    {activity.status}
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardContent>
                <Progress value={(activity.completed / activity.students) * 100}>
                  <ProgressLabel>{activity.completed} de {activity.students} concluiram</ProgressLabel>
                  <ProgressValue />
                </Progress>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline">Ver atividade</Button>
                  <Button size="sm" onClick={onResults}>Ver resultados</Button>
                  <Button size="sm" variant="outline">Editar</Button>
                  <Button size="sm" variant="outline">Duplicar</Button>
                  <Button size="sm" variant="destructive">
                    <Trash2 className="size-3" />
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function TeacherNewActivity({
  selectedQuestions,
  setSelectedQuestions,
  title,
  setTitle,
  onSave,
}: {
  selectedQuestions: string[];
  setSelectedQuestions: (ids: string[]) => void;
  title: string;
  setTitle: (title: string) => void;
  onSave: (sendNow: boolean) => void;
}) {
  function toggleQuestion(id: string) {
    setSelectedQuestions(
      selectedQuestions.includes(id)
        ? selectedQuestions.filter((current) => current !== id)
        : [...selectedQuestions, id]
    );
  }

  return (
    <div className="space-y-6">
      <PageTitle badge="Criacao" title="Nova atividade" subtitle="Monte uma atividade com questoes prontas." />
      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Dados da atividade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="block text-sm font-medium">
              Titulo da atividade
              <Input className="mt-2" value={title} onChange={(event) => setTitle(event.target.value)} />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <Select label="Disciplina" value="Matematica" options={["Matematica"]} />
              <Select label="Assunto" value="Equacoes de 1o grau" options={["Equacoes de 1o grau"]} />
            </div>
            <Select label="Turma" value="Turma A" options={["Turma A"]} />
            <label className="block text-sm font-medium">
              Descricao
              <Textarea className="mt-2 min-h-24" placeholder="Orientacoes opcionais para a turma." />
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Selecionar questoes</CardTitle>
            <CardDescription>Banco de questoes pronto para o MVP.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <Select label="Disciplina" value="Matematica" options={["Matematica"]} />
              <Select label="Assunto" value="Equacoes" options={["Equacoes"]} />
              <Select label="Dificuldade" value="Todas" options={["Todas", "Facil", "Media"]} />
            </div>
            <Input placeholder="Buscar questao..." />
            <div className="space-y-3">
              {QUESTION_BANK.map((question) => (
                <label
                  key={question.id}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition hover:bg-muted/60"
                >
                  <input
                    className="mt-1 size-4 accent-primary"
                    type="checkbox"
                    checked={selectedQuestions.includes(question.id)}
                    onChange={() => toggleQuestion(question.id)}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{question.subject}</Badge>
                      <Badge variant="outline">{question.topic}</Badge>
                      <Badge variant="secondary">{question.difficulty}</Badge>
                    </div>
                    <p className="mt-3 font-mono text-lg font-semibold">{question.statement}</p>
                    <p className="mt-2 text-xs text-muted-foreground">Foco: {question.focus}</p>
                  </div>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Questoes selecionadas</CardTitle>
          <CardDescription>{selectedQuestions.length} questoes selecionadas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {QUESTION_BANK.filter((question) => selectedQuestions.includes(question.id)).map((question, index) => (
            <div key={question.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
              <div>
                <p className="text-xs text-muted-foreground">Questao {index + 1}</p>
                <p className="font-mono font-semibold">{question.statement}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">Visualizar</Button>
                <Button size="sm" variant="outline" onClick={() => toggleQuestion(question.id)}>
                  Remover
                </Button>
              </div>
            </div>
          ))}
          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onSave(false)}>Salvar rascunho</Button>
            <Button onClick={() => onSave(true)}>Enviar atividade</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StudentActivities({
  activity,
  status,
  onStart,
  onProgress,
}: {
  activity: Activity;
  status: StudentActivityStatus;
  onStart: () => void;
  onProgress: () => void;
}) {
  return (
    <div className="space-y-6">
      <PageTitle
        badge="Aluno"
        title="Minhas atividades"
        subtitle="Continue seus estudos e acompanhe seu progresso."
        action={<Button variant="outline" onClick={onProgress}>Meu progresso</Button>}
      />
      <section>
        <h2 className="text-lg font-semibold">Para fazer</h2>
        {activity ? (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <Badge variant="secondary" className="w-fit">{activity.subject}</Badge>
                <CardTitle>{activity.title}</CardTitle>
                <CardDescription>
                  Professor Joao • {activity.questions.length} questoes • Prazo: 20 de setembro
                </CardDescription>
                <CardAction>
                  <Badge>{status}</Badge>
                </CardAction>
              </CardHeader>
              <CardContent>
                <Progress value={status === "Concluida" ? 100 : status === "Em andamento" ? 20 : 0}>
                  <ProgressLabel>Progresso da atividade</ProgressLabel>
                  <ProgressValue />
                </Progress>
                <Button className="mt-4" onClick={onStart}>
                  {status === "Nao iniciada" ? "Iniciar atividade" : "Continuar atividade"}
                  <ChevronRight className="size-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <EmptyState
            title="Voce nao possui atividades pendentes."
            text="Quando seu professor enviar uma atividade, ela aparecera aqui."
          />
        )}
      </section>
    </div>
  );
}

function StudentSolve({
  activity,
  attempts,
  messages,
  answer,
  setAnswer,
  imageName,
  setImageName,
  analysisStage,
  submitAttempt,
  chatInput,
  setChatInput,
  sendTutorMessage,
  aiLoading,
  aiError,
  completed,
  lastAttempt,
}: {
  activity: Activity;
  attempts: Attempt[];
  messages: TutorMessage[];
  answer: string;
  setAnswer: (answer: string) => void;
  imageName: string;
  setImageName: (name: string) => void;
  analysisStage: "idle" | "uploading" | "analyzing" | "done" | "error";
  submitAttempt: () => void;
  chatInput: string;
  setChatInput: (text: string) => void;
  sendTutorMessage: () => void;
  aiLoading: boolean;
  aiError: string | null;
  completed: boolean;
  lastAttempt: Attempt;
}) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <PageTitle
          badge="Questao 1 de 5"
          title={activity.title}
          subtitle="Resolva a questao e use o Tutor IA para revisar seu raciocinio."
        />
        <div className="min-w-64">
          <Progress value={completed ? 100 : 20}>
            <ProgressLabel>Progresso</ProgressLabel>
            <ProgressValue />
          </Progress>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle>Questao 1</CardTitle>
            <CardDescription>Resolva a equacao:</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-lg border bg-muted/40 p-5 font-mono text-3xl font-semibold">
              2x + 5 = 15
            </div>

            <section className="space-y-3">
              <div>
                <p className="font-medium">Enviar foto da resolucao</p>
                <p className="text-sm text-muted-foreground">JPG, PNG ou HEIC. No celular, use a camera.</p>
              </div>
              <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 p-6 text-center transition hover:bg-muted/60">
                <Upload className="size-8 text-primary" />
                <p className="mt-3 font-medium">
                  {imageName ? imageName : "Envie uma foto da sua resolucao"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">Selecionar foto ou arrastar arquivo</p>
                <input
                  className="sr-only"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(event) => setImageName(event.target.files?.[0]?.name ?? "")}
                />
              </label>
              {imageName && (
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline">
                    <Camera className="size-3" />
                    Trocar imagem
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => setImageName("")}>
                    Remover
                  </Button>
                </div>
              )}
            </section>

            <section className="space-y-3">
              <p className="font-medium">Digitar resolucao</p>
              <Textarea
                className="min-h-32"
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                placeholder={"Exemplo:\n2x + 5 = 15\nx = 10"}
              />
              <Button
                onClick={submitAttempt}
                disabled={
                  analysisStage === "uploading" ||
                  analysisStage === "analyzing" ||
                  (!answer.trim() && !imageName)
                }
              >
                <FileText className="size-4" />
                {analysisStage === "analyzing" || analysisStage === "uploading"
                  ? "Analisando..."
                  : "Enviar resolucao"}
              </Button>
            </section>

            {analysisStage !== "idle" && (
              <div
                className={`rounded-lg border p-4 ${
                  analysisStage === "error"
                    ? "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100"
                    : "bg-card"
                }`}
              >
                <p className="font-medium">
                  {analysisStage === "done"
                    ? "Analise concluida"
                    : analysisStage === "error"
                      ? "Tutor IA indisponivel"
                      : "Analisando sua resolucao..."}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {analysisStage === "error"
                    ? "Sua resolucao foi registrada, mas a orientacao da IA nao foi gerada agora."
                    : "A IA esta analisando seu raciocinio."}
                </p>
                <div className="mt-4 space-y-2 text-sm">
                  <Step done label="Resolucao recebida" />
                  <Step done={analysisStage !== "uploading" && analysisStage !== "error"} label="Interpretando raciocinio" />
                  <Step done={analysisStage === "done"} label="Verificando os passos" />
                </div>
              </div>
            )}

            {completed && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
                <p className="font-semibold">Boa! Voce chegou a solucao correta.</p>
                <p className="mt-2 text-sm">O que voce praticou: operacoes inversas e isolamento da variavel.</p>
                <p className="mt-2 text-sm">Tentativas: {attempts.length}. Progresso registrado.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              Tutor IA
            </CardTitle>
            <CardDescription>Conversa contextualizada na questao atual e nas tentativas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-[430px] space-y-3 overflow-y-auto rounded-lg border bg-background p-3">
              {messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={message.role === "user" ? "text-right" : ""}>
                  <div
                    className={`inline-block max-w-[92%] rounded-lg px-3 py-2 text-sm leading-6 ${
                      message.role === "user" ? "bg-primary text-primary-foreground" : "border bg-card"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
              {aiLoading && (
                <div className="inline-block rounded-lg border bg-card px-3 py-2 text-sm text-muted-foreground">
                  A IA esta lendo seu raciocinio...
                </div>
              )}
            </div>

            {aiError && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
                <p className="font-medium">Tutor IA fora do ar</p>
                <p className="mt-1">
                  {aiError}. Verifique a chave da API ou tente novamente em instantes.
                </p>
              </div>
            )}

            {lastAttempt && !lastAttempt.correct && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
                <p className="font-medium">Dificuldade encontrada</p>
                <p>{lastAttempt.detectedError}</p>
                <p className="mt-1">Lacuna: {lastAttempt.knowledgeGap}</p>
              </div>
            )}

            <div className="space-y-3">
              <Textarea
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                className="min-h-24"
                placeholder="Digite sua resposta..."
              />
              <Button onClick={sendTutorMessage} disabled={!chatInput.trim() || aiLoading}>
                <MessageSquare className="size-4" />
                Responder
              </Button>
            </div>

            {!completed && (
              <div className="rounded-lg bg-muted/60 p-3">
                <p className="text-sm font-medium">Recomendacao</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Pratique mais uma questao sobre operacoes inversas: 3x + 4 = 16.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Timeline attempts={attempts} completed={completed} />
    </div>
  );
}

function TeacherResults({ attempts, onStudent }: { attempts: Attempt[]; onStudent: () => void }) {
  return (
    <div className="space-y-6">
      <PageTitle
        badge="Resultados"
        title="Resultados - Equacoes de 1o grau"
        subtitle="Veja acertos, tentativas, dificuldades e evolucao."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Alunos" value="24" icon={Users} />
        <StatCard label="Concluiram" value="18" icon={Check} />
        <StatCard label="Acerto medio" value="72%" icon={BookOpen} />
        <StatCard label="Dificuldades principais" value="3" icon={Brain} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Resultado por aluno</CardTitle>
          <CardDescription>Classificacao gerada pela IA para o professor.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="text-left text-muted-foreground">
              <tr className="border-b">
                <th className="py-3 font-medium">Aluno</th>
                <th className="py-3 font-medium">Questoes corretas</th>
                <th className="py-3 font-medium">Tentativas</th>
                <th className="py-3 font-medium">Dificuldades</th>
                <th className="py-3 font-medium">Progresso</th>
                <th className="py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-3">
                  <button onClick={onStudent} className="flex items-center gap-3">
                    <Avatar initials="PE" />
                    Pedro
                  </button>
                </td>
                <td className="py-3">{attempts.some((attempt) => attempt.correct) ? "5/5" : "4/5"}</td>
                <td className="py-3">{attempts.length} tentativas</td>
                <td className="py-3">Operacoes inversas</td>
                <td className="py-3 text-emerald-600">↑</td>
                <td className="py-3">
                  <Badge variant="secondary">
                    {attempts.some((attempt) => attempt.correct) ? "Aprendizado consolidado" : "Precisa de atencao"}
                  </Badge>
                </td>
              </tr>
              {["Joao", "Maria"].map((name, index) => (
                <tr key={name} className="border-b last:border-0">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <Avatar initials={name.slice(0, 2).toUpperCase()} />
                      {name}
                    </div>
                  </td>
                  <td className="py-3">{index === 0 ? "8/10" : "6/10"}</td>
                  <td className="py-3">{index === 0 ? "12" : "15"} tentativas</td>
                  <td className="py-3">{index === 0 ? "Operacoes inversas" : "Isolamento da variavel"}</td>
                  <td className="py-3 text-emerald-600">↑</td>
                  <td className="py-3"><Badge variant="outline">{index === 0 ? "Bom progresso" : "Evoluindo"}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function StudentDetail({ attempts }: { attempts: Attempt[] }) {
  return (
    <div className="space-y-6">
      <PageTitle
        badge="Aluno"
        title="Desempenho de Pedro"
        subtitle="Entenda como o aluno evoluiu entre as tentativas."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Taxa de acerto" value={attempts.some((attempt) => attempt.correct) ? "80%" : "64%"} icon={Check} />
        <StatCard label="Atividades concluidas" value="6/7" icon={ClipboardList} />
        <StatCard label="Tentativas medias" value="1,8" icon={MessageSquare} />
        <StatCard label="Evolucao" value="+12%" icon={BookOpen} />
      </div>
      <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <CardHeader>
            <CardTitle>Principais dificuldades</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Badge variant="secondary">Operacoes inversas</Badge>
            <Badge variant="outline">Isolamento da variavel</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Historico recente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <InfoLine label="Atividade" value="Equacoes de 1o grau" />
            <InfoLine label="Questao" value="2x + 5 = 15" />
            <InfoLine label="Tentativa inicial" value="x = 10" />
            <InfoLine label="Lacuna identificada" value="Operacoes inversas" />
            <InfoLine
              label="Apos orientacao"
              value={attempts.some((attempt) => attempt.correct) ? "x = 5" : "Nova tentativa pendente"}
            />
            <InfoLine
              label="Status"
              value={attempts.some((attempt) => attempt.correct) ? "Aprendizado consolidado" : "Em acompanhamento"}
            />
          </CardContent>
        </Card>
      </div>
      <Timeline attempts={attempts} completed={attempts.some((attempt) => attempt.correct)} />
    </div>
  );
}

function StudentProgress({ completed }: { completed: boolean }) {
  return (
    <div className="space-y-6">
      <PageTitle badge="Progresso" title="Meu progresso" subtitle="Veja assuntos, evolucao e reforcos recomendados." />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Questoes resolvidas" value={completed ? "33" : "32"} icon={FileText} />
        <StatCard label="Taxa de acerto" value={completed ? "80%" : "78%"} icon={Check} />
        <StatCard label="Atividades concluidas" value={completed ? "7" : "6"} icon={ClipboardList} />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Assuntos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={80}><ProgressLabel>Equacoes de 1o grau</ProgressLabel><ProgressValue /></Progress>
            <Progress value={65}><ProgressLabel>Operacoes inversas</ProgressLabel><ProgressValue /></Progress>
            <Progress value={70}><ProgressLabel>Isolamento da variavel</ProgressLabel><ProgressValue /></Progress>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recomendado para voce</CardTitle>
            <CardDescription>Reforcos relacionados as dificuldades identificadas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border p-3">
              <p className="font-medium">Exercicio de reforco</p>
              <p className="mt-1 font-mono text-lg">3x + 4 = 16</p>
              <Button className="mt-3" size="sm">Praticar agora</Button>
            </div>
            <div className="rounded-lg bg-muted/60 p-3 text-sm">
              Voce esta evoluindo em operacoes inversas: +15%.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Timeline({ attempts, completed }: { attempts: Attempt[]; completed: boolean }) {
  const steps = [
    "Aluno tentou",
    "IA identificou dificuldade",
    "IA forneceu orientacao",
    attempts.length > 1 ? "Aluno tentou novamente" : "Nova tentativa",
    completed ? "Aluno acertou" : "Feedback disponivel",
    completed ? "Progresso registrado" : "Progresso em acompanhamento",
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visualizacao da evolucao</CardTitle>
        <CardDescription>Como Pedro chegou mais perto da resposta.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-6">
          {steps.map((step, index) => (
            <div key={step} className="rounded-lg border bg-card p-3">
              <div className="mb-3 flex size-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {index + 1}
              </div>
              <p className="text-sm font-medium">{step}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function PageTitle({
  badge,
  title,
  subtitle,
  action,
}: {
  badge: string;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <Badge variant="secondary">{badge}</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card size="sm">
      <CardContent className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold">{value}</p>
        </div>
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function Avatar({ initials }: { initials: string }) {
  return (
    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
      {initials}
    </div>
  );
}

function EmptyState({
  title,
  text,
  actionLabel,
  onAction,
}: {
  title: string;
  text: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="rounded-lg border bg-card p-8 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-lg bg-muted">
        <UserRound className="size-6 text-muted-foreground" />
      </div>
      <h2 className="mt-4 text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{text}</p>
      {actionLabel && onAction && (
        <Button className="mt-4" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

function Select({ label, value, options }: { label: string; value: string; options: string[] }) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <select
        defaultValue={value}
        className="mt-2 h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function Step({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`flex size-5 items-center justify-center rounded-full text-[10px] ${
          done ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
        }`}
      >
        {done ? "✓" : "•"}
      </span>
      <span className={done ? "text-foreground" : "text-muted-foreground"}>{label}</span>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
