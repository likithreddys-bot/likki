export type Video = {
  title: string;
  url: string;
  /** Empty string = no thumbnail known (UI draws a placeholder). */
  thumbnail: string;
};

export type Choice = [string, string, string, string];

export type QuizItem = {
  question: string;
  options: Choice;
  /** 0–3 */
  correct: number;
  explanation: string;
};

export type SessionContent = {
  title: string;
  markdown: string;
  videos: Video[];
  /** Practice questions shown inside the session. Never block progress. */
  quizzes: QuizItem[];
};

export type TopicContent = {
  slug: string;
  title: string;
  description: string;
  sessions: SessionContent[];
  finalQuiz: QuizItem[];
};

/** A video we are confident exists, with its real thumbnail. */
export const yt = (id: string, title: string): Video => ({
  title,
  url: `https://www.youtube.com/watch?v=${id}`,
  thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
});

/** A YouTube search link — used where no specific video has been curated yet. */
export const ytSearch = (query: string, title?: string): Video => ({
  title: title ?? `Search YouTube: ${query}`,
  url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
  thumbnail: '',
});

/** Extra material appended to an existing topic: more sessions at the end, more questions in its final quiz. */
export type TopicExtra = {
  sessions: SessionContent[];
  finalQuiz: QuizItem[];
};
