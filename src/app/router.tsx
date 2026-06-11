import { createBrowserRouter, Navigate, type RouteObject } from 'react-router';
import { AssignLesson } from '../features/parent/AssignLesson';
import { ParentHome } from '../features/parent/ParentHome';
import { ProgressView } from '../features/parent/ProgressView';
import { GrammarGame } from '../features/student/GrammarGame';
import { QuizScreen } from '../features/student/QuizScreen';
import { ResultsScreen } from '../features/student/ResultsScreen';
import { StudentHome } from '../features/student/StudentHome';
import { VocabularyLesson } from '../features/student/VocabularyLesson';
import { ParentGuard, StudentGuard } from './guards';
import { Home } from './Home';
import { Layout } from './Layout';

export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      {
        path: '/student/:sid',
        element: <StudentGuard />,
        children: [
          { index: true, element: <StudentHome /> },
          { path: 'unit/:uid/vocab', element: <VocabularyLesson /> },
          { path: 'unit/:uid/grammar', element: <GrammarGame /> },
          { path: 'unit/:uid/quiz', element: <QuizScreen /> },
          { path: 'unit/:uid/results', element: <ResultsScreen /> },
        ],
      },
      {
        path: '/parent',
        element: <ParentGuard />,
        children: [
          { index: true, element: <ParentHome /> },
          { path: 'student/:sid', element: <ProgressView /> },
          { path: 'assign', element: <AssignLesson /> },
        ],
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
];

export function createAppRouter() {
  return createBrowserRouter(routes, {
    basename: import.meta.env.BASE_URL,
  });
}
