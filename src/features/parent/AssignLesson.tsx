import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

export function AssignLesson() {
  const navigate = useNavigate();
  const [selectedLesson, setSelectedLesson] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Placeholder options until phase 7 wires real profiles + content.
  const lessons = ['Vocabulary: Starter Pack', 'Grammar: Starter Pack', 'Quiz: Starter Pack'];
  const students = ['Marcus', 'Julia'];

  const handleAssign = () => {
    if (selectedLesson && selectedStudent && dueDate) {
      setShowConfirmation(true);
    }
  };

  if (showConfirmation) {
    return (
      <div className="p-6 flex-1 flex flex-col items-center justify-center">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center text-3xl">
            ✅
          </div>
          <h1 className="text-2xl text-gray-800 mb-4">Lesson Assigned!</h1>
          <div className="bg-gray-100 rounded-2xl p-4">
            <p className="text-gray-800">{selectedLesson}</p>
            <p className="text-gray-600">assigned to {selectedStudent}</p>
            <p className="text-gray-600">Due: {dueDate}</p>
          </div>
        </div>

        <div className="w-full space-y-4">
          <Button
            onClick={() => {
              setShowConfirmation(false);
              setSelectedLesson('');
              setSelectedStudent('');
              setDueDate('');
            }}
            className="w-full h-12 bg-gray-600 hover:bg-gray-500 text-white rounded-xl"
          >
            Assign Another
          </Button>

          <Button
            onClick={() => navigate('/parent')}
            className="w-full h-12 bg-gray-800 hover:bg-gray-700 text-white rounded-xl"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 flex-1 flex flex-col">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl text-gray-800 mb-2">Assign Lesson</h1>
        <p className="text-lg text-gray-600">Set up a new lesson for your student</p>
      </div>

      {/* Form */}
      <div className="flex-1 space-y-6">
        {/* Student Selection */}
        <div>
          <label className="block text-lg text-gray-800 mb-3">Select Student</label>
          <Select value={selectedStudent} onValueChange={setSelectedStudent}>
            <SelectTrigger className="w-full h-12 text-lg rounded-xl border-2 border-gray-300">
              <SelectValue placeholder="Choose a student" />
            </SelectTrigger>
            <SelectContent>
              {students.map((student) => (
                <SelectItem key={student} value={student} className="text-lg">
                  {student}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Lesson Selection */}
        <div>
          <label className="block text-lg text-gray-800 mb-3">Select Lesson</label>
          <Select value={selectedLesson} onValueChange={setSelectedLesson}>
            <SelectTrigger className="w-full h-12 text-lg rounded-xl border-2 border-gray-300">
              <SelectValue placeholder="Choose a lesson" />
            </SelectTrigger>
            <SelectContent>
              {lessons.map((lesson) => (
                <SelectItem key={lesson} value={lesson} className="text-lg">
                  {lesson}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Due Date */}
        <div>
          <label htmlFor="due-date" className="block text-lg text-gray-800 mb-3">
            Due Date
          </label>
          <input
            id="due-date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full h-12 text-lg rounded-xl border-2 border-gray-300 px-4"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4 mt-8">
        <Button
          onClick={handleAssign}
          disabled={!selectedLesson || !selectedStudent || !dueDate}
          className="w-full h-14 text-lg bg-gray-800 hover:bg-gray-700 text-white rounded-2xl disabled:bg-gray-400"
        >
          Assign Lesson
        </Button>

        <Button
          onClick={() => navigate('/parent')}
          className="w-full h-12 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-xl"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
