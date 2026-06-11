import { useNavigate } from 'react-router';
import { useActiveProfile } from '../../app/active-profile';
import type { Profile } from '../../domain/types';

/** Netflix-style picker shown on every launch (replaces the fake login). */
export function ProfilePicker({ profiles }: { profiles: Profile[] }) {
  const navigate = useNavigate();
  const { setActiveProfileId, setParentVerified } = useActiveProfile();
  const students = profiles.filter((p) => p.role === 'student');

  const pickStudent = (student: Profile) => {
    setActiveProfileId(student.id);
    navigate(`/student/${student.id}`);
  };

  const pickParent = () => {
    // Re-require the PIN whenever someone enters via the picker.
    setParentVerified(false);
    navigate('/parent');
  };

  return (
    <div className="p-8 flex-1 flex flex-col">
      <div className="text-center mb-8 mt-4">
        <h1 className="text-3xl text-gray-800 mb-2">Salve!</h1>
        <p className="text-lg text-gray-600">Who's learning today?</p>
      </div>

      <div className="flex-1">
        <div className="grid grid-cols-2 gap-4">
          {students.map((student) => (
            <button
              key={student.id}
              type="button"
              onClick={() => pickStudent(student)}
              className="bg-gray-100 rounded-2xl p-6 hover:bg-gray-200 transition-colors flex flex-col items-center"
            >
              <span className="text-5xl mb-3" aria-hidden="true">
                {student.avatarEmoji}
              </span>
              <span className="text-xl text-gray-800">{student.name}</span>
            </button>
          ))}
        </div>
        {students.length === 0 && (
          <p className="text-center text-gray-500">No student profiles yet</p>
        )}
      </div>

      <button
        type="button"
        onClick={pickParent}
        className="mt-6 h-14 w-full bg-gray-200 hover:bg-gray-300 transition-colors rounded-2xl text-lg text-gray-700 flex items-center justify-center gap-2"
      >
        <span aria-hidden="true">🔒</span>
        Parent dashboard
      </button>
    </div>
  );
}
