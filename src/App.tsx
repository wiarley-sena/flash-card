import { useState } from "react";
import { deck } from "./Data/Deck";
import { getRandomCard, buildOptions } from "./utils/cards";
import { saveStats } from "./utils/storage";
import { generateQuizFromContext } from "./utils/aiService"; // 1. Importação do serviço da IA
import type { Flashcard, Option, ScoreSummaryProps } from "./Types";
import { calculateScoreSummary } from "./utils/cards";
import Card from "./components/Card";
import Feedback from "./components/Feedback";
import "./App.css";

interface Round {
  card: Flashcard;
  options: Option[];
}

function createRound(currentDeck: Flashcard[], previousId?: number): Round {
  const card = getRandomCard(currentDeck, previousId);
  return { card, options: buildOptions(card, currentDeck) };
}

function App() {
  // Estados do Quiz
  const [activeDeck, setActiveDeck] = useState<Flashcard[]>(deck);
  const [round, setRound] = useState<Round>(() => createRound(deck));
  const [selected, setSelected] = useState<Option | null>(null);

  const [savedStats, setSavedStats] = useState<ReturnType<typeof saveStats> | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(1);
  const [numQuestions, setNumQuestions] = useState<number>(4);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const totalQuestions = Math.min(numQuestions, activeDeck.length);

  const [contextText, setContextText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAiMode, setIsAiMode] = useState(false);

  const handleSelect = (option: Option) => {
    if (selected) return;
    setSelected(option);

    if (option.isCorrect) {
      setCorrectCount((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (questionCount >= totalQuestions) {
      const percentage = (correctCount / totalQuestions) * 100;
      setSavedStats(saveStats(percentage));
      setIsFinished(true);
      return;
    }

    setRound(createRound(activeDeck, round.card.id));
    setSelected(null);
    setQuestionCount((prev) => prev + 1);
  };

const startSession = (newDeck: Flashcard[]) => {
  setActiveDeck(newDeck);
  setRound(createRound(newDeck));
  setSelected(null);
  setQuestionCount(1);
  setCorrectCount(0);
  setIsFinished(false);
  setSavedStats(null);
};

const handleRestart = () => startSession(activeDeck);

  const handleGenerateQuiz = async () => {
    if (!contextText.trim()) return;

    setIsLoading(true);
    try {
      const generatedCards = await generateQuizFromContext(contextText, numQuestions);
      
      if (generatedCards && generatedCards.length > 0) {
        setIsAiMode(true);
        startSession(generatedCards);
      }
    } catch (error) {
      alert("Erro ao gerar o quiz. Verifique a sua chave de API no ficheiro .env.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFinished) {
    const scoreSummary: ScoreSummaryProps = calculateScoreSummary(
      { correct: correctCount, total: totalQuestions },
      handleRestart
    );

    return (
      <main className="app">
        <h1>Cartões de memória</h1>
        <div className="score-summary">
          <p>Você acertou {scoreSummary.stats.correct} de {scoreSummary.stats.total} perguntas.</p>
          <p>Percentual de acertos: {scoreSummary.stats.percentage.toFixed(2)}%</p>
          <button onClick={scoreSummary.onRestart}>Reiniciar Sessão</button>
          
          <button onClick={() => { setIsFinished(false); setIsAiMode(false); }}>
            Gerar Novo Quiz com IA
          </button>
        </div>

        {savedStats && (
          <div className="saved-stats">
            <p>Melhor percentual de acertos: {savedStats.bestPercentage.toFixed(2)}%</p>
            <p>Total de sessões: {savedStats.totalSessions}</p>
          </div>
        )}
      </main>
    );
  }

  if (!isAiMode) {
    return (
      <main className="app">
        <h1>Gerar Quiz com IA 🤖</h1>
        <p>Cole abaixo um resumo ou texto de estudo para criarmos perguntas automáticas:</p>
        
        <textarea
          className="quiz-textarea"
          rows={6}
          value={contextText}
          onChange={(e) => setContextText(e.target.value)}
          placeholder="Ex: A Revolução Francesa foi um período de radicais transformações políticas e sociais..."
        />
        <label>
          Número de perguntas:{" "}
          <select
          className="select-numeros"
            value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              >
              {[4, 6, 8, 10, 15].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>

        <button 
          onClick={handleGenerateQuiz} 
          disabled={isLoading || !contextText.trim()}
          className="next"
        >
          {isLoading ? "A gerar perguntas..." : "Gerar Flashcards com IA"}
        </button>

        <div>
          <button onClick={() => { setIsAiMode(true); startSession(deck); }}>
            Ou jogar com o Deck Padrão
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="app">
      <h1>Cartões de memória</h1>

      <Card
        question={round.card.question}
        options={round.options}
        selected={selected}
        onSelect={handleSelect}
      />

      {selected && <Feedback isCorrect={selected.isCorrect} />}

      <button className="next" onClick={handleNext} disabled={!selected}>
        Next Question
      </button>
    </main>
  );
}

export default App;