import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button } from '../../components/ui/button';

export function QuizScreen() {
  const { sid, uid } = useParams<{ sid: string; uid: string }>();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');

  const questions = [
    {
      question: "What does 'aqua' mean?",
      options: ['fire', 'water', 'earth', 'air'],
      correct: 'water',
      image: '💧',
    },
    {
      question: "What does 'canis' mean?",
      options: ['cat', 'bird', 'dog', 'fish'],
      correct: 'dog',
      image: '🐕',
    },
    {
      question: "What does 'sol' mean?",
      options: ['moon', 'star', 'sun', 'cloud'],
      correct: 'sun',
      image: '☀️',
    },
  ];

  const handleNext = () => {
    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer('');
    } else {
      let correctCount = 0;
      questions.forEach((q, index) => {
        if (newAnswers[index] === q.correct) {
          correctCount++;
        }
      });
      navigate(`/student/${sid}/unit/${uid}/results`, {
        state: { score: correctCount, total: questions.length },
      });
    }
  };

  const currentQ = questions[currentQuestion];

  return (
    <div className="p-6 flex-1 flex flex-col">
      {/* Progress */}
      <div className="text-center mb-6">
        <p className="text-lg text-gray-600">
          Question {currentQuestion + 1} of {questions.length}
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div
            className="bg-gray-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">
            {currentQ.image}
          </div>
          <h2 className="text-2xl text-gray-800 mb-6">{currentQ.question}</h2>
        </div>

        {/* Answer Options */}
        <div className="space-y-4 mb-8">
          {currentQ.options.map((option, index) => (
            <Button
              key={index}
              onClick={() => setSelectedAnswer(option)}
              className={`w-full h-14 text-lg rounded-2xl border-2 transition-all ${
                selectedAnswer === option
                  ? 'bg-gray-600 text-white border-gray-600'
                  : 'bg-white text-gray-800 border-gray-300 hover:border-gray-400'
              }`}
            >
              {option}
            </Button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex space-x-4">
        <Button
          onClick={() => navigate(`/student/${sid}`)}
          className="flex-1 h-12 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-xl"
        >
          Back
        </Button>

        <Button
          onClick={handleNext}
          disabled={!selectedAnswer}
          className="flex-1 h-12 bg-gray-800 hover:bg-gray-700 text-white rounded-xl disabled:bg-gray-400"
        >
          {currentQuestion < questions.length - 1 ? 'Next' : 'Finish'}
        </Button>
      </div>
    </div>
  );
}
