import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { repos } from '../../data';
import { hashPin, isValidPin } from '../../domain/pin';
import type { Profile } from '../../domain/types';

const STUDENT_EMOJIS = ['🦁', '🦊', '🐼', '🐸', '🦉', '🦄', '🐳', '🦖'];
const PARENT_EMOJI = '🧑‍🏫';

interface DraftStudent {
  name: string;
  avatarEmoji: string;
}

/** First-run wizard: create the parent (name + PIN) and student profiles. */
export function Onboarding() {
  const [step, setStep] = useState<'parent' | 'students'>('parent');

  const [parentName, setParentName] = useState('');
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [parentError, setParentError] = useState<string | null>(null);

  const [students, setStudents] = useState<DraftStudent[]>([]);
  const [studentName, setStudentName] = useState('');
  const [studentEmoji, setStudentEmoji] = useState(STUDENT_EMOJIS[0]);
  const [saving, setSaving] = useState(false);

  const nextFromParent = () => {
    if (!parentName.trim()) {
      setParentError('Please enter your name');
      return;
    }
    if (!isValidPin(pin)) {
      setParentError('PIN must be exactly 4 digits');
      return;
    }
    if (pin !== pinConfirm) {
      setParentError('PINs do not match');
      return;
    }
    setParentError(null);
    setStep('students');
  };

  const addStudent = () => {
    const name = studentName.trim();
    if (!name) {
      return;
    }
    setStudents((list) => [...list, { name, avatarEmoji: studentEmoji }]);
    setStudentName('');
  };

  const finish = async () => {
    setSaving(true);
    const now = new Date().toISOString();
    const parent: Profile = {
      id: crypto.randomUUID(),
      name: parentName.trim(),
      role: 'parent',
      avatarEmoji: PARENT_EMOJI,
      pinHash: await hashPin(pin),
      createdAt: now,
    };
    await repos.profiles.add(parent);
    for (const draft of students) {
      await repos.profiles.add({
        id: crypto.randomUUID(),
        name: draft.name,
        role: 'student',
        avatarEmoji: draft.avatarEmoji,
        createdAt: now,
      });
    }
    // Home switches to the profile picker reactively once profiles exist.
  };

  if (step === 'parent') {
    return (
      <div className="p-8 flex-1 flex flex-col">
        <div className="text-center mb-8 mt-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">
            🏛️
          </div>
          <h1 className="text-3xl text-gray-800 mb-2">Salve!</h1>
          <p className="text-lg text-gray-600">Let's set up your family's Latin app</p>
        </div>

        <div className="flex-1 space-y-5">
          <div>
            <label htmlFor="parent-name" className="block text-lg text-gray-800 mb-2">
              Your name
            </label>
            <Input
              id="parent-name"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              placeholder="e.g. Mom"
              className="w-full h-12 text-lg rounded-xl border-2 border-gray-300"
            />
          </div>

          <div>
            <label htmlFor="parent-pin" className="block text-lg text-gray-800 mb-2">
              Parent PIN (4 digits)
            </label>
            <Input
              id="parent-pin"
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              className="w-full h-12 text-lg tracking-[0.5em] text-center rounded-xl border-2 border-gray-300"
            />
          </div>

          <div>
            <label htmlFor="parent-pin-confirm" className="block text-lg text-gray-800 mb-2">
              Confirm PIN
            </label>
            <Input
              id="parent-pin-confirm"
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pinConfirm}
              onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, ''))}
              className="w-full h-12 text-lg tracking-[0.5em] text-center rounded-xl border-2 border-gray-300"
            />
          </div>

          {parentError && (
            <p role="alert" className="text-red-600">
              {parentError}
            </p>
          )}
        </div>

        <Button
          onClick={nextFromParent}
          className="w-full h-14 text-lg bg-gray-800 hover:bg-gray-700 text-white rounded-2xl mt-6"
        >
          Next: add students
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8 flex-1 flex flex-col">
      <div className="text-center mb-6 mt-2">
        <h1 className="text-2xl text-gray-800 mb-2">Add your students</h1>
        <p className="text-lg text-gray-600">Pick a name and an animal friend</p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="student-name" className="block text-lg text-gray-800 mb-2">
            Student name
          </label>
          <Input
            id="student-name"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="e.g. Livia"
            className="w-full h-12 text-lg rounded-xl border-2 border-gray-300"
          />
        </div>

        <div role="radiogroup" aria-label="Avatar" className="grid grid-cols-4 gap-3">
          {STUDENT_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              role="radio"
              aria-checked={studentEmoji === emoji}
              aria-label={`Avatar ${emoji}`}
              onClick={() => setStudentEmoji(emoji)}
              className={`h-14 text-3xl rounded-xl border-2 transition-colors ${
                studentEmoji === emoji
                  ? 'border-gray-800 bg-gray-100'
                  : 'border-gray-200 bg-white hover:border-gray-400'
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>

        <Button
          onClick={addStudent}
          disabled={!studentName.trim()}
          className="w-full h-12 text-lg bg-gray-600 hover:bg-gray-500 text-white rounded-xl disabled:bg-gray-400"
        >
          Add student
        </Button>
      </div>

      <div className="flex-1 mt-6 space-y-3">
        {students.map((student, index) => (
          <div
            key={`${student.name}-${index}`}
            className="bg-gray-100 rounded-2xl px-4 py-3 flex items-center justify-between"
          >
            <span className="text-xl text-gray-800">
              <span className="mr-3">{student.avatarEmoji}</span>
              {student.name}
            </span>
            <Button
              onClick={() => setStudents((list) => list.filter((_, i) => i !== index))}
              aria-label={`Remove ${student.name}`}
              className="h-10 px-4 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-xl"
            >
              Remove
            </Button>
          </div>
        ))}
        {students.length === 0 && (
          <p className="text-center text-gray-500 mt-6">No students added yet</p>
        )}
      </div>

      <Button
        onClick={() => void finish()}
        disabled={students.length === 0 || saving}
        className="w-full h-14 text-lg bg-gray-800 hover:bg-gray-700 text-white rounded-2xl mt-6 disabled:bg-gray-400"
      >
        {saving ? 'Setting up…' : 'Finish setup'}
      </Button>
    </div>
  );
}
