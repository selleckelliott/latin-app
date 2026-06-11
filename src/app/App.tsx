import { useState } from 'react';
import { LoginScreen } from '../features/profiles/LoginScreen';
import { StudentHome } from '../features/student/StudentHome';
import { VocabularyLesson } from '../features/student/VocabularyLesson';
import { GrammarGame } from '../features/student/GrammarGame';
import { QuizScreen } from '../features/student/QuizScreen';
import { ResultsScreen } from '../features/student/ResultsScreen';
import { ParentHome } from '../features/parent/ParentHome';
import { ProgressView } from '../features/parent/ProgressView';
import { AssignLesson } from '../features/parent/AssignLesson';

export type Screen =
  | 'login'
  | 'studentHome'
  | 'vocabularyLesson'
  | 'grammarGame'
  | 'quiz'
  | 'results'
  | 'parentHome'
  | 'progressView'
  | 'assignLesson';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [quizScore, setQuizScore] = useState(0);
  const [totalQuizQuestions, setTotalQuizQuestions] = useState(10);
  const currentStudent = 'Marcus';

  const navigateToScreen = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'login':
        return <LoginScreen onNavigate={navigateToScreen} />;
      case 'studentHome':
        return <StudentHome studentName={currentStudent} onNavigate={navigateToScreen} />;
      case 'vocabularyLesson':
        return <VocabularyLesson onNavigate={navigateToScreen} />;
      case 'grammarGame':
        return <GrammarGame onNavigate={navigateToScreen} />;
      case 'quiz':
        return (
          <QuizScreen
            onNavigate={navigateToScreen}
            setScore={setQuizScore}
            setTotal={setTotalQuizQuestions}
          />
        );
      case 'results':
        return (
          <ResultsScreen
            score={quizScore}
            total={totalQuizQuestions}
            onNavigate={navigateToScreen}
          />
        );
      case 'parentHome':
        return <ParentHome onNavigate={navigateToScreen} />;
      case 'progressView':
        return <ProgressView studentName={currentStudent} onNavigate={navigateToScreen} />;
      case 'assignLesson':
        return <AssignLesson onNavigate={navigateToScreen} />;
      default:
        return <LoginScreen onNavigate={navigateToScreen} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-lg overflow-hidden min-h-[600px]">
        {renderScreen()}
      </div>
    </div>
  );
}
