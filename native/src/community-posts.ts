import { creators, type PhotoKey } from "./data";

export type CommunityPost = {
  id: string;
  author: string;
  avatar: number;
  time: string;
  text: string;
  images: PhotoKey[];
  likes: number;
  comments: number;
};

type PostSeed = { author: string; text: string; images?: PhotoKey[] };
const seeds: Record<string, PostSeed[]> = {
  art: [
    {
      author: "talia",
      text: "A reminder to make something just for the joy of making it. What are you working on today?",
    },
    {
      author: "mariam",
      text: "A little glimpse into my creative world. Falling in love with these colors again.",
      images: ["art", "art", "pottery"],
    },
    {
      author: "daria",
      text: "Fresh from the kiln. The glaze never comes out exactly how I imagine, and that’s becoming my favorite part.",
      images: ["pottery"],
    },
    {
      author: "nara",
      text: "Today’s sketchbook rule: no eraser, no starting over. Just twenty minutes of following the line wherever it goes.",
    },
    {
      author: "mariam",
      text: "Trying a quieter palette this week. Warm shadows, soft edges, and one little pop of color.",
      images: ["art"],
    },
    {
      author: "haisenberg",
      text: "Weekend prompt: turn something ordinary on your desk into a tiny artwork. Coffee cups absolutely count.",
    },
    {
      author: "daria",
      text: "A few shapes I keep coming back to. I love how handmade pieces carry all those small imperfections.",
      images: ["pottery", "art"],
    },
    {
      author: "talia",
      text: "What’s one art supply you always reach for? Mine is the oldest brush in the jar. It has a mind of its own.",
    },
  ],
  travel: [
    {
      author: "talia",
      text: "Took the long way back and found my favorite corner of the trip. Leave a little room in the itinerary for getting lost.",
      images: ["travel"],
    },
    {
      author: "brook",
      text: "One backpack, an early train, and no plans until lunch. Sometimes that’s the whole recipe for a good weekend.",
    },
    {
      author: "nara",
      text: "Postcards from a very slow afternoon. The kind of place that makes you forget to check the time.",
      images: ["travel", "city", "lake"],
    },
    {
      author: "haisenberg",
      text: "Trading busy streets for mountain air today. The climb was worth every stop to catch my breath.",
      images: ["hike", "nature"],
    },
    {
      author: "daria",
      text: "Travel question: do you save every little ticket and receipt, or is that just me? My journal is mostly paper souvenirs now.",
    },
    {
      author: "talia",
      text: "The city after sunset feels like a completely different destination. One more walk before calling it a night.",
      images: ["city"],
    },
    {
      author: "brook",
      text: "Found a quiet place by the water and stayed twice as long as planned. No complaints.",
      images: ["lake"],
    },
    {
      author: "mariam",
      text: "Building a list of places to visit for their art, markets, and little cafés. What city would you add first?",
    },
  ],
  nature: [
    {
      author: "brook",
      text: "Morning light, still water, and absolutely nowhere else I need to be. Taking this feeling into the rest of the day.",
      images: ["lake"],
    },
    {
      author: "haisenberg",
      text: "The trail was quiet enough to hear every bird. A good reminder to leave the headphones in my pocket sometimes.",
      images: ["hike", "nature"],
    },
    {
      author: "nara",
      text: "Tiny outdoor challenge: spend ten minutes noticing things you usually walk past. I found three different kinds of leaves on one street.",
    },
    {
      author: "daria",
      text: "A few views from the weekend. Nature really does have the best color palette.",
      images: ["nature", "lake", "hike"],
    },
    {
      author: "brook",
      text: "Packed a snack, filled my water bottle, and took the scenic route home. Small adventures still count.",
      images: ["hike"],
    },
    {
      author: "mariam",
      text: "What’s your favorite sound outside? Rain on leaves is very hard to beat.",
    },
    {
      author: "haisenberg",
      text: "Clouds rolled in just as we reached the viewpoint. Stayed a while and watched the whole landscape change.",
      images: ["nature"],
    },
    {
      author: "talia",
      text: "A gentle reminder for our next walk: take your time, take your litter home, and leave the place a little better than you found it.",
    },
  ],
  music: [
    {
      author: "nara",
      text: "Still thinking about the moment the whole crowd sang the chorus together. Some nights stay with you.",
      images: ["music"],
    },
    {
      author: "talia",
      text: "Making a playlist for a slow Sunday morning. What’s the first song you’d add?",
    },
    {
      author: "haisenberg",
      text: "Night walks hit differently with the right soundtrack. Tonight’s mood: warm bass lines and a little bit of nostalgia.",
      images: ["city"],
    },
    {
      author: "mariam",
      text: "Put on an album from start to finish while painting today. No shuffle, no skipping. I’d forgotten how good that feels.",
    },
    {
      author: "daria",
      text: "A little snapshot from the weekend. Came for the music, stayed for the energy in the room.",
      images: ["music", "city"],
    },
    {
      author: "brook",
      text: "What was the first live show that made you fall in love with going to gigs? I want to hear the stories.",
    },
    {
      author: "nara",
      text: "That last song, when nobody wants the night to end. Already looking forward to doing it all again.",
      images: ["music"],
    },
    {
      author: "talia",
      text: "Community listening prompt: share a track by an artist you discovered recently. Let’s give our playlists a few new favorites.",
    },
  ],
};

const times = [
  "2 min ago",
  "12 min ago",
  "28 min ago",
  "1 hr ago",
  "2 hr ago",
  "3 hr ago",
  "5 hr ago",
  "Yesterday",
];
const likes = [12200, 548, 864, 1200, 93, 417, 263, 1920];
const comments = [244, 38, 62, 87, 14, 51, 29, 106];

export const communityPosts: Record<string, CommunityPost[]> =
  Object.fromEntries(
    Object.entries(seeds).map(([community, posts]) => [
      community,
      posts.map((post, index) => ({
        ...post,
        id: `post-${community}-${index}`,
        avatar:
          creators.find((creator) => creator.handle === post.author)?.avatar ??
          0,
        images: post.images ?? [],
        time: times[index],
        likes: likes[index],
        comments: comments[index],
      })),
    ]),
  );
