import { RouterProvider } from 'react-router';
import { ActiveProfileProvider } from './ActiveProfileProvider';
import { createAppRouter } from './router';

const router = createAppRouter();

export default function App() {
  return (
    <ActiveProfileProvider>
      <RouterProvider router={router} />
    </ActiveProfileProvider>
  );
}
