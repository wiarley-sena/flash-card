import type { Flashcard, Option, ScoreSummaryProps} from "../Types"

const LETTERS = ["A", "B", "C", "D"] as const;

export function shuffle<T>(array: T[]): T[] {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

let usedIds: number[] = [];

export function getRandomCard(deck: Flashcard[], previousId?: number): Flashcard {
    if(previousId === undefined) usedIds = [];

    let candidates = deck.filter((card)=> !usedIds.includes(card.id));

    if(candidates.length === 0) {
        usedIds = [];
        candidates = deck.length > 1 ? deck.filter((card)=> card.id !== previousId) : deck;
    }
    
    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
    usedIds.push(chosen.id);
    return chosen;
}

export function buildOptions(card: Flashcard, deck: Flashcard[]): Option[]{
    const wrongAnswers = shuffle(
        deck.filter((other)=> other.id !== card.id && other.answer !== card.answer)
        .map((other)=> other.answer)
    ).slice(0, 3);
    
    const texts = shuffle([card.answer, ...wrongAnswers]);

    return texts.map((text, index)=> ({
        letter: LETTERS[index],
        text,
        isCorrect: text === card.answer
    }));
}

export function calculateScoreSummary(
    stats: { correct: number; total: number }, onRestartCallback: () => void
): ScoreSummaryProps {
    const { correct, total } = stats;
    const percentage = total > 0 ? (correct / total) * 100 : 0;
    return {
        stats: { correct, total, percentage },
        onRestart: onRestartCallback
    } }