import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router';
import { Button } from '../../components/ui/button';
import { getUnit } from '../../content/loader';
import type { Unit } from '../../content/schema';
import { recordAttempt } from '../../data';
import { scoreGrammar } from '../../domain/scoring';

export function GrammarGame() {
  const { sid, uid } = useParams<{ sid: string; uid: string }>();
  const unit = uid ? getUnit(uid) : undefined;

  if (!unit || !sid) {
    return <Navigate to={sid ? `/student/${sid}` : '/'} replace />;
  }
  return <GrammarBoard unit={unit} sid={sid} />;
}

function GrammarBoard({ unit, sid }: { unit: Unit; sid: string }) {
  const navigate = useNavigate();
  const items = unit.grammar;

  // One locked-in answer per item; answers give immediate green/red feedback.
  const [selected, setSelected] = useState<(string | undefined)[]>(() =>
    items.map(() => undefined),
  );
  const [finishing, setFinishing] = useState(false);

  const allAnswered = selected.every((choice) => choice !== undefined);
  const { score, total } = scoreGrammar(items, selected);

  const pick = (itemIndex: number, option: string) => {
    if (selected[itemIndex] !== undefined) return; // locked after first tap
    setSelected((prev) => prev.map((choice, i) => (i === itemIndex ? option : choice)));
  };

  const finish = async () => {
    setFinishing(true);
    const attempt = {
      id: crypto.randomUUID(),
      profileId: sid,
      unitId: unit.id,
      activity: 'grammar' as const,
      score,
      total,
      completedAt: new Date().toISOString(),
    };
    await recordAttempt(attempt);
    navigate(`/student/${sid}/unit/${unit.id}/results?attemptId=${attempt.id}`, {
      replace: true,
    });
  };

  const optionClasses = (itemIndex: number, option: string) => {
    const answer = selected[itemIndex];
    if (answer === undefined) {
      return 'bg-white text-gray-800 border-gray-300 hover:border-gray-400';
    }
    if (option === items[itemIndex].correct) {
      return 'bg-green-600 border-green-600 text-white';
    }
    if (option === answer) {
      return 'bg-red-500 border-red-500 text-white';
    }
    return 'bg-white text-gray-400 border-gray-200';
  };

  return (
    <div className="p-6 flex-1 flex flex-col">
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-2xl text-gray-800 mb-2">Grammar Game</h1>
        <p className="text-lg text-gray-600">Pick the right ending!</p>
      </div>

      {/* Questions */}
      <div className="flex-1 space-y-6">
        {items.map((item, itemIndex) => (
          <div
            key={item.id}
            data-testid={`grammar-item-${item.id}`}
            className="bg-gray-100 rounded-2xl p-6"
          >
            <h3 className="text-xl text-center text-gray-800 mb-4">{item.word}</h3>

            <div className="grid grid-cols-3 gap-3">
              {item.options.map((option) => (
                <Button
                  key={option}
                  onClick={() => pick(itemIndex, option)}
                  className={`h-12 text-lg rounded-xl border-2 transition-all ${optionClasses(itemIndex, option)}`}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Score + finish */}
      {allAnswered && (
        <div className="bg-gray-200 rounded-2xl p-4 my-4 text-center">
          <p className="text-lg text-gray-800">
            Score: {score} out of {total}
          </p>
        </div>
      )}

      {allAnswered ? (
        <Button
          onClick={() => void finish()}
          disabled={finishing}
          className="w-full h-14 text-lg bg-gray-800 hover:bg-gray-700 text-white rounded-2xl disabled:bg-gray-400 mb-4"
        >
          See Results
        </Button>
      ) : (
        <p className="text-center text-gray-500 my-4">Answer every word to finish</p>
      )}

      {/* Back Button */}
      <Button
        onClick={() => navigate(`/student/${sid}`)}
        className="w-full h-12 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-xl"
      >
        Back to Home
      </Button>
    </div>
  );
}
