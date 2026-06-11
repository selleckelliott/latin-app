import { useNavigate, useParams } from 'react-router';
import { useActiveProfile } from '../../app/active-profile';
import { Button } from '../../components/ui/button';
import { getUnits } from '../../content/loader';

export function StudentHome() {
  const { sid } = useParams<{ sid: string }>();
  const navigate = useNavigate();
  const { activeProfile, setActiveProfileId } = useActiveProfile();
  const unit = getUnits()[0];

  const activities = [
    { key: 'vocab', emoji: '📚', title: 'Vocabulary', subtitle: 'Learn new words' },
    { key: 'grammar', emoji: '🎮', title: 'Grammar Game', subtitle: 'Practice endings' },
    { key: 'quiz', emoji: '✏️', title: 'Quiz', subtitle: 'Test your knowledge' },
  ] as const;

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

      <div className="space-y-6 flex-1">
        {activities.map((activity) => (
          <button
            key={activity.key}
            type="button"
            onClick={() => navigate(`/student/${sid}/unit/${unit.id}/${activity.key}`)}
            className="w-full bg-gray-100 rounded-2xl p-6 hover:bg-gray-200 transition-colors text-center"
          >
            <span className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl">
              {activity.emoji}
            </span>
            <span className="block text-xl text-gray-800">{activity.title}</span>
            <span className="block text-lg text-gray-600 mt-1">{activity.subtitle}</span>
          </button>
        ))}
      </div>

      <Button
        onClick={switchProfile}
        className="w-full h-12 mt-4 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-xl"
      >
        Switch profile
      </Button>
    </div>
  );
}
