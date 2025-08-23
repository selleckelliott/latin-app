import { Button } from './ui/button';
import { Screen } from '../App';

interface ProgressViewProps {
  studentName: string;
  onNavigate: (screen: Screen) => void;
}

export function ProgressView({ studentName, onNavigate }: ProgressViewProps) {
  const progressData = [
    { date: '2024-01-15', lesson: 'Vocabulary 1', score: 85 },
    { date: '2024-01-16', lesson: 'Grammar 1', score: 92 },
    { date: '2024-01-17', lesson: 'Quiz 1', score: 88 },
    { date: '2024-01-18', lesson: 'Vocabulary 2', score: 95 },
    { date: '2024-01-19', lesson: 'Grammar 2', score: 78 },
  ];

  return (
    <div className="p-6 min-h-[600px] flex flex-col">
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

      {/* Simple Progress Bar Chart */}
      <div className="bg-gray-100 rounded-2xl p-4 mb-6">
        <h3 className="text-lg text-gray-800 mb-4">Recent Performance</h3>
        <div className="space-y-2">
          {progressData.slice(-3).map((item, index) => (
            <div key={index} className="flex items-center space-x-3">
              <span className="text-sm text-gray-600 w-20">{item.score}%</span>
              <div className="flex-1 bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-gray-600 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${item.score}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Lessons Table */}
      <div className="flex-1 bg-gray-100 rounded-2xl p-4 mb-6">
        <h3 className="text-lg text-gray-800 mb-4">Recent Lessons</h3>
        <div className="space-y-3">
          {progressData.map((item, index) => (
            <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
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
        onClick={() => onNavigate('parentHome')}
        className="w-full h-12 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-xl"
      >
        Back to Dashboard
      </Button>
    </div>
  );
}