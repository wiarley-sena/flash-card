interface FeedbackProps {
  isCorrect: boolean;
}

function Feedback({ isCorrect }: FeedbackProps) {
  return (
    <p className={isCorrect ? "feedback success" : "feedback error"}>
      {isCorrect
        ? "🎉 Parabéns! Resposta correta."
        : "❌ Resposta errada. A correta está destacada em verde."}
    </p>
  );
}

export default Feedback;