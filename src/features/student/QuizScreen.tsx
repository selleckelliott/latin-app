import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router';
import { Button } from '../../components/ui/button';
import { getUnit } from '../../content/loader';
import type { Unit } from '../../content/schema';
import { recordAttempt } from '../../data';
import { scoreQuiz } from '../../domain/scoring';

export function QuizScreen() {
  const { sid, uid } = useParams<{ sid: string; uid: string }>();
  const unit = uid ? getUnit(uid) : undefined;

  if (!unit || !sid) {
    return <Navigate to={sid ? `/student/${sid}` : '/'} replace />;
  }
  return <Quiz unit={unit} sid={sid} />;
}

function Quiz({ unit, sid }: { unit: Unit; sid: string }) {
  const navigate = useNavigate();
  const questions = unit.quiz;

  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [finishing, setFinishing] = useState(false);

  const question = questions[questionIndex];
  const isLast = questionIndex === questions.length - 1;

  const finish = async (finalAnswers: number[]) => {
    setFinishing(true);
    const { score, total } = scoreQuiz(questions, finalAnswers);
    const attempt = {
      id: crypto.randomUUID(),
      profileId: sid,
      unitId: unit.id,
      activity: 'quiz' as const,
      score,
      total,
      answers: finalAnswers,
      completedAt: new Date().toISOString(),
    };
    await recordAttempt(attempt);
    navigate(`/student/${sid}/unit/${unit.id}/results?attemptId=${attempt.id}`, {
      replace: true,
    });
  };

  const next = () => {
    if (picked === null || finishing) return;
    const newAnswers = [...answers, picked];
    if (isLast) {
      void finish(newAnswers);
      return;
    }
    setAnswers(newAnswers);
    setQuestionIndex(questionIndex + 1);
    setPicked(null);
  };

  const choiceClasses = (choiceIndex: number) => {
    if (picked === null) {
      return 'bg-white text-gray-800 border-gray-300 hover:border-gray-400';
    }
    if (choiceIndex === question.answerIndex) {
      return 'bg-green-600 border-green-600 text-white';
    }
    if (choiceIndex === picked) {
      return 'bg-red-500 border-red-500 text-white';
    }
    return 'bg-white text-gray-400 border-gray-200';
  };

  return (
    <div className="p-6 flex-1 flex flex-col">
      {/* Progress */}
      <div className="text-center mb-6">
        <p className="text-lg text-gray-600">
          Question {questionIndex + 1} of {questions.length}
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div
            className="bg-gray-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">
            {question.emoji}
          </div>
          <h2 className="text-2xl text-gray-800 mb-6">{question.prompt}</h2>
        </div>

        {/* Answer choices lock on first tap and show green/red feedback */}
        <div className="space-y-4 mb-8">
          {question.choices.map((choice, choiceIndex) => (
            <Button
              key={choice}
              onClick={() => picked === null && setPicked(choiceIndex)}
              className={`w-full h-14 text-lg rounded-2xl border-2 transition-all ${choiceClasses(choiceIndex)}`}
            >
              {choice}
            </Button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex space-x-4">
        <Button
          onClick={() => navigate(`/student/${sid}`)}
          className="flex-1 h-12 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-xl"
        >
          Back
        </Button>

        <Button
          onClick={next}
          disabled={picked === null || finishing}
          className="flex-1 h-12 bg-gray-800 hover:bg-gray-700 text-white rounded-xl disabled:bg-gray-400"
        >
          {isLast ? 'Finish' : 'Next'}
        </Button>
      </div>
    </div>
  );
}
