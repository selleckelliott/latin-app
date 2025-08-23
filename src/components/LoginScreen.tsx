import { Button } from './ui/button';
import { Input } from './ui/input';
import { Screen } from '../App';

interface LoginScreenProps {
  onNavigate: (screen: Screen) => void;
}

export function LoginScreen({ onNavigate }: LoginScreenProps) {
  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[600px] space-y-8">
      {/* Logo Placeholder */}
      <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center mb-4">
        <span className="text-gray-600">LOGO</span>
      </div>

      <h1 className="text-3xl text-center text-gray-800 mb-8">Latin Learning App</h1>

      {/* Login Buttons */}
      <div className="w-full space-y-6">
        <Button 
          onClick={() => onNavigate('studentHome')}
          className="w-full h-16 text-xl bg-gray-800 hover:bg-gray-700 text-white rounded-2xl"
        >
          Student Login
        </Button>

        <Button 
          onClick={() => onNavigate('parentHome')}
          className="w-full h-16 text-xl bg-gray-600 hover:bg-gray-500 text-white rounded-2xl"
        >
          Parent Login
        </Button>
      </div>

      {/* Simple Username Entry */}
      <div className="w-full mt-8">
        <Input 
          placeholder="Enter username"
          className="w-full h-12 text-lg rounded-xl border-2 border-gray-300 text-center"
        />
        <Button className="w-full h-12 mt-4 text-lg bg-gray-400 hover:bg-gray-300 text-gray-800 rounded-xl">
          Go
        </Button>
      </div>
    </div>
  );
}