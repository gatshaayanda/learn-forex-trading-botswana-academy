import { NextRequest, NextResponse } from "next/server";

const GRAPH_API_VERSION = "v23.0";

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
    "1️⃣ Courses",
    "2️⃣ Fees",
    "3️⃣ How training works",
    "4️⃣ Existing student",
    "5️⃣ Speak to the owner",
    "",
    "Reply MENU anytime to see these options again.",
  ].join("\n");
}

function replyFor(message: string) {
  const input = message.trim().toLowerCase();

  if (!input || ["hi", "hello", "hey", "menu", "start"].includes(input)) {
    return menu();
  }

  if (["1", "courses", "course"].includes(input)) {
    return [
      "📚 Courses",
      "",
      "The academy provides structured forex training from foundations through technical analysis and risk management.",
      "",
      "Visit the academy to see the current learning path:",
      process.env.NEXT_PUBLIC_BASE_URL ??
        "https://learn-forex-trading-botswana-academ-indol.vercel.app",
      "",
      "Reply MENU for the main menu.",
    ].join("\n");
  }

  if (["2", "fees", "fee", "price", "prices"].includes(input)) {
    return [
      "💰 Fees",
      "",
      "For the current course fees and payment options, please speak directly with the academy owner.",
      "",
      "Reply 5 and I'll give you the owner contact option.",
    ].join("\n");
  }

  if (
    ["3", "training", "how training works", "how it works", "how"].includes(input)
  ) {
    return [
      "🎓 How training works",
      "",
      "You learn through structured lessons, practical assignments and a clear progression through the academy.",
      "",
      "The student academy is available online, so you can work through your learning path at your own pace.",
      "",
      "Reply MENU for the main menu.",
    ].join("\n");
  }

  if (
    ["4", "student", "existing student", "i am a student", "im a student"].includes(
      input,
    )
  ) {
    return [
      "👋 Existing student",
      "",
      "Use the academy portal to continue your learning:",
      process.env.NEXT_PUBLIC_BASE_URL ??
        "https://learn-forex-trading-botswana-academ-indol.vercel.app",
      "",
      "If you need help with your account, reply 5.",
    ].join("\n");
  }

  if (
    ["5", "owner", "speak to owner", "contact", "human", "person"].includes(input)
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

    await sendWhatsAppText(message.from, response);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    return NextResponse.json({ received: true });
  }
}
