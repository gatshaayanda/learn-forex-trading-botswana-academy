import { NextRequest, NextResponse } from "next/server";
import { replyFor } from "@/lib/academy/chatbot";

const GRAPH_API_VERSION = "v26.0";

function env(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

async function sendWhatsAppText(to: string, body: string) {
  const phoneNumberId = env("WHATSAPP_PHONE_NUMBER_ID");
  const accessToken = env("WHATSAPP_ACCESS_TOKEN");

  const response = await fetch(
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: { body },
      }),
    },
  );

  const responseText = await response.text();

  if (!response.ok) {
    console.error("WhatsApp send failed", {
      status: response.status,
      response: responseText,
    });
    return false;
  }

  try {
    const result = JSON.parse(responseText);
    console.log("WhatsApp send accepted", {
      status: response.status,
      messageId: result?.messages?.[0]?.id ?? null,
      recipient: result?.contacts?.[0]?.wa_id ?? to,
    });
  } catch {
    console.log("WhatsApp send accepted", { status: response.status });
  }

  return true;
}

export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get("hub.mode");
  const token = request.nextUrl.searchParams.get("hub.verify_token");
  const challenge = request.nextUrl.searchParams.get("hub.challenge");

  if (
    mode === "subscribe" &&
    token &&
    token === process.env.WHATSAPP_VERIFY_TOKEN &&
    challenge
  ) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const change = body?.entry?.[0]?.changes?.[0];
    const value = change?.value;
    const message = value?.messages?.[0];

    console.log("WhatsApp webhook event", {
      object: body?.object ?? null,
      field: change?.field ?? null,
      hasMessages: Array.isArray(value?.messages) && value.messages.length > 0,
      hasStatuses: Array.isArray(value?.statuses) && value.statuses.length > 0,
    });

    if (!message || message.type !== "text" || !message.from) {
      return NextResponse.json({ received: true });
    }

    const incoming = typeof message.text?.body === "string" ? message.text.body.trim() : "";

    if (!incoming) {
      return NextResponse.json({ received: true });
    }

    const response = replyFor(incoming);

    console.log("WhatsApp incoming text", {
      from: message.from,
      messageId: message.id ?? null,
      inputLength: incoming.length,
    });

    await sendWhatsAppText(message.from, response);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    return NextResponse.json({ received: true });
  }
}
