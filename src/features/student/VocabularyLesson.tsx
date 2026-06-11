import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router';
import { Button } from '../../components/ui/button';
import { getUnit } from '../../content/loader';
import type { Unit } from '../../content/schema';
import { recordAttempt } from '../../data';

export function VocabularyLesson() {
  const { sid, uid } = useParams<{ sid: string; uid: string }>();
  const unit = uid ? getUnit(uid) : undefined;

  if (!unit || !sid) {
    return <Navigate to={sid ? `/student/${sid}` : '/'} replace />;
  }
  return <VocabDeck unit={unit} sid={sid} />;
}

function VocabDeck({ unit, sid }: { unit: Unit; sid: string }) {
  const navigate = useNavigate();
  const total = unit.vocab.length;

  // Queue of card indices still to master; practice-again moves the current
  // card to the end. Cards ever requeued don't count toward the score.
  const [queue, setQueue] = useState<number[]>(() => unit.vocab.map((_, i) => i));
  const [needsPractice, setNeedsPractice] = useState<ReadonlySet<number>>(new Set());
  const [showMeaning, setShowMeaning] = useState(false);
  const [finishing, setFinishing] = useState(false);

  const currentIndex = queue[0];
  const currentWord = unit.vocab[currentIndex];
  const mastered = total - queue.length;

  const finishDeck = async (finalNeedsPractice: ReadonlySet<number>) => {
    setFinishing(true);
    const attempt = {
      id: crypto.randomUUID(),
      profileId: sid,
      unitId: unit.id,
      activity: 'vocab' as const,
      score: total - finalNeedsPractice.size,
      total,
      completedAt: new Date().toISOString(),
    };
    await recordAttempt(attempt);
    navigate(`/student/${sid}/unit/${unit.id}/results?attemptId=${attempt.id}`, {
      replace: true,
    });
  };

  const knowIt = () => {
    if (finishing) return;
    const rest = queue.slice(1);
    if (rest.length === 0) {
      void finishDeck(needsPractice);
      return;
    }
    setQueue(rest);
    setShowMeaning(false);
  };

  const practiceAgain = () => {
    if (finishing) return;
    setQueue([...queue.slice(1), currentIndex]);
    setNeedsPractice(new Set([...needsPractice, currentIndex]));
    setShowMeaning(false);
  };

  if (!currentWord) {
    return null;
  }

  return (
    <div className="p-6 flex-1 flex flex-col">
      {/* Progress */}
      <div className="text-center mb-6">
        <p className="text-lg text-gray-600">
          {mastered} of {total} words done
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div
            className="bg-gray-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(mastered / total) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Flashcard */}
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-gray-100 rounded-3xl p-8 w-full max-w-xs text-center shadow-lg">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">
              {currentWord.emoji}
            </div>
            <h2 className="text-4xl text-gray-800 mb-4">
              {showMeaning ? currentWord.meaning : currentWord.latin}
            </h2>
          </div>

          <Button
            onClick={() => setShowMeaning(!showMeaning)}
            className="w-full h-12 bg-gray-600 hover:bg-gray-500 text-white rounded-xl mb-4"
          >
            {showMeaning ? 'Show Latin' : 'Flip Card'}
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      {showMeaning && (
        <div className="space-y-4">
          <Button
            onClick={knowIt}
            disabled={finishing}
            className="w-full h-14 text-lg bg-gray-800 hover:bg-gray-700 text-white rounded-2xl disabled:bg-gray-400"
          >
            I Know It
          </Button>

          <Button
            onClick={practiceAgain}
            disabled={finishing}
            className="w-full h-14 text-lg bg-gray-500 hover:bg-gray-400 text-white rounded-2xl disabled:bg-gray-400"
          >
            Practice Again
          </Button>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-6">
        <Button
          onClick={() => navigate(`/student/${sid}`)}
          className="w-full h-12 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-xl"
        >
          Back
        </Button>
      </div>
    </div>
  );
}
