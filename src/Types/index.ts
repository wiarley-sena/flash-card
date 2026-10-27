export interface Flashcard {
    id: number;
    question: string;
    answer: string;
    info?: string;
}

export interface Option {
    letter: "A" | "B" | "C" | "D";
    text: string;
    isCorrect: boolean;
}

export interface SessionStats {
  correct: number;
  total: number;
  percentage: number;
}

export interface ScoreSummaryProps {
  stats: SessionStats;
  onRestart: () => void;
}