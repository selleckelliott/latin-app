import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate, useParams } from 'react-router';
import { useActiveProfile } from '../../app/active-profile';
import { Button } from '../../components/ui/button';
import { getUnit, getUnits } from '../../content/loader';
import { repos } from '../../data';
import { isOverdue, sortDueAssignments } from '../../domain/assignments';
import { ACTIVITIES } from '../../domain/types';
import { ACTIVITY_META } from './activity-meta';

export function StudentHome() {
  const { sid } = useParams<{ sid: string }>();
  const navigate = useNavigate();
  const { activeProfile, setActiveProfileId } = useActiveProfile();
  const defaultUnit = getUnits()[0];

  const openAssignments = useLiveQuery(
    () => (sid ? repos.assignments.openForStudent(sid) : Promise.resolve([])),
    [sid],
  );
  const dueAssignments = sortDueAssignments(openAssignments ?? []);
  const today = new Date().toISOString().slice(0, 10);

  const switchProfile = () => {
    setActiveProfileId(null);
    navigate('/');
  };

  return (
    <div className="p-6 flex-1 flex flex-col">
      <div className="text-center mb-8 mt-4">
        <h1 className="text-3xl text-gray-800 mb-2">
          Salve, {activeProfile?.name}! <span aria-hidden="true">{activeProfile?.avatarEmoji}</span>
        </h1>
        <p className="text-lg text-gray-600">Ready to learn Latin today?</p>
      </div>

      <div className="flex-1 space-y-8">
        {dueAssignments.length > 0 && (
          <section>
            <h2 className="text-xl text-gray-800 mb-3">
              <span aria-hidden="true">⭐</span> Your assignments
            </h2>
            <div className="space-y-4">
              {dueAssignments.map((assignment) => {
                const meta = ACTIVITY_META[assignment.activity];
                const unit = getUnit(assignment.unitId);
                const overdue = isOverdue(assignment, today);
                return (
                  <button
                    key={assignment.id}
                    type="button"
                    onClick={() =>
                      navigate(`/student/${sid}/unit/${assignment.unitId}/${assignment.activity}`)
                    }
                    className="w-full bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 hover:bg-amber-100 transition-colors text-left flex items-center gap-4"
                  >
                    <span className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-2xl shrink-0">
                      {meta.emoji}
                    </span>
                    <span className="flex-1">
                      <span className="block text-xl text-gray-800">{meta.title}</span>
                      <span className="block text-lg text-gray-600">
                        {unit?.title ?? assignment.unitId}
                      </span>
                    </span>
                    <span
                      className={`text-base px-3 py-1 rounded-full ${
                        overdue ? 'bg-red-100 text-red-700' : 'bg-white text-gray-600'
                      }`}
                    >
                      {overdue ? 'Overdue!' : `Due ${assignment.dueDate}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-xl text-gray-800 mb-3">
            <span aria-hidden="true">🎯</span> Free practice
          </h2>
          <div className="space-y-4">
            {ACTIVITIES.map((activity) => {
              const meta = ACTIVITY_META[activity];
              return (
                <button
                  key={activity}
                  type="button"
                  onClick={() => navigate(`/student/${sid}/unit/${defaultUnit.id}/${activity}`)}
                  className="w-full bg-gray-100 rounded-2xl p-6 hover:bg-gray-200 transition-colors text-center"
                >
                  <span className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl">
                    {meta.emoji}
                  </span>
                  <span className="block text-xl text-gray-800">{meta.title}</span>
                  <span className="block text-lg text-gray-600 mt-1">{meta.subtitle}</span>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      <Button
        onClick={switchProfile}
        className="w-full h-12 mt-6 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-xl"
      >
        Switch profile
      </Button>
    </div>
  );
}
