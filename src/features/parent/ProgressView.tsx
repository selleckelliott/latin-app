import { useNavigate, useParams } from 'react-router';
import { Button } from '../../components/ui/button';

export function ProgressView() {
  const { sid } = useParams<{ sid: string }>();
  const navigate = useNavigate();

  // Placeholder data until phase 7 derives stats from real attempts.
  const studentName = sid ?? 'Student';
  const progressData = [
    { date: '2024-01-15', lesson: 'Vocabulary 1', score: 85 },
    { date: '2024-01-16', lesson: 'Grammar 1', score: 92 },
    { date: '2024-01-17', lesson: 'Quiz 1', score: 88 },
  ];

  return (
    <div className="p-6 flex-1 flex flex-col">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl text-gray-800 mb-2">{studentName}'s Progress</h1>
        <p className="text-lg text-gray-600">Detailed performance overview</p>
      </div>

      {/* Progress Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-100 rounded-2xl p-4 text-center">
          <h3 className="text-lg text-gray-800">Lessons</h3>
          <p className="text-2xl text-gray-800">15</p>
          <p className="text-sm text-gray-600">Completed</p>
        </div>

        <div className="bg-gray-100 rounded-2xl p-4 text-center">
          <h3 className="text-lg text-gray-800">Average</h3>
          <p className="text-2xl text-gray-800">87%</p>
          <p className="text-sm text-gray-600">Score</p>
        </div>
      </div>

      {/* Recent Lessons Table */}
      <div className="flex-1 bg-gray-100 rounded-2xl p-4 mb-6">
        <h3 className="text-lg text-gray-800 mb-4">Recent Lessons</h3>
        <div className="space-y-3">
          {progressData.map((item, index) => (
            <div
              key={index}
              className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0"
            >
              <div>
                <p className="text-gray-800">{item.lesson}</p>
                <p className="text-sm text-gray-600">{item.date}</p>
              </div>
              <div className="text-right">
                <p className="text-lg text-gray-800">{item.score}%</p>
              </div>
            </div>
          ))}
        </div>
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
