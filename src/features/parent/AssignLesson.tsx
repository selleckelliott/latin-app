import { useLiveQuery } from 'dexie-react-hooks';
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
import { getUnit, getUnits } from '../../content/loader';
import { repos } from '../../data';
import type { Activity, Assignment } from '../../domain/types';
import { ACTIVITIES } from '../../domain/types';
import { ACTIVITY_META } from '../student/activity-meta';

export function AssignLesson() {
  const navigate = useNavigate();
  const students = useLiveQuery(() => repos.profiles.students(), []);
  const units = getUnits();

  const [studentId, setStudentId] = useState('');
  const [unitId, setUnitId] = useState('');
  const [activity, setActivity] = useState<Activity | ''>('');
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmed, setConfirmed] = useState<Assignment | null>(null);

  const canAssign = studentId !== '' && unitId !== '' && activity !== '' && dueDate !== '';

  const handleAssign = async () => {
    if (!canAssign || saving) return;
    setSaving(true);
    const assignment: Assignment = {
      id: crypto.randomUUID(),
      studentId,
      unitId,
      activity,
      dueDate,
      status: 'assigned',
      assignedAt: new Date().toISOString(),
    };
    await repos.assignments.add(assignment);
    setConfirmed(assignment);
    setSaving(false);
  };

  if (confirmed) {
    const student = students?.find((s) => s.id === confirmed.studentId);
    const unit = getUnit(confirmed.unitId);
    return (
      <div className="p-6 flex-1 flex flex-col items-center justify-center">
        <div className="text-center mb-8 w-full">
          <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center text-3xl">
            ✅
          </div>
          <h1 className="text-2xl text-gray-800 mb-4">Lesson Assigned!</h1>
          <div className="bg-gray-100 rounded-2xl p-4">
            <p className="text-gray-800">
              {ACTIVITY_META[confirmed.activity].title} · {unit?.title ?? confirmed.unitId}
            </p>
            <p className="text-gray-600">assigned to {student?.name ?? confirmed.studentId}</p>
            <p className="text-gray-600">Due: {confirmed.dueDate}</p>
          </div>
        </div>

        <div className="w-full space-y-4">
          <Button
            onClick={() => {
              setConfirmed(null);
              setStudentId('');
              setUnitId('');
              setActivity('');
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
          <label className="block text-lg text-gray-800 mb-3" id="assign-student-label">
            Select Student
          </label>
          <Select value={studentId} onValueChange={setStudentId}>
            <SelectTrigger
              aria-labelledby="assign-student-label"
              className="w-full h-12 text-lg rounded-xl border-2 border-gray-300"
            >
              <SelectValue placeholder="Choose a student" />
            </SelectTrigger>
            <SelectContent>
              {students?.map((student) => (
                <SelectItem key={student.id} value={student.id} className="text-lg">
                  {student.avatarEmoji} {student.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Unit Selection */}
        <div>
          <label className="block text-lg text-gray-800 mb-3" id="assign-unit-label">
            Select Unit
          </label>
          <Select value={unitId} onValueChange={setUnitId}>
            <SelectTrigger
              aria-labelledby="assign-unit-label"
              className="w-full h-12 text-lg rounded-xl border-2 border-gray-300"
            >
              <SelectValue placeholder="Choose a unit" />
            </SelectTrigger>
            <SelectContent>
              {units.map((unit) => (
                <SelectItem key={unit.id} value={unit.id} className="text-lg">
                  {unit.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Activity Selection */}
        <div>
          <label className="block text-lg text-gray-800 mb-3" id="assign-activity-label">
            Select Activity
          </label>
          <Select value={activity} onValueChange={(value) => setActivity(value as Activity)}>
            <SelectTrigger
              aria-labelledby="assign-activity-label"
              className="w-full h-12 text-lg rounded-xl border-2 border-gray-300"
            >
              <SelectValue placeholder="Choose an activity" />
            </SelectTrigger>
            <SelectContent>
              {ACTIVITIES.map((value) => (
                <SelectItem key={value} value={value} className="text-lg">
                  {ACTIVITY_META[value].emoji} {ACTIVITY_META[value].title}
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
            className="w-full h-12 text-lg rounded-xl border-2 border-gray-300 px-4 bg-white"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4 mt-8">
        <Button
          onClick={() => void handleAssign()}
          disabled={!canAssign || saving}
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
