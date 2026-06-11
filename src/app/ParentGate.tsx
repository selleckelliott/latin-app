import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { db } from '../data/db';
import { verifyPin } from '../domain/pin';
import { useActiveProfile } from './active-profile';

/**
 * PIN gate in front of the parent area. A child gate, not a security
 * boundary — it only keeps the student out of the dashboard.
 */
export function ParentGate() {
  const navigate = useNavigate();
  const { setParentVerified } = useActiveProfile();
  const parent = useLiveQuery(() => db.profiles.where('role').equals('parent').first(), []);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (parent === undefined) {
    return null; // loading
  }

  if (!parent?.pinHash) {
    return (
      <div className="p-8 flex-1 flex flex-col items-center justify-center text-center space-y-6">
        <p className="text-lg text-gray-600">No parent profile found. Set one up first.</p>
        <Button
          onClick={() => navigate('/')}
          className="h-12 px-8 bg-gray-800 hover:bg-gray-700 text-white rounded-xl"
        >
          Back to profiles
        </Button>
      </div>
    );
  }

  const submit = async () => {
    if (await verifyPin(pin, parent.pinHash!)) {
      setParentVerified(true);
    } else {
      setPin('');
      setError(true);
    }
  };

  return (
    <div className="p-8 flex-1 flex flex-col items-center justify-center space-y-6">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-3xl">
        🔒
      </div>
      <div className="text-center">
        <h1 className="text-2xl text-gray-800 mb-2">Parents only</h1>
        <p className="text-lg text-gray-600">Enter your 4-digit PIN</p>
      </div>

      <form
        className="w-full max-w-xs space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <Input
          type="password"
          inputMode="numeric"
          autoComplete="off"
          maxLength={4}
          value={pin}
          onChange={(e) => {
            setPin(e.target.value.replace(/\D/g, ''));
            setError(false);
          }}
          aria-label="Parent PIN"
          className="w-full h-14 text-2xl tracking-[0.5em] text-center rounded-xl border-2 border-gray-300"
        />
        {error && (
          <p role="alert" className="text-center text-red-600">
            Wrong PIN, try again
          </p>
        )}
        <Button
          type="submit"
          disabled={pin.length !== 4}
          className="w-full h-14 text-lg bg-gray-800 hover:bg-gray-700 text-white rounded-2xl disabled:bg-gray-400"
        >
          Unlock
        </Button>
      </form>

      <Button
        onClick={() => navigate('/')}
        className="w-full max-w-xs h-12 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-xl"
      >
        Back
      </Button>
    </div>
  );
}
