/** Implement these interfaces to connect your own authenticated backend.
 * Never embed provider secrets in the client. Generate broadcast credentials on a server.
 * The included application is a local demo, not a broadcasting or payment service.
 */
export interface LiveSession {
  id: string;
  host: string;
  playbackUrl: string;
  viewerCount: number;
}
export interface SocialBackend {
  getLiveSession(id: string): Promise<LiveSession>;
  sendMessage(recipientId: string, text: string): Promise<{ id: string }>;
  uploadStory(
    localUri: string,
    audience: "public" | "private",
  ): Promise<{ url: string }>;
  sendGift(sessionId: string, giftId: string): Promise<{ balance: number }>;
  subscribeToComments(
    sessionId: string,
    callback: (comment: { user: string; text: string }) => void,
  ): () => void;
}
export const demoVideoUrl =
  "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4";
/** Set to your server-issued HLS URL to enable live playback. */
export const livePlaybackUrl: string | null = null;
