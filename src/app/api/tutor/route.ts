import { NextRequest, NextResponse } from "next/server";
import { getTutorReply, type ChatTurn } from "@/lib/ai/tutor";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const history: ChatTurn[] = body.history;

    if (!Array.isArray(history) || history.length === 0) {
      return NextResponse.json(
        { error: "historico da conversa invalido ou vazio" },
        { status: 400 }
      );
    }

    const reply = await getTutorReply(history);

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Erro na rota /api/tutor:", err);
    return NextResponse.json(
      { error: "erro ao consultar a IA, tente novamente em instantes" },
      { status: 500 }
    );
  }
}
