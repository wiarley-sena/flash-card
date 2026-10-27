import type { Option } from "../Types";
import AnswerOption from "./AnswerOption";

interface CardProps {
  question: string;
  options: Option[];
  selected: Option | null;
  onSelect: (option: Option) => void;
}

function Card({ question, options, selected, onSelect }: CardProps) {
  return (
    <section className="card">
      <h2 className="question">{question}</h2>
      <div className="options">
        {options.map((option) => (
          <AnswerOption
            key={option.letter}
            option={option}
            selected={selected}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  );
}

export default Card;