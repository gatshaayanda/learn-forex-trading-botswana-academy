import { NextRequest, NextResponse } from "next/server";

const GRAPH_API_VERSION = "v23.0";
const ACADEMY_URL =
  process.env.NEXT_PUBLIC_BASE_URL ??
  "https://learn-forex-trading-botswana-academ-indol.vercel.app";

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

  if (!response.ok) {
    const detail = await response.text();
    console.error("WhatsApp send failed:", response.status, detail);
  }
}

function menu() {
  return [
    "Hi 👋 Welcome to Learn Forex Trading Botswana Academy.",
    "",
    "Reply with a number:",
    "1️⃣ Programmes",
    "2️⃣ Fees / enrolment",
    "3️⃣ How training works",
    "4️⃣ Existing student",
    "5️⃣ Alumni / completed student",
    "6️⃣ Speak to the owner",
    "",
    "Reply MENU anytime to see these options again.",
  ].join("\n");
}

function programmes() {
  return [
    "📚 Academy programmes",
    "",
    "1️⃣ Prestige Course — the academy's main programme.",
    "2️⃣ 5 Weeks Course — a shorter structured programme.",
    "3️⃣ Legacy Trader Programme — a smaller advanced programme led by the CEO.",
    "",
    "The academy also supports different student journeys, including students who complete a short programme and students who continue through longer-term mentorship.",
    "",
    "Visit the academy:",
    ACADEMY_URL,
    "",
    "Reply MENU for the main menu.",
  ].join("\n");
}

function replyFor(message: string) {
  const input = message.trim().toLowerCase();

  if (!input || ["hi", "hello", "hey", "menu", "start"].includes(input)) {
    return menu();
  }

  if (["1", "courses", "course", "programmes", "programme"].includes(input)) {
    return programmes();
  }

  if (
    [
      "2",
      "fees",
      "fee",
      "price",
      "prices",
      "enrol",
      "enrolment",
      "enrollment",
    ].includes(input)
  ) {
    return [
      "💰 Fees & enrolment",
      "",
      "The academy has different programmes and student pathways, so we don't want to give you the wrong fee.",
      "",
      "For the current price and enrolment options, speak to the academy owner.",
      "",
      "Reply 6 for the owner contact option.",
    ].join("\n");
  }

  if (
    ["3", "training", "how training works", "how it works", "how"].includes(
      input,
    )
  ) {
    return [
      "🎓 How training works",
      "",
      "The academy provides structured forex training through lessons, practical learning, assessments and progression through your programme.",
      "",
      "Some programmes are shorter and are completed after the training period. Other pathways can continue into longer-term mentorship.",
      "",
      "Academy:",
      ACADEMY_URL,
      "",
      "Reply MENU for the main menu.",
    ].join("\n");
  }

  if (
    [
      "4",
      "student",
      "existing student",
      "i am a student",
      "im a student",
      "portal",
      "login",
    ].includes(input)
  ) {
    return [
      "👋 Existing student",
      "",
      "Continue through the academy portal:",
      ACADEMY_URL,
      "",
      "If you need account or learning support, reply 6 to request the owner.",
    ].join("\n");
  }

  if (
    [
      "5",
      "alumni",
      "alumnus",
      "completed",
      "completed student",
      "former student",
      "returning",
    ].includes(input)
  ) {
    return [
      "🎓 Completed / alumni student",
      "",
      "If you have completed your programme, your academy relationship does not necessarily end there.",
      "",
      "Some pathways include continued mentorship and support. The academy can also keep completed students connected to relevant future opportunities.",
      "",
      "Reply 6 if you need help finding your next step.",
    ].join("\n");
  }

  if (
    ["6", "owner", "speak to owner", "contact", "human", "person", "advisor"].includes(
      input,
    )
  ) {
    const ownerPhone = process.env.WHATSAPP_OWNER_PHONE;

    return [
      "👤 Speak to the owner",
      "",
      ownerPhone
        ? `Contact the academy owner on WhatsApp: https://wa.me/${ownerPhone.replace(/[^0-9]/g, "")}`
        : "The owner contact will be connected here shortly.",
      "",
      "Reply MENU to return to the academy menu.",
    ].join("\n");
  }

  return [
    "I didn't quite understand that.",
    "",
    menu(),
  ].join("\n");
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

    if (!message || message.type !== "text" || !message.from) {
      return NextResponse.json({ received: true });
    }

    const incoming = message.text?.body ?? "";
    const response = replyFor(incoming);

    console.log("WhatsApp incoming message", {
      from: message.from,
      messageType: message.type,
      input: incoming,
    });

    await sendWhatsAppText(message.from, response);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    return NextResponse.json({ received: true });
  }
}
