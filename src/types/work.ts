import type { Rating } from "./fic";

export type WorkCompletion = "ongoing" | "completed";
export type PublishStatus = "draft" | "published";

/** Which accent a voiced line takes: Caitlyn blue, Vi red, or the neutral Kiramman green. */
export type VoiceTone = "caitlyn" | "vi" | "other";

export type WorkSummary = {
  slug: string;
  title: string;
  summary: string;
  note: string;
  lang: string;
  rating: Rating | null;
  completion: WorkCompletion;
  status: PublishStatus;
  tags: string[];
  ao3Link: string | null;
  publishedAt: number | null;
  chapterCount: number;
  words: number;
  voiceCount: number;
};

export type ChapterSummary = {
  number: number;
  title: string;
  words: number;
  voiceCount: number;
  status: PublishStatus;
};

export type ChapterDetail = ChapterSummary & {
  body: string;
};

export type VoiceClip = {
  index: number;
  src: string;
  speaker: string;
  text: string;
  tone: VoiceTone;
};

export type RenderedChapter = {
  html: string;
  clips: VoiceClip[];
};
