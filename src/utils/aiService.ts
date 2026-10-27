import type { Flashcard } from "../Types";

export async function generateQuizFromContext(
  contextText: string,
  count: number
): Promise<Flashcard[]> {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contextText, count }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? `Erro ${res.status}`);

  return (data.flashcards as Flashcard[]).map((card, index) => ({ ...card, id: index + 1 }));
}