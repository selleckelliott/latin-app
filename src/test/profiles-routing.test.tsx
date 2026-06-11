import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { ACTIVE_PROFILE_STORAGE_KEY } from '../app/active-profile';
import { db } from '../data/db';
import { hashPin } from '../domain/pin';
import type { Profile } from '../domain/types';
import { renderApp, resetAppState } from './helpers';

beforeEach(resetAppState);

function student(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'student-1',
    name: 'Livia',
    role: 'student',
    avatarEmoji: '🦊',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

async function seedParent(pin = '1234'): Promise<Profile> {
  const parent: Profile = {
    id: 'parent-1',
    name: 'Mom',
    role: 'parent',
    avatarEmoji: '🧑‍🏫',
    pinHash: await hashPin(pin),
    createdAt: new Date().toISOString(),
  };
  await db.profiles.add(parent);
  return parent;
}

describe('first-run onboarding', () => {
  it('walks through parent + student setup and lands on the picker', async () => {
    const user = userEvent.setup();
    renderApp('/');

    // Step 1: parent profile
    expect(await screen.findByText("Let's set up your family's Latin app")).toBeInTheDocument();
    await user.type(screen.getByLabelText('Your name'), 'Mom');
    await user.type(screen.getByLabelText('Parent PIN (4 digits)'), '1234');
    await user.type(screen.getByLabelText('Confirm PIN'), '1234');
    await user.click(screen.getByRole('button', { name: 'Next: add students' }));

    // Step 2: students
    expect(await screen.findByText('Add your students')).toBeInTheDocument();
    await user.type(screen.getByLabelText('Student name'), 'Livia');
    await user.click(screen.getByRole('radio', { name: 'Avatar 🦊' }));
    await user.click(screen.getByRole('button', { name: 'Add student' }));
    await user.click(screen.getByRole('button', { name: 'Finish setup' }));

    // Profiles persisted; picker appears reactively
    expect(await screen.findByText("Who's learning today?")).toBeInTheDocument();
    expect(screen.getByText('Livia')).toBeInTheDocument();
    expect(await db.profiles.count()).toBe(2);
  });

  it('validates the PIN before continuing', async () => {
    const user = userEvent.setup();
    renderApp('/');

    await screen.findByText("Let's set up your family's Latin app");
    await user.type(screen.getByLabelText('Your name'), 'Mom');
    await user.type(screen.getByLabelText('Parent PIN (4 digits)'), '12');
    await user.click(screen.getByRole('button', { name: 'Next: add students' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('PIN must be exactly 4 digits');

    await user.type(screen.getByLabelText('Parent PIN (4 digits)'), '34');
    await user.type(screen.getByLabelText('Confirm PIN'), '9999');
    await user.click(screen.getByRole('button', { name: 'Next: add students' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('PINs do not match');
  });
});

describe('profile picker', () => {
  it('selects a student, stores the active profile, and shows their home', async () => {
    const user = userEvent.setup();
    await seedParent();
    await db.profiles.add(student());

    renderApp('/');
    await user.click(await screen.findByRole('button', { name: /Livia/ }));

    expect(await screen.findByText(/Salve, Livia!/)).toBeInTheDocument();
    expect(sessionStorage.getItem(ACTIVE_PROFILE_STORAGE_KEY)).toBe('student-1');
  });
});

describe('route guards', () => {
  it('redirects student routes to the picker without a matching active profile', async () => {
    await seedParent();
    await db.profiles.add(student());

    renderApp('/student/student-1'); // no active profile selected
    expect(await screen.findByText("Who's learning today?")).toBeInTheDocument();
  });

  it("redirects when the active profile is a different student's id", async () => {
    await seedParent();
    await db.profiles.add(student());
    await db.profiles.add(student({ id: 'student-2', name: 'Felix', avatarEmoji: '🐸' }));
    sessionStorage.setItem(ACTIVE_PROFILE_STORAGE_KEY, 'student-2');

    renderApp('/student/student-1');
    expect(await screen.findByText("Who's learning today?")).toBeInTheDocument();
  });

  it('redirects unknown routes to the picker', async () => {
    await seedParent();
    await db.profiles.add(student());

    renderApp('/nope/nothing');
    expect(await screen.findByText("Who's learning today?")).toBeInTheDocument();
  });
});

describe('parent gate', () => {
  it('blocks the dashboard until the correct PIN is entered', async () => {
    const user = userEvent.setup();
    await seedParent('4321');

    renderApp('/parent');
    expect(await screen.findByText('Parents only')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Parent PIN'), '0000');
    await user.click(screen.getByRole('button', { name: 'Unlock' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Wrong PIN, try again');

    await user.type(screen.getByLabelText('Parent PIN'), '4321');
    await user.click(screen.getByRole('button', { name: 'Unlock' }));
    expect(await screen.findByText('Parent Dashboard')).toBeInTheDocument();
  });

  it('keeps the parent area unlocked for the rest of the browser session', async () => {
    const user = userEvent.setup();
    await seedParent('4321');

    renderApp('/parent');
    await user.type(await screen.findByLabelText('Parent PIN'), '4321');
    await user.click(screen.getByRole('button', { name: 'Unlock' }));
    await screen.findByText('Parent Dashboard');

    // A fresh mount (same sessionStorage) goes straight to the dashboard.
    renderApp('/parent');
    expect((await screen.findAllByText('Parent Dashboard')).length).toBeGreaterThan(0);
  });
});
