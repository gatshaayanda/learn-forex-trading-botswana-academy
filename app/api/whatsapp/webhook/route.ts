import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";

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
    console.error("WhatsApp send failed:", response.status, await response.text());
  }
}

function menu() {
  return [
    "Hi 👋 Welcome to Learn Forex Trading Botswana Academy.",
    "",
    "What can we help you with?",
    "",
    "1️⃣ Courses",
    "2️⃣ Fees",
    "3️⃣ How training works",
    "4️⃣ Existing student",
    "5️⃣ Speak to the owner",
    "6️⃣ Which course is right for me?",
    "",
    "Reply MENU anytime to see these options again.",
  ].join("\n");
}

function replyFor(message: string) {
  const input = message.trim().toLowerCase();

  if (!input || ["hi", "hello", "hey", "menu", "start"].includes(input)) return menu();

  if (["1", "courses", "course"].includes(input)) {
    return [
      "📚 Academy programmes",
      "",
      "1️⃣ Prestige Course — the academy's most popular programme.",
      "2️⃣ 5 Weeks Course — a structured five-week programme.",
      "3️⃣ Legacy Trader Programme — an advanced programme conducted by the company CEO.",
      "",
      "Some programmes are short-course programmes, while others can include ongoing/lifetime mentorship.",
      "",
      "Reply 6 if you want help choosing a programme.",
      "Reply 5 to speak to the owner.",
    ].join("\n");
  }

  if (["2", "fees", "fee", "price", "prices"].includes(input)) {
    return [
      "💰 Fees",
      "",
      "Course fees and payment options can change, so I won't give you an outdated price.",
      "",
      "Reply 5 and I'll give you the owner contact option.",
    ].join("\n");
  }

  if (["3", "training", "how training works", "how it works", "how"].includes(input)) {
    return [
      "🎓 How training works",
      "",
      "The academy provides structured forex education with lessons, practical learning, assessments and progression through your programme.",
      "",
      "Your digital academy will also give students a place to monitor progress, access resources, receive feedback and communicate with the academy.",
      "",
      "Reply 4 if you are already a student.",
    ].join("\n");
  }

  if (["4", "student", "existing student", "i am a student", "im a student"].includes(input)) {
    return [
      "👋 Existing student",
      "",
      "Your academy portal is where your course, lessons, progress, assessments and student support will live.",
      "",
      process.env.NEXT_PUBLIC_BASE_URL ??
        "https://learn-forex-trading-botswana-academ-indol.vercel.app",
      "",
      "If you need help from the owner, reply 5.",
    ].join("\n");
  }

  if (["6", "which course", "help me choose", "course recommendation", "which programme"].includes(input)) {
    return [
      "🧭 Choosing a programme",
      "",
      "Tell me what you're looking for:",
      "",
      "A — A structured short course",
      "B — A five-week programme",
      "C — Advanced/CEO-led mentorship",
      "",
      "Reply A, B or C and we can route your enquiry.",
      "You can also reply 5 to speak to the owner.",
    ].join("\n");
  }

  if (["5", "owner", "speak to owner", "contact", "human", "person"].includes(input)) {
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

  if (["a", "b", "c"].includes(input)) {
    const labels: Record<string, string> = {
      a: "short-course enquiry",
      b: "5-weeks enquiry",
      c: "advanced/CEO-led mentorship enquiry",
    };
    return [
      "Thanks — I've noted your enquiry.",
      "",
      `Your enquiry type: ${labels[input]}`,
      "",
      "Reply 5 if you'd like to speak directly with the owner.",
      "Reply MENU for the main menu.",
    ].join("\n");
  }

  return ["I didn't quite understand that.", "", menu()].join("\n");
}

async function recordWhatsAppActivity(phone: string, message: string, response: string) {
  try {
    const db = getAdminDb();
    const conversationRef = db.collection("whatsappConversations").doc(phone);
    const leadRef = db.collection("leads").doc(phone);

    await Promise.all([
      conversationRef.set(
        {
          phone,
          lastMessage: message,
          lastResponse: response,
          lastContactAt: new Date(),
          channel: "whatsapp",
        },
        { merge: true },
      ),
      leadRef.set(
        {
          phone,
          source: "whatsapp",
          lastMessage: message,
          lastContactAt: new Date(),
          status: "lead",
          updatedAt: new Date(),
        },
        { merge: true },
      ),
    ]);
  } catch (error) {
    // WhatsApp replies must not fail just because Firebase is not configured yet.
    console.error("WhatsApp Firebase logging failed:", error);
  }
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
    const message = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (!message || message.type !== "text" || !message.from) {
      return NextResponse.json({ received: true });
    }

    const incoming = message.text?.body ?? "";
    const response = replyFor(incoming);

    await Promise.all([
      sendWhatsAppText(message.from, response),
      recordWhatsAppActivity(message.from, incoming, response),
    ]);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    return NextResponse.json({ received: true });
  }
}
