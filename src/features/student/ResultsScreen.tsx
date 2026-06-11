import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { Button } from '../../components/ui/button';
import { repos } from '../../data';
import { percentage } from '../../domain/scoring';
import { ACTIVITY_META } from './activity-meta';

export function ResultsScreen() {
  const { sid, uid } = useParams<{ sid: string; uid: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const attemptId = searchParams.get('attemptId');

  // Read the recorded attempt; fall back to the latest one for this unit so
  // the screen still works after a refresh that drops the query string.
  const attempt = useLiveQuery(async () => {
    if (attemptId) {
      return (await repos.attempts.get(attemptId)) ?? null;
    }
    if (!sid || !uid) {
      return null;
    }
    const all = await repos.attempts.forStudent(sid);
    const forUnit = all
      .filter((a) => a.unitId === uid)
      .sort((a, b) => b.completedAt.localeCompare(a.completedAt));
    return forUnit[0] ?? null;
  }, [attemptId, sid, uid]);

  if (attempt === undefined) {
    return null; // loading from IndexedDB
  }

  if (attempt === null) {
    return (
      <div className="p-6 flex-1 flex flex-col items-center justify-center">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl">
            🔍
          </div>
          <h1 className="text-2xl text-gray-800 mb-2">No results yet</h1>
          <p className="text-lg text-gray-600">Finish an activity to see your score!</p>
        </div>
        <Button
          onClick={() => navigate(`/student/${sid}`)}
          className="w-full h-14 text-lg bg-gray-800 hover:bg-gray-700 text-white rounded-2xl"
        >
          Back to Home
        </Button>
      </div>
    );
  }

  const pct = percentage(attempt.score, attempt.total);
  const emoji = pct >= 80 ? '😄' : pct >= 60 ? '🙂' : '🤔';
  const message = pct >= 80 ? 'Excellent work!' : pct >= 60 ? 'Good job!' : 'Keep practicing!';
  const meta = ACTIVITY_META[attempt.activity];

  return (
    <div className="p-6 flex-1 flex flex-col items-center justify-center">
      {/* Score Display */}
      <div className="text-center mb-8">
        <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl">
          {emoji}
        </div>

        <h1 className="text-3xl text-gray-800 mb-4">{message}</h1>

        <div className="bg-gray-100 rounded-2xl p-6 mb-6">
          <p className="text-lg text-gray-600 mb-2">
            {meta.emoji} {meta.title}
          </p>
          <p className="text-2xl text-gray-800 mb-2">
            {attempt.score} out of {attempt.total} correct!
          </p>
          <p className="text-xl text-gray-600">{pct}%</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full space-y-4">
        <Button
          onClick={() => navigate(`/student/${sid}/unit/${attempt.unitId}/${attempt.activity}`)}
          className="w-full h-14 text-lg bg-gray-600 hover:bg-gray-500 text-white rounded-2xl"
        >
          Try Again
        </Button>

        <Button
          onClick={() => navigate(`/student/${sid}`)}
          className="w-full h-14 text-lg bg-gray-800 hover:bg-gray-700 text-white rounded-2xl"
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
}
