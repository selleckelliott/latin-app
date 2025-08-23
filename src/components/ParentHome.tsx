import { Button } from './ui/button';
import { Screen } from '../App';

interface ParentHomeProps {
  onNavigate: (screen: Screen) => void;
}

export function ParentHome({ onNavigate }: ParentHomeProps) {
  const students = [
    { name: 'Marcus', lessonsCompleted: 15, averageScore: 85 },
    { name: 'Julia', lessonsCompleted: 12, averageScore: 92 },
    { name: 'Lucius', lessonsCompleted: 8, averageScore: 78 },
  ];

  return (
    <div className="p-6 min-h-[600px] flex flex-col">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl text-gray-800 mb-2">Parent Dashboard</h1>
        <p className="text-lg text-gray-600">Track your children's progress</p>
      </div>

      {/* Student List */}
      <div className="flex-1 space-y-4 mb-6">
        {students.map((student, index) => (
          <div 
            key={index}
            onClick={() => onNavigate('progressView')}
            className="bg-gray-100 rounded-2xl p-4 cursor-pointer hover:bg-gray-200 transition-colors"
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
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        <Button 
          onClick={() => onNavigate('progressView')}
          className="w-full h-14 text-lg bg-gray-600 hover:bg-gray-500 text-white rounded-2xl"
        >
          View Progress
        </Button>
        
        <Button 
          onClick={() => onNavigate('assignLesson')}
          className="w-full h-14 text-lg bg-gray-800 hover:bg-gray-700 text-white rounded-2xl"
        >
          Assign Lesson
        </Button>
      </div>

      {/* Back Button */}
      <Button 
        onClick={() => onNavigate('login')}
        className="w-full h-12 mt-4 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-xl"
      >
        Back to Login
      </Button>
    </div>
  );
}