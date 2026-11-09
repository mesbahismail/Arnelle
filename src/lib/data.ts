export * from "../../native/src/data";
import { PhotoKey } from "../../native/src/data";
export const photo = (key: PhotoKey) => `/media/${key}.jpg`;
