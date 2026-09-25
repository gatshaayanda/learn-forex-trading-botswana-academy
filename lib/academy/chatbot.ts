export const ACADEMY_URL =
  process.env.NEXT_PUBLIC_BASE_URL ??
  "https://learn-forex-trading-botswana-academ-indol.vercel.app";

export function menu() {
  return [
    "Hi 👋 Welcome to Learn Forex Trading Botswana Academy.",
    "",
    "I can help with:",
    "1️⃣ Programmes",
    "2️⃣ Fees / enrolment",
    "3️⃣ How training works",
    "4️⃣ Existing student",
    "5️⃣ Alumni / completed student",
    "6️⃣ Speak to the owner",
    "",
    "Type MENU anytime to see the options again.",
  ].join("\n");
}

export function programmes() {
  return [
    "📚 Academy programmes",
    "",
    "• Prestige Course — the academy's main programme.",
    "• 5 Weeks Course — a shorter structured programme.",
    "• Legacy Trader Programme — a smaller advanced programme led by the CEO.",
    "",
    "Different programmes have different student journeys, including short-course completion and longer-term mentorship.",
    "",
    "Explore the academy:",
    ACADEMY_URL,
    "",
    "Type MENU for the main menu.",
  ].join("\n");
}

export function replyFor(message: string) {
  const input = message.trim().toLowerCase();

  if (!input || ["hi", "hello", "hey", "menu", "start"].includes(input)) return menu();

  if (["1", "courses", "course", "programmes", "programme"].includes(input)) return programmes();

  if (["2", "fees", "fee", "price", "prices", "enrol", "enrolment", "enrollment"].includes(input)) {
    return [
      "💰 Fees & enrolment",
      "",
      "The academy has different programmes and student pathways, so I don't want to give you the wrong fee.",
      "",
      "For the current price and enrolment options, speak to the academy owner.",
      "",
      "Type 6 for the owner contact option.",
    ].join("\n");
  }

  if (["3", "training", "how training works", "how it works", "how"].includes(input)) {
    return [
      "🎓 How training works",
      "",
      "The academy provides structured forex training through lessons, practical learning, assessments and progression through your programme.",
      "",
      "Some programmes are shorter and completed after the training period. Other pathways can continue into longer-term mentorship.",
      "",
      "Academy:",
      ACADEMY_URL,
      "",
      "Type MENU for the main menu.",
    ].join("\n");
  }

  if (["4", "student", "existing student", "i am a student", "im a student", "portal", "login"].includes(input)) {
    return [
      "👋 Existing student",
      "",
      "Continue through the academy portal:",
      ACADEMY_URL,
      "",
      "If you need account or learning support, type 6 to request the owner.",
    ].join("\n");
  }

  if (["5", "alumni", "alumnus", "completed", "completed student", "former student", "returning"].includes(input)) {
    return [
      "🎓 Completed / alumni student",
      "",
      "If you have completed your programme, your academy relationship does not necessarily end there.",
      "",
      "Some pathways include continued mentorship and support. The academy can also keep completed students connected to relevant future opportunities.",
      "",
      "Type 6 if you need help finding your next step.",
    ].join("\n");
  }

  if (["6", "owner", "speak to owner", "contact", "human", "person", "advisor"].includes(input)) {
    const ownerPhone = process.env.WHATSAPP_OWNER_PHONE;
    return [
      "👤 Speak to the owner",
      "",
      ownerPhone
        ? `Contact the academy owner on WhatsApp: https://wa.me/${ownerPhone.replace(/[^0-9]/g, "")}`
        : "The owner contact will be connected here shortly.",
      "",
      "Type MENU to return to the academy menu.",
    ].join("\n");
  }

  return ["I didn't quite understand that.", "", menu()].join("\n");
}
