import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router';
import { Button } from '../../components/ui/button';
import { repos } from '../../data';
import { deriveProgress } from '../../domain/progress';

export function ParentHome() {
  const navigate = useNavigate();

  const rows = useLiveQuery(async () => {
    const students = await repos.profiles.students();
    return Promise.all(
      students.map(async (student) => ({
        student,
        stats: deriveProgress(await repos.attempts.forStudent(student.id)),
      })),
    );
  }, []);

  return (
    <div className="p-6 flex-1 flex flex-col">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl text-gray-800 mb-2">Parent Dashboard</h1>
        <p className="text-lg text-gray-600">Track your children's progress</p>
      </div>

      {/* Student List */}
      <div className="flex-1 space-y-4 mb-6">
        {rows?.map(({ student, stats }) => (
          <button
            key={student.id}
            type="button"
            onClick={() => navigate(`/parent/student/${student.id}`)}
            className="w-full bg-gray-100 rounded-2xl p-4 hover:bg-gray-200 transition-colors text-left"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="text-3xl" aria-hidden="true">
                  {student.avatarEmoji}
                </span>
                <div>
                  <h3 className="text-xl text-gray-800">{student.name}</h3>
                  <p className="text-gray-600">Lessons: {stats.lessonsCompleted}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg text-gray-800">{stats.averageScorePct}%</p>
                <p className="text-sm text-gray-600">Avg Score</p>
              </div>
            </div>
          </button>
        ))}
        {rows?.length === 0 && <p className="text-center text-gray-500">No student profiles yet</p>}
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        <Button
          onClick={() => navigate('/parent/assign')}
          className="w-full h-14 text-lg bg-gray-800 hover:bg-gray-700 text-white rounded-2xl"
        >
          Assign Lesson
        </Button>
      </div>

      {/* Back Button */}
      <Button
        onClick={() => navigate('/')}
        className="w-full h-12 mt-4 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-xl"
      >
        Back to profiles
      </Button>
    </div>
  );
}
