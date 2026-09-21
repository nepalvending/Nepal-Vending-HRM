import React, { useState } from 'react';
import { EmployeeTask, Employee } from '../types';
import {
  CheckSquare,
  Square,
  Clock,
  AlertCircle,
  Plus,
  CheckCircle2,
  Calendar,
  Tag,
  ListTodo,
} from 'lucide-react';

interface EmployeeTasksWidgetProps {
  tasks: EmployeeTask[];
  currentEmployee: Employee;
  onUpdateTaskStatus: (taskId: string, newStatus: 'todo' | 'in_progress' | 'completed') => void;
  onAddTask: (newTask: Omit<EmployeeTask, 'id' | 'assignedAt'>) => void;
}

export const EmployeeTasksWidget: React.FC<EmployeeTasksWidgetProps> = ({
  tasks,
  currentEmployee,
  onUpdateTaskStatus,
  onAddTask,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [newDueDate, setNewDueDate] = useState('2026-09-20');
  const [newTag, setNewTag] = useState('');

  // Filter tasks belonging to current employee
  const myTasks = tasks.filter((t) => t.employeeId === currentEmployee.id);
  const completedCount = myTasks.filter((t) => t.status === 'completed').length;
  const progressPercent = myTasks.length > 0 ? Math.round((completedCount / myTasks.length) * 100) : 0;

  const filteredTasks = myTasks.filter((t) => {
    if (filter === 'completed') return t.status === 'completed';
    if (filter === 'pending') return t.status !== 'completed';
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddTask({
      employeeId: currentEmployee.id,
      title: newTitle.trim(),
      description: newDesc.trim(),
      priority: newPriority,
      status: 'todo',
      assignedBy: 'Self / Field Operations',
      dueDate: newDueDate,
      tags: newTag.trim() ? newTag.split(',').map((s) => s.trim()) : ['Field Task'],
    });
    setNewTitle('');
    setNewDesc('');
    setNewTag('');
    setShowAddModal(false);
  };

  const priorityStyles = {
    urgent: 'bg-rose-100 text-rose-800 border-rose-300',
    high: 'bg-amber-100 text-amber-800 border-amber-300',
    medium: 'bg-blue-100 text-blue-800 border-blue-300',
    low: 'bg-slate-100 text-slate-700 border-slate-300',
  };

  return (
    <div id="employee-tasks-widget" className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-100 text-teal-800">
            <ListTodo className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Assigned Tasks & Action Items
            </h4>
            <p className="text-[11px] text-slate-500">
              Operations, replenishments & scheduled maintenance
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 transition-colors flex items-center gap-1 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Task
        </button>
      </div>

      {/* Progress Bar */}
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700">
            Task Completion: {completedCount} / {myTasks.length} Completed
          </span>
          <span className="font-bold text-emerald-700 font-mono">{progressPercent}%</span>
        </div>
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-600 transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5">
        {(['pending', 'completed', 'all'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
              filter === f
                ? 'bg-slate-900 text-white font-bold shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f === 'pending' ? 'Active / To Do' : f}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {filteredTasks.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
            No tasks found in this view.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isDone = task.status === 'completed';
            return (
              <div
                key={task.id}
                className={`p-3 rounded-xl border transition-all ${
                  isDone
                    ? 'bg-slate-50/70 border-slate-200 opacity-75'
                    : 'bg-white border-slate-200 hover:border-emerald-300 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateTaskStatus(
                          task.id,
                          isDone ? 'todo' : 'completed'
                        )
                      }
                      className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors shrink-0"
                    >
                      {isDone ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-xs font-bold leading-snug ${
                          isDone ? 'line-through text-slate-400' : 'text-slate-900'
                        }`}
                      >
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                            priorityStyles[task.priority]
                          }`}
                        >
                          {task.priority}
                        </span>

                        <span className="text-[10px] text-slate-500 flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          Due: {task.dueDate}
                        </span>

                        {task.tags.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="text-[9px] font-medium text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-1">
                    {!isDone && (
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateTaskStatus(
                            task.id,
                            task.status === 'in_progress' ? 'todo' : 'in_progress'
                          )
                        }
                        className={`text-[10px] font-bold px-2 py-1 rounded-md transition-colors ${
                          task.status === 'in_progress'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {task.status === 'in_progress' ? 'In Progress' : 'Start'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-5 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-600" />
              Add Assigned Task / Action Item
            </h3>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  placeholder="e.g. Inspect note acceptor at TIA Terminal"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description / Instructions
                </label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Details, location or checklist..."
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg text-slate-800 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg text-slate-800 bg-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg text-slate-800 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Airport, Payment, Hardware"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
