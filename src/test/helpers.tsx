import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { ActiveProfileProvider } from '../app/ActiveProfileProvider';
import { routes } from '../app/router';
import { db } from '../data/db';

/** Mounts the real app routes at `path` with a memory router. */
export function renderApp(path = '/') {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  return {
    router,
    ...render(
      <ActiveProfileProvider>
        <RouterProvider router={router} />
      </ActiveProfileProvider>,
    ),
  };
}

/** Wipes persisted state so each test starts from a fresh install. */
export async function resetAppState() {
  await Promise.all([db.profiles.clear(), db.attempts.clear(), db.assignments.clear()]);
  sessionStorage.clear();
}

export { screen };
