import { File, Paths } from "expo-file-system";
/** Generates an original 30-second melody, so the template needs no copyrighted audio. */
export function createDemoMelody(): string | null {
  try {
    const file = new File(Paths.cache, "rnl-original-melody-v1.wav");
    if (file.exists) return file.uri;
    const rate = 22050,
      count = rate * 30;
    const bytes = new Uint8Array(44 + count * 2);
    const view = new DataView(bytes.buffer);
    const text = (offset: number, value: string) =>
      [...value].forEach((c, i) => view.setUint8(offset + i, c.charCodeAt(0)));
    text(0, "RIFF");
    view.setUint32(4, 36 + count * 2, true);
    text(8, "WAVE");
    text(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, rate, true);
    view.setUint32(28, rate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    text(36, "data");
    view.setUint32(40, count * 2, true);
    const notes = [261.63, 329.63, 392, 523.25, 392, 329.63, 293.66, 349.23];
    for (let n = 0; n < count; n++) {
      const t = n / rate,
        local = t % 0.4,
        frequency = notes[Math.floor(t / 0.4) % notes.length];
      const envelope = Math.min(local / 0.02, 1) * Math.max(0, 1 - local / 0.4);
      view.setInt16(
        44 + n * 2,
        Math.round(6000 * Math.sin(2 * Math.PI * frequency * t) * envelope),
        true,
      );
    }
    file.create({ overwrite: true });
    file.write(bytes);
    return file.uri;
  } catch {
    return null;
  }
}
/** Keep selected/captured photos outside iOS temporary storage. Remote demo photos need no copy. */
export async function persistStoryPhoto(uri: string): Promise<string> {
  if (uri.startsWith("https://") || uri.startsWith(Paths.document.uri))
    return uri;
  const target = new File(Paths.document, `rnl-story-${Date.now()}.jpg`);
  new File(uri).copy(target);
  return target.uri;
}
