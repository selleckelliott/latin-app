import { useNavigate } from 'react-router';
import { Button } from '../../components/ui/button';

export function ParentHome() {
  const navigate = useNavigate();

  // Placeholder rows until phase 7 wires real profiles + derived stats.
  const students = [
    { id: 'marcus', name: 'Marcus', lessonsCompleted: 15, averageScore: 85 },
    { id: 'julia', name: 'Julia', lessonsCompleted: 12, averageScore: 92 },
  ];

  return (
    <div className="p-6 flex-1 flex flex-col">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl text-gray-800 mb-2">Parent Dashboard</h1>
        <p className="text-lg text-gray-600">Track your children's progress</p>
      </div>

      {/* Student List */}
      <div className="flex-1 space-y-4 mb-6">
        {students.map((student) => (
          <button
            key={student.id}
            type="button"
            onClick={() => navigate(`/parent/student/${student.id}`)}
            className="w-full bg-gray-100 rounded-2xl p-4 hover:bg-gray-200 transition-colors text-left"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl text-gray-800">{student.name}</h3>
                <p className="text-gray-600">Lessons: {student.lessonsCompleted}</p>
              </div>
              <div className="text-right">
                <p className="text-lg text-gray-800">{student.averageScore}%</p>
                <p className="text-sm text-gray-600">Avg Score</p>
              </div>
            </div>
          </button>
        ))}
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
