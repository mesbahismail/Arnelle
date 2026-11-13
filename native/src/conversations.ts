import type { Message } from "./store";

export const demoConversations: Record<string, Message[]> = {
  talia: [
    { text: "Heyyy! Look where I ended up this afternoon 😍", own: false },
    {
      text: "",
      own: false,
      image: "travel",
      imageDescription: "A sunlit coastal village",
    },
    { text: "Okay, that looks unreal ✨", own: true },
    {
      text: "Right?! The little streets are even prettier in person 🥹",
      own: false,
    },
    {
      text: "We need a weekend here. Coffee, wandering, absolutely no schedule ☕️",
      own: false,
    },
    { text: "Already packing 😂🧳", own: true },
    { text: "A moment worth sharing", own: true, storyCreator: "nara" },
    { text: "Omg her story!! That light is everything 🌅", own: false },
    { text: "Sending you the café name in a minute 💛", own: false },
  ],
  haisenberg: [
    { text: "Made it to the top! 🥾⛰️", own: false },
    { text: "How was the climb?", own: true },
    { text: "My legs are filing a complaint 😂", own: false },
    { text: "But honestly… worth every step", own: false },
    { text: "Show me the view 👀", own: true },
    { text: "Wait for these 📸", own: false },
    {
      text: "",
      own: false,
      image: "nature",
      imageDescription: "Mountains stretching into the distance",
    },
    {
      text: "",
      own: false,
      image: "hike",
      imageDescription: "A scenic mountain hiking trail",
    },
  ],
  mariam: [
    { text: "Quick question 🎨", own: false },
    {
      text: "Does buying more paint count as being productive? 😂",
      own: false,
    },
    { text: "Absolutely. Research, obviously 😌", own: true },
    { text: "THANK YOU. That’s the answer I needed 🤝", own: false },
    { text: "What are you working on today?", own: true },
    {
      text: "A tiny still life! Trying not to overthink every brushstroke",
      own: false,
    },
    { text: "Already got paint on my coffee cup 🙃☕️", own: false },
    { text: "Part of the process 😂", own: true },
    {
      text: "Come over later? I’ll put music on and we can make a mess 🎶🖌️",
      own: false,
    },
    { text: "Bring snacks though 🍓✨", own: false },
  ],
  nara: [
    { text: "Golden hour did its thing today 🌞", own: false },
    { text: "You always find the best light!", own: true },
    { text: "I was literally on my way to get groceries 😂", own: false },
    { text: "Stopped for one photo… took about fifty", own: false },
    { text: "Worth it. Send your favorite 📷", own: true },
    { text: "This one 🥹🧡", own: false },
    {
      text: "",
      own: false,
      image: "nara",
      imageDescription: "Nara’s portrait in warm afternoon light",
    },
  ],
  brook: [
    { text: "Morning! Found a new spot for our next walk 🌿", own: false },
    { text: "Is there coffee nearby? Important question ☕️", own: true },
    { text: "Coffee AND pastries. I did my research 🥐", own: false },
    { text: "Say no more. I’m in 🙌", own: true },
    { text: "It’s really quiet early in the morning", own: false },
    {
      text: "Listen to the birds and forget the inbox for a bit 🐦",
      own: false,
    },
    {
      text: "Our breakfast view, hopefully 😍",
      own: false,
      image: "lake",
      imageDescription: "A peaceful lake surrounded by mountains",
    },
  ],
  daria: [
    { text: "They’re finally out of the kiln!! 🥹", own: false },
    {
      text: "",
      own: false,
      image: "pottery",
      imageDescription: "A collection of handmade ceramic pieces",
    },
    { text: "You made those?! They’re beautiful 🤍", own: true },
    { text: "The wonky little one is my favorite 😂", own: false },
    { text: "It has personality 😌", own: true },
    { text: "Exactly what I’m telling everyone", own: false },
    { text: "Saving one for you btw 🎁", own: false },
    { text: "No wayyy 😭💕", own: true },
    { text: "Yes way!! Pick it up this weekend? ✨", own: false },
  ],
};

export function conversationMessages(
  creatorId: string,
  messages: Message[] = [],
) {
  return [...(demoConversations[creatorId] || []), ...messages];
}

export function conversationPreview(creatorId: string, messages?: Message[]) {
  const latest = conversationMessages(creatorId, messages).at(-1);
  if (!latest) return "Say hello 👋";
  const text = latest.image
    ? "📷 Photo"
    : latest.storyCreator
      ? "◯ Shared a story"
      : latest.text;
  return `${latest.own ? "You: " : ""}${text}`;
}
