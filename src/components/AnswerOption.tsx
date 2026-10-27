import type { Option } from "../Types";

interface AnswerOptionProps {
  option: Option;
  selected: Option | null;
  onSelect: (option: Option) => void;
}

function AnswerOption({ option, selected, onSelect }: AnswerOptionProps) {
  const answered = selected !== null;

  let className = "option";
  if (answered && option.isCorrect) className += " correct";
  else if (answered && option.letter === selected.letter) className += " wrong";

  return (
    <button
      className={className}
      onClick={() => onSelect(option)}
      disabled={answered}
    >
      <span className="letter">{option.letter}</span>
      {option.text}
    </button>
  );
}

export default AnswerOption;