import { HelpCircle } from "lucide-react";

export default function QuestionCards({ questions = [] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {questions.map((q, i) => (
        <div
          key={i}
          className="card card-hover flex items-start gap-3 p-4"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15">
            <HelpCircle size={18} className="text-primary" />
          </div>
          <p className="text-sm leading-relaxed">{q}</p>
        </div>
      ))}
    </div>
  );
}
