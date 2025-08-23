import { useState } from 'react';
import { Button } from './ui/button';
import { Screen } from '../App';

interface VocabularyLessonProps {
  onNavigate: (screen: Screen) => void;
}

export function VocabularyLesson({ onNavigate }: VocabularyLessonProps) {
  const [currentCard, setCurrentCard] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);
  
  const words = [
    { latin: 'aqua', meaning: 'water', image: '💧' },
    { latin: 'casa', meaning: 'house', image: '🏠' },
    { latin: 'canis', meaning: 'dog', image: '🐕' },
    { latin: 'sol', meaning: 'sun', image: '☀️' },
    { latin: 'luna', meaning: 'moon', image: '🌙' },
  ];

  const currentWord = words[currentCard];

  const nextCard = () => {
    if (currentCard < words.length - 1) {
      setCurrentCard(currentCard + 1);
      setShowMeaning(false);
    }
  };

  const repeatCard = () => {
    setShowMeaning(false);
  };

  return (
    <div className="p-6 min-h-[600px] flex flex-col">
      {/* Progress */}
      <div className="text-center mb-6">
        <p className="text-lg text-gray-600">{currentCard + 1} of {words.length} words</p>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div 
            className="bg-gray-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentCard + 1) / words.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Flashcard */}
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-gray-100 rounded-3xl p-8 w-full max-w-xs text-center shadow-lg">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">
              {currentWord.image}
            </div>
            <h2 className="text-4xl text-gray-800 mb-4">
              {showMeaning ? currentWord.meaning : currentWord.latin}
            </h2>
          </div>

          <Button 
            onClick={() => setShowMeaning(!showMeaning)}
            className="w-full h-12 bg-gray-600 hover:bg-gray-500 text-white rounded-xl mb-4"
          >
            {showMeaning ? 'Show Latin' : 'Flip Card'}
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      {showMeaning && (
        <div className="space-y-4">
          <Button 
            onClick={nextCard}
            disabled={currentCard >= words.length - 1}
            className="w-full h-14 text-lg bg-gray-800 hover:bg-gray-700 text-white rounded-2xl disabled:bg-gray-400"
          >
            I Know It
          </Button>
          
          <Button 
            onClick={repeatCard}
            className="w-full h-14 text-lg bg-gray-500 hover:bg-gray-400 text-white rounded-2xl"
          >
            Practice Again
          </Button>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-6 flex space-x-4">
        <Button 
          onClick={() => onNavigate('studentHome')}
          className="flex-1 h-12 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-xl"
        >
          Back
        </Button>
        
        {currentCard >= words.length - 1 && (
          <Button 
            onClick={() => onNavigate('grammarGame')}
            className="flex-1 h-12 bg-gray-600 hover:bg-gray-500 text-white rounded-xl"
          >
            Next Lesson
          </Button>
        )}
      </div>
    </div>
  );
}