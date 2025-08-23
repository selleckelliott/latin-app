import { useState } from 'react';
import { Button } from './ui/button';
import { Screen } from '../App';

interface GrammarGameProps {
  onNavigate: (screen: Screen) => void;
}

export function GrammarGame({ onNavigate }: GrammarGameProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: string]: string}>({});
  const [showResults, setShowResults] = useState(false);

  const questions = [
    { word: 'puella', correct: '-a', options: ['-a', '-us', '-um'] },
    { word: 'puer', correct: '-us', options: ['-a', '-us', '-um'] },
    { word: 'templum', correct: '-um', options: ['-a', '-us', '-um'] },
  ];

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const checkAnswers = () => {
    setShowResults(true);
  };

  const getScore = () => {
    let correct = 0;
    questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correct) {
        correct++;
      }
    });
    return correct;
  };

  return (
    <div className="p-6 min-h-[600px] flex flex-col">
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-2xl text-gray-800 mb-2">Grammar Game</h1>
        <p className="text-lg text-gray-600">Match the endings!</p>
      </div>

      {/* Questions */}
      <div className="flex-1 space-y-6">
        {questions.map((question, qIndex) => (
          <div key={qIndex} className="bg-gray-100 rounded-2xl p-6">
            <h3 className="text-xl text-center text-gray-800 mb-4">{question.word}</h3>
            
            <div className="grid grid-cols-3 gap-3">
              {question.options.map((option, oIndex) => (
                <Button
                  key={oIndex}
                  onClick={() => handleAnswerSelect(qIndex, option)}
                  className={`h-12 rounded-xl border-2 transition-all ${
                    selectedAnswers[qIndex] === option
                      ? 'bg-gray-600 text-white border-gray-600'
                      : 'bg-white text-gray-800 border-gray-300 hover:border-gray-400'
                  } ${
                    showResults && option === question.correct
                      ? 'bg-green-600 border-green-600 text-white'
                      : showResults && selectedAnswers[qIndex] === option && option !== question.correct
                      ? 'bg-red-500 border-red-500 text-white'
                      : ''
                  }`}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Results */}
      {showResults && (
        <div className="bg-gray-200 rounded-2xl p-4 mb-4 text-center">
          <p className="text-lg text-gray-800">
            Score: {getScore()} out of {questions.length}
          </p>
        </div>
      )}

      {/* Action Button */}
      {!showResults ? (
        <Button 
          onClick={checkAnswers}
          disabled={Object.keys(selectedAnswers).length < questions.length}
          className="w-full h-14 text-lg bg-gray-800 hover:bg-gray-700 text-white rounded-2xl disabled:bg-gray-400 mb-4"
        >
          Check Answers
        </Button>
      ) : (
        <Button 
          onClick={() => onNavigate('quiz')}
          className="w-full h-14 text-lg bg-gray-800 hover:bg-gray-700 text-white rounded-2xl mb-4"
        >
          Continue to Quiz
        </Button>
      )}

      {/* Back Button */}
      <Button 
        onClick={() => onNavigate('studentHome')}
        className="w-full h-12 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-xl"
      >
        Back to Home
      </Button>
    </div>
  );
}