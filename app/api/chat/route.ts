import { NextRequest, NextResponse } from "next/server";
import { replyFor } from "@/lib/academy/chatbot";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = typeof body?.message === "string" ? body.message.trim() : "";

    if (!message || message.length > 500) {
      return NextResponse.json({ error: "Please enter a short message." }, { status: 400 });
    }

    return NextResponse.json({ reply: replyFor(message) });
  } catch {
    return NextResponse.json({ error: "The academy assistant is temporarily unavailable." }, { status: 500 });
  }
}
