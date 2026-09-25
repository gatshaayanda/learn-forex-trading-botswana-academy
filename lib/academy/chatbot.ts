export const ACADEMY_URL =
  process.env.NEXT_PUBLIC_BASE_URL ??
  "https://learn-forex-trading-botswana-academ-indol.vercel.app";

const intents = {
  menu: ["menu", "start", "options", "what can you do"],
  programmes: [
    "course", "courses", "programme", "programmes", "training", "learn forex",
    "beginner", "beginner course", "what do you offer", "what can i study",
  ],
  fees: ["fee", "fees", "price", "prices", "cost", "how much", "payment", "pay", "enrol", "enroll", "enrolment", "enrollment"],
  training: ["how does training work", "how training works", "how does it work", "what happens", "lessons", "classes", "assessment", "assessments", "mentorship", "mentor"],
  student: ["student", "existing student", "i am a student", "im a student", "i'm a student", "portal", "login", "lesson", "my course", "support"],
  alumni: ["alumni", "alumnus", "completed", "completed student", "former student", "returning", "finished my course"],
  owner: ["owner", "human", "person", "advisor", "agent", "speak to someone", "speak to the owner", "talk to someone", "talk to a person", "contact"],
} as const;

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9\s?]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function matches(input: string, phrases: readonly string[]) {
  return phrases.some((phrase) => {
    const normalizedPhrase = normalize(phrase);
    return input === normalizedPhrase || input.includes(normalizedPhrase);
  });
}

export function menu() {
  return [
    "Hi 👋 Welcome to Learn Forex Trading Botswana Academy.",
    "",
    "I can help with:",
    "1️⃣ Programmes",
    "2️⃣ Fees / enrolment",
    "3️⃣ How training works",
    "4️⃣ Existing student support",
    "5️⃣ Alumni / completed student",
    "6️⃣ Speak to a person",
    "",
    "You can type a question naturally, or type MENU anytime.",
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
    "The academy has different student journeys, including programme completion and longer-term mentorship.",
    "",
    "Explore the academy:",
    ACADEMY_URL,
    "",
    "Ask me a question or type MENU.",
  ].join("\n");
}

function fees() {
  return [
    "💰 Fees & enrolment",
    "",
    "The academy has different programmes and enrolment pathways. I don't want to invent a price and give you the wrong information.",
    "",
    "For the current fee and enrolment options, a member of the Academy team can confirm the correct amount.",
    "",
    "Type 6 to request a person.",
  ].join("\n");
}

function training() {
  return [
    "🎓 How training works",
    "",
    "The Academy provides structured forex education through lessons, practical learning, assessments and progression through your programme.",
    "",
    "Some programmes are shorter and conclude after the training period. Other pathways can continue into longer-term mentorship.",
    "",
    "Academy:",
    ACADEMY_URL,
    "",
    "Ask me what you want to know about the programmes.",
  ].join("\n");
}

function studentSupport() {
  return [
    "👋 Existing student support",
    "",
    "You can continue through the Academy portal:",
    ACADEMY_URL,
    "",
    "If your question is about your account, lessons, progress or support, type 6 and ask for a person.",
  ].join("\n");
}

function alumni() {
  return [
    "🎓 Completed / alumni student",
    "",
    "Completing a programme does not necessarily end the Academy relationship.",
    "",
    "Some pathways include continued mentorship and support. If you're a completed or returning student, a member of the Academy team can confirm what applies to you.",
    "",
    "Type 6 to request a person.",
  ].join("\n");
}

function ownerHandoff() {
  const ownerPhone = process.env.WHATSAPP_OWNER_PHONE?.replace(/[^0-9]/g, "");

  return [
    "👤 Human support",
    "",
    ownerPhone
      ? `A member of the Academy team can take over here: https://wa.me/${ownerPhone}`
      : "I've marked this as a request for human help. Please ask the Academy team to take over this conversation.",
    "",
    "If you want the Academy menu again, type MENU.",
  ].join("\n");
}

function unknown() {
  return [
    "I can help with Academy programmes, fees, training, existing-student support and alumni questions.",
    "",
    "Tell me what you need help with, or type MENU for the options.",
  ].join("\n");
}

export function replyFor(message: string) {
  const input = normalize(message);

  if (!input || matches(input, intents.menu)) return menu();
  if (input === "1" || matches(input, intents.programmes)) return programmes();
  if (input === "2" || matches(input, intents.fees)) return fees();
  if (input === "3" || matches(input, intents.training)) return training();
  if (input === "4" || matches(input, intents.student)) return studentSupport();
  if (input === "5" || matches(input, intents.alumni)) return alumni();
  if (input === "6" || matches(input, intents.owner)) return ownerHandoff();

  return unknown();
}
