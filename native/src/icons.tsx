import React from "react";
import {
  Circle,
  Aperture,
  Archive,
  ArrowDownToLine,
  ArrowRight,
  Bell,
  Bookmark,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  CircleUserRound,
  Compass,
  Crop,
  EllipsisVertical,
  Gift,
  Globe,
  Heart,
  Image,
  Lightbulb,
  ListFilter,
  LockKeyhole,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  MessagesSquare,
  Music2,
  Palette,
  Pause,
  Pencil,
  Play,
  Plus,
  Power,
  RefreshCw,
  Search,
  Send,
  Settings,
  Share2,
  Smile,
  Sparkles,
  Star,
  Type,
  UserPlus,
  Users,
  Volume2,
  VolumeX,
  Zap,
  ZapOff,
} from "lucide-react-native";
import { SvgXml } from "react-native-svg";
const icons = {
  add: Plus,
  aperture: Aperture,
  archive: Archive,
  "arrow-forward": ArrowRight,
  "arrow-redo": Share2,
  bookmark: Bookmark,
  "bookmark-outline": Bookmark,
  "bulb-outline": Lightbulb,
  camera: Camera,
  "camera-reverse": RefreshCw,
  chatbox: MessageSquare,
  chatbubbles: MessagesSquare,
  checkmark: Check,
  "checkmark-circle": CheckCircle2,
  "chevron-back": ChevronLeft,
  "chevron-down": ChevronDown,
  "chevron-forward": ChevronRight,
  close: Plus,
  "color-filter": Palette,
  compass: Compass,
  crop: Crop,
  download: ArrowDownToLine,
  "ellipsis-vertical": EllipsisVertical,
  filter: ListFilter,
  flash: Zap,
  "flash-off": ZapOff,
  gift: Gift,
  "gift-outline": Gift,
  globe: Globe,
  earth: Globe,
  "ellipse-outline": Circle,
  happy: Smile,
  heart: Heart,
  "heart-outline": Heart,
  "help-circle": CircleHelp,
  "help-circle-outline": CircleHelp,
  image: Image,
  "image-outline": Image,
  "lock-closed": LockKeyhole,
  "log-out": LogOut,
  mail: Mail,
  menu: Menu,
  "musical-note": Music2,
  notifications: Bell,
  pause: Pause,
  pencil: Pencil,
  people: Users,
  "person-add": UserPlus,
  "person-circle": CircleUserRound,
  play: Play,
  power: Power,
  search: Search,
  send: Send,
  settings: Settings,
  "share-social": Share2,
  sparkles: Sparkles,
  star: Star,
  text: Type,
  "volume-high": Volume2,
  "volume-mute": VolumeX,
};
export type IconName = keyof typeof icons | "logo-facebook" | "logo-google";
export function Icon({
  name,
  size = 20,
  color = "#faf9f7",
}: {
  name: IconName;
  size?: number;
  color?: string;
}) {
  // Brand marks are trademarks, kept separate from Lucide's interface icon set.
  if (name === "logo-google" || name === "logo-facebook")
    return (
      <SvgXml
        width={size}
        height={size}
        xml={`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${color}" d="${name === "logo-google" ? "M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.36ZM12 22c2.7 0 4.96-.9 6.62-2.41l-3.24-2.51c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.07v2.59A10 10 0 0 0 12 22ZM6.41 13.92a6 6 0 0 1 0-3.84V7.49H3.07a10 10 0 0 0 0 9.02l3.34-2.59ZM12 5.96c1.47 0 2.79.5 3.82 1.5l2.86-2.86A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.93 5.49l3.34 2.59A5.98 5.98 0 0 1 12 5.96Z" : "M24 12a12 12 0 1 0-13.88 11.85v-8.38H7.08V12h3.04V9.36c0-3.01 1.8-4.67 4.56-4.67 1.32 0 2.7.24 2.7.24V7.9h-1.52c-1.5 0-1.98.93-1.98 1.88V12h3.37l-.54 3.47h-2.83v8.38A12 12 0 0 0 24 12Z"}"/></svg>`}
      />
    );
  const Glyph = icons[name];
  return (
    <Glyph
      size={size}
      color={color}
      strokeWidth={1.8}
      fill={name === "heart" ? color : "none"}
      style={
        name === "close" ? { transform: [{ rotate: "45deg" }] } : undefined
      }
    />
  );
}
