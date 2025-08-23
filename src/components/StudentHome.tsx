import { Button } from './ui/button';
import { Screen } from '../App';

interface StudentHomeProps {
  studentName: string;
  onNavigate: (screen: Screen) => void;
}

export function StudentHome({ studentName, onNavigate }: StudentHomeProps) {
  return (
    <div className="p-6 min-h-[600px] flex flex-col">
      {/* Greeting */}
      <div className="text-center mb-8 mt-4">
        <h1 className="text-3xl text-gray-800 mb-2">Salve, {studentName}!</h1>
        <p className="text-lg text-gray-600">Ready to learn Latin today?</p>
      </div>

      {/* Start Today's Lesson Button */}
      <Button 
        onClick={() => onNavigate('vocabularyLesson')}
        className="w-full h-16 text-xl bg-gray-800 hover:bg-gray-700 text-white rounded-2xl mb-8"
      >
        Start Today's Lesson
      </Button>

      {/* Lesson Icons */}
      <div className="space-y-6 flex-1">
        <div 
          onClick={() => onNavigate('vocabularyLesson')}
          className="bg-gray-100 rounded-2xl p-6 cursor-pointer hover:bg-gray-200 transition-colors"
        >
          <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-3 flex items-center justify-center">
            <span className="text-2xl">📚</span>
          </div>
          <h3 className="text-xl text-center text-gray-800">Vocabulary</h3>
          <p className="text-center text-gray-600 mt-1">Learn new words</p>
        </div>

        <div 
          onClick={() => onNavigate('grammarGame')}
          className="bg-gray-100 rounded-2xl p-6 cursor-pointer hover:bg-gray-200 transition-colors"
        >
          <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-3 flex items-center justify-center">
            <span className="text-2xl">🎮</span>
          </div>
          <h3 className="text-xl text-center text-gray-800">Grammar Game</h3>
          <p className="text-center text-gray-600 mt-1">Practice endings</p>
        </div>

        <div 
          onClick={() => onNavigate('quiz')}
          className="bg-gray-100 rounded-2xl p-6 cursor-pointer hover:bg-gray-200 transition-colors"
        >
          <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-3 flex items-center justify-center">
            <span className="text-2xl">✏️</span>
          </div>
          <h3 className="text-xl text-center text-gray-800">Quiz</h3>
          <p className="text-center text-gray-600 mt-1">Test your knowledge</p>
        </div>
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