export const space = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  gutter: 23,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;
export const colors = {
  background: "#202020",
  surface: "#202023",
  border: "#555555",
  text: "#faf9f7",
  muted: "#aaaaaa",
  accent: "#f47750",
  accentLight: "#ffb395",
  gradient: ["#ffc04b", "#f77b43", "#df326f"] as const,
};
export const photos = {
  nara: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=85&fit=crop",
  lake: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1000&q=85&fit=crop",
  daria:
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=85&fit=crop",
  art: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=85&fit=crop",
  travel:
    "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800&q=85&fit=crop",
  nature:
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=85&fit=crop",
  music:
    "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=85&fit=crop",
  hike: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=1000&q=85&fit=crop",
  pottery:
    "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&q=85&fit=crop",
  city: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=800&q=85&fit=crop",
};
export type PhotoKey = keyof typeof photos;
export const creators = [
  {
    id: "talia",
    name: "Talia Bennett",
    handle: "talia",
    color: "#d8ff64",
    followers: "24.8k",
    category: "Life, in little moments",
    avatar: 0,
  },
  {
    id: "haisenberg",
    name: "Alex Morgan",
    handle: "haisenberg",
    color: "#aba0ff",
    followers: "18.2k",
    category: "A different perspective",
    avatar: 1,
  },
  {
    id: "mariam",
    name: "Mariam Ali",
    handle: "mariam",
    color: "#ffb5ca",
    followers: "32.1k",
    category: "Art & everyday magic",
    avatar: 2,
  },
  {
    id: "nara",
    name: "Nara Williams",
    handle: "nara",
    color: "#9cc8ff",
    followers: "12.2k",
    category: "Creating my own sunshine",
    avatar: 3,
  },
  {
    id: "brook",
    name: "Brook Davis",
    handle: "brook",
    color: "#c1aeff",
    followers: "56.4k",
    category: "Somewhere outside",
    avatar: 4,
  },
  {
    id: "daria",
    name: "Daria Chen",
    handle: "daria",
    color: "#ffbb6e",
    followers: "8.6k",
    category: "Let’s make something",
    avatar: 5,
  },
];
export const reels: {
  id: string;
  user: string;
  title: string;
  image: PhotoKey;
  likes: string;
  comments: number;
  live?: boolean;
  tag: string;
}[] = [
  {
    id: "r1",
    user: "nara",
    title: "A little golden hour magic",
    image: "nara",
    likes: "12.2k",
    comments: 244,
    tag: "Lifestyle",
  },
  {
    id: "r2",
    user: "brook",
    title: "Taking the scenic route",
    image: "lake",
    likes: "8.4k",
    comments: 128,
    live: true,
    tag: "Nature",
  },
  {
    id: "r3",
    user: "daria",
    title: "Finding beauty in the everyday",
    image: "daria",
    likes: "6.8k",
    comments: 96,
    tag: "Lifestyle",
  },
  {
    id: "r4",
    user: "mariam",
    title: "Acrylic painting, one layer at a time",
    image: "art",
    likes: "15.3k",
    comments: 300,
    tag: "Art",
  },
  {
    id: "r5",
    user: "talia",
    title: "A postcard from Santorini",
    image: "travel",
    likes: "21.1k",
    comments: 184,
    tag: "Travel",
  },
  {
    id: "r6",
    user: "haisenberg",
    title: "Mountain air hits different",
    image: "nature",
    likes: "9.2k",
    comments: 72,
    tag: "Nature",
  },
  {
    id: "r7",
    user: "daria",
    title: "Made by hand, made with love",
    image: "pottery",
    likes: "4.1k",
    comments: 42,
    tag: "Art",
  },
  {
    id: "r8",
    user: "brook",
    title: "After the sun goes down",
    image: "city",
    likes: "7.7k",
    comments: 103,
    tag: "Music",
  },
];
export const communities: {
  id: string;
  name: string;
  short: string;
  members: string;
  image: PhotoKey;
  description: string;
}[] = [
  {
    id: "art",
    name: "Art World",
    short: "Painting",
    members: "124k",
    image: "art",
    description: "A little inspiration. A lot of imagination.",
  },
  {
    id: "travel",
    name: "The Wayfarers",
    short: "Travel",
    members: "86k",
    image: "travel",
    description: "For the places you haven’t found yet.",
  },
  {
    id: "nature",
    name: "Outside Together",
    short: "Nature",
    members: "33k",
    image: "nature",
    description: "Take a breath. Take the scenic route.",
  },
  {
    id: "music",
    name: "Soundwave Society",
    short: "Music",
    members: "23k",
    image: "music",
    description: "Find your people. Find your sound.",
  },
];
export const interests = [
  "🎵 Music",
  "🎮 Gaming",
  "📚 Reading",
  "✈️ Traveling",
  "🍳 Cooking",
  "🖌️ Drawing",
  "🧘 Meditation",
  "🎤 Singing",
  "🖥️ Coding",
  "🏋️ Fitness",
  "🎨 Photography",
  "🌱 Gardening",
  "🎼 Playing Instruments",
  "🛶 Kayaking",
  "🌍 Cultural Exploration",
  "🧩 Puzzles",
  "📸 Videography",
  "📖 Writing",
  "🪴 Botany",
  "🎭 Acting",
  "🗺️ Adventure Sports",
];
export const gifts = [
  { name: "Hyacinth", emoji: "🪻", points: 25 },
  { name: "Lily", emoji: "🌼", points: 50 },
  { name: "Orchid", emoji: "🌸", points: 75 },
  { name: "Marigold", emoji: "🏵️", points: 100 },
  { name: "Rose", emoji: "🌹", points: 150 },
  { name: "Daffodil", emoji: "🌻", points: 200 },
  { name: "Peony", emoji: "💮", points: 250 },
  { name: "Tulip", emoji: "🌷", points: 300 },
  { name: "Sunflower", emoji: "🌻", points: 400 },
];
export const tracks = [
  { title: "Chill Beats", artist: "RAP LEGEND" },
  { title: "Party Vibes", artist: "LIL’ STAR" },
  { title: "Good Times Crew", artist: "DJ BLAZE" },
  { title: "Summer Nights Anthem", artist: "MC CHILLAX" },
  { title: "Dance All Night", artist: "RAPPER X" },
  { title: "Feel the Beat", artist: "HIP HOP HERO" },
];
export function avatarSvg(index: number) {
  const c = creators[index % creators.length].color;
  const skin = [
    "#ff788c",
    "#ffe77a",
    "#8d7aef",
    "#eb56b9",
    "#ff6ca7",
    "#d5a4ff",
  ][index % 6];
  const shirt = [
    "#12bd8b",
    "#7e7cfa",
    "#f885c3",
    "#252064",
    "#f7f7ed",
    "#3955dc",
  ][index % 6];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="${c}"/><path d="M13 100Q16 72 40 72L62 72Q88 75 92 100" fill="${shirt}"/><path d="M44 61L43 76L56 85L64 74L59 55" fill="${skin}"/><path d="M32 36Q26 8 49 13Q77 6 76 39L70 66L34 69Z" fill="#17171c"/><path d="M37 34Q49 39 62 27L70 41L66 59Q55 75 43 61L36 49" fill="${skin}"/><path d="M65 44L72 48L65 50" fill="${skin}" stroke="#23212a" stroke-width="1.3"/><path d="M48 44L52 44M61 42L64 42M56 56Q61 58 64 54" fill="none" stroke="#23212a" stroke-width="1.8" stroke-linecap="round"/><path d="M33 42Q26 35 26 46Q27 53 36 51" fill="${skin}"/><path d="M39 28Q20 31 33 17Q45 -1 57 14Q75 10 78 31L65 32L58 21Q55 35 38 37Z" fill="#17171c"/>${index % 2 === 0 ? '<circle cx="61" cy="12" r="11" fill="#17171c"/>' : '<path d="M40 77L51 91L60 79" fill="none" stroke="#fff" stroke-width="2"/>'}<path d="M22 93L27 100M78 90L76 100" stroke="#15151b" stroke-width="1.5"/></svg>`;
}
