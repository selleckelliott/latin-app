import { Button } from './ui/button';
import { Screen } from '../App';

interface ResultsScreenProps {
  score: number;
  total: number;
  onNavigate: (screen: Screen) => void;
}

export function ResultsScreen({ score, total, onNavigate }: ResultsScreenProps) {
  const percentage = Math.round((score / total) * 100);
  
  const getEmoji = () => {
    if (percentage >= 80) return '😄';
    if (percentage >= 60) return '🙂';
    return '🤔';
  };

  const getMessage = () => {
    if (percentage >= 80) return 'Excellent work!';
    if (percentage >= 60) return 'Good job!';
    return 'Keep practicing!';
  };

  return (
    <div className="p-6 min-h-[600px] flex flex-col items-center justify-center">
      {/* Score Display */}
      <div className="text-center mb-8">
        <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl">
          {getEmoji()}
        </div>
        
        <h1 className="text-3xl text-gray-800 mb-4">{getMessage()}</h1>
        
        <div className="bg-gray-100 rounded-2xl p-6 mb-6">
          <p className="text-2xl text-gray-800 mb-2">
            {score} out of {total} correct!
          </p>
          <p className="text-xl text-gray-600">
            {percentage}%
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full space-y-4">
        <Button 
          onClick={() => onNavigate('quiz')}
          className="w-full h-14 text-lg bg-gray-600 hover:bg-gray-500 text-white rounded-2xl"
        >
          Try Again
        </Button>
        
        <Button 
          onClick={() => onNavigate('studentHome')}
          className="w-full h-14 text-lg bg-gray-800 hover:bg-gray-700 text-white rounded-2xl"
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
}