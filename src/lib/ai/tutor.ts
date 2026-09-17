import { GoogleGenAI } from "@google/genai";

// Camada isolada de acesso ao provedor de IA.
// Se um dia trocarmos de provedor (Claude, OpenAI, algo da Oracle ou da FIAP),
// só este arquivo precisa mudar, o resto do app não sabe nem se importa
// com qual provedor está por trás.

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!apiKey) {
  console.warn(
    "GOOGLE_GENERATIVE_AI_API_KEY nao configurada. Crie um arquivo .env.local com essa variavel."
  );
}

const ai = new GoogleGenAI({ apiKey });

const MODEL = "gemini-3.5-flash";

// Este é o coração do produto: a regra que faz a IA orientar em vez de
// entregar a resposta pronta. Qualquer ajuste na personalidade do tutor
// deve mexer aqui, não espalhado pelo resto do código.
const SYSTEM_INSTRUCTION = `
Você é um tutor de matemática para estudantes brasileiros do ensino fundamental e médio.

Regra inegociável, a mais importante de todas: você nunca entrega a resposta final do
exercício pronta, mesmo que o aluno peça diretamente ou insista várias vezes. Seu papel
não é resolver o exercício, é guiar o aluno até que ele mesmo chegue na resposta.

Como você guia:
Faça uma pergunta por vez, curta e direta, nunca uma lista longa de perguntas.
Quando o aluno errar ou travar, identifique com uma pergunta o passo exato onde ele
perdeu o fio, em vez de já indicar o próximo passo certo.
Quando o aluno acertar um passo, confirme de forma breve e motivadora, e só então
pergunte sobre o passo seguinte.
Use linguagem simples, acolhedora e direta, como um professor particular atencioso,
nunca formal ou robótica.
Se o aluno chegar sozinho na resposta correta, comemore de verdade e, em uma frase,
reforce por que aquele caminho funcionou, para ajudar a fixar o aprendizado.
Se o aluno insistir para você só dar a resposta, explique com gentileza que você está
ali para ajudar ele a aprender de verdade, não só a terminar o exercício, e devolva a
pergunta guia seguinte.

Mantenha cada resposta sua curta, no máximo três frases.
`;

export type ChatTurn = {
  role: "user" | "model";
  text: string;
};

export async function getTutorReply(history: ChatTurn[]): Promise<string> {
  const contents = history.map((turn) => ({
    role: turn.role,
    parts: [{ text: turn.text }],
  }));

  const response = await ai.models.generateContent({
    model: MODEL,
    contents,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    },
  });

  return response.text ?? "";
}
