import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate, useParams } from 'react-router';
import { Button } from '../../components/ui/button';
import { repos } from '../../data';
import { deriveProgress } from '../../domain/progress';
import { percentage } from '../../domain/scoring';
import { ACTIVITY_META } from '../student/activity-meta';

export function ProgressView() {
  const { sid } = useParams<{ sid: string }>();
  const navigate = useNavigate();

  const data = useLiveQuery(async () => {
    if (!sid) {
      return { student: null, stats: null };
    }
    const student = (await repos.profiles.get(sid)) ?? null;
    if (!student) {
      return { student: null, stats: null };
    }
    const attempts = await repos.attempts.forStudent(sid);
    return { student, stats: deriveProgress(attempts) };
  }, [sid]);

  if (data === undefined) {
    return null; // loading from IndexedDB
  }

  const { student, stats } = data;
  if (!student || !stats) {
    return (
      <div className="p-6 flex-1 flex flex-col items-center justify-center">
        <p className="text-lg text-gray-600 mb-6">Student not found</p>
        <Button
          onClick={() => navigate('/parent')}
          className="w-full h-12 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-xl"
        >
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 flex-1 flex flex-col">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl text-gray-800 mb-2">
          <span aria-hidden="true">{student.avatarEmoji}</span> {student.name}'s Progress
        </h1>
        <p className="text-lg text-gray-600">Detailed performance overview</p>
      </div>

      {/* Progress Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-100 rounded-2xl p-4 text-center">
          <h3 className="text-lg text-gray-800">Lessons</h3>
          <p className="text-2xl text-gray-800">{stats.lessonsCompleted}</p>
          <p className="text-sm text-gray-600">Completed</p>
        </div>

        <div className="bg-gray-100 rounded-2xl p-4 text-center">
          <h3 className="text-lg text-gray-800">Average</h3>
          <p className="text-2xl text-gray-800">{stats.averageScorePct}%</p>
          <p className="text-sm text-gray-600">Score</p>
        </div>
      </div>

      {/* Per-activity breakdown */}
      <div className="bg-gray-100 rounded-2xl p-4 mb-6">
        <h3 className="text-lg text-gray-800 mb-3">By activity</h3>
        <div className="space-y-2">
          {(Object.keys(ACTIVITY_META) as (keyof typeof ACTIVITY_META)[]).map((activity) => {
            const meta = ACTIVITY_META[activity];
            const activityStats = stats.byActivity[activity];
            return (
              <div key={activity} className="flex justify-between items-center">
                <p className="text-gray-800">
                  <span aria-hidden="true">{meta.emoji}</span> {meta.title}
                </p>
                <p className="text-gray-600">
                  {activityStats.count === 0
                    ? 'Not tried yet'
                    : `${activityStats.count}× · avg ${activityStats.averageScorePct}%`}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent attempts */}
      <div className="flex-1 bg-gray-100 rounded-2xl p-4 mb-6">
        <h3 className="text-lg text-gray-800 mb-4">Recent Lessons</h3>
        {stats.recentAttempts.length === 0 ? (
          <p className="text-gray-500">No lessons completed yet</p>
        ) : (
          <div className="space-y-3">
            {stats.recentAttempts.map((attempt) => (
              <div
                key={attempt.id}
                className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0"
              >
                <div>
                  <p className="text-gray-800">{ACTIVITY_META[attempt.activity].title}</p>
                  <p className="text-sm text-gray-600">{attempt.completedAt.slice(0, 10)}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg text-gray-800">
                    {percentage(attempt.score, attempt.total)}%
                  </p>
                  <p className="text-sm text-gray-600">
                    {attempt.score}/{attempt.total}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Back Button */}
      <Button
        onClick={() => navigate('/parent')}
        className="w-full h-12 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-xl"
      >
        Back to Dashboard
      </Button>
    </div>
  );
}
