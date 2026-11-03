import React, { useState, useEffect } from 'react';
import {
  fetchTaskLists,
  fetchTasks,
  createGoogleTask,
  updateGoogleTaskStatus,
  deleteGoogleTask,
  GoogleTaskItem,
  GoogleTaskList,
} from '../services/googleTasks';
import { ConfirmationModal } from './ConfirmationModal';
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  RefreshCw,
  Calendar,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface ExecutiveTasksProps {
  accessToken: string | null;
  onAuthenticate: () => void;
  onLogInteraction: (summary: string, actionType: string, details: any) => void;
}

export const ExecutiveTasks: React.FC<ExecutiveTasksProps> = ({
  accessToken,
  onAuthenticate,
  onLogInteraction,
}) => {
  const [taskLists, setTaskLists] = useState<GoogleTaskList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>('@default');
  const [tasks, setTasks] = useState<GoogleTaskItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskNotes, setNewTaskNotes] = useState('');
  const [newTaskDue, setNewTaskDue] = useState('');

  // Confirmation state for deleting or mutating tasks
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: 'delete' | 'complete';
    task: GoogleTaskItem;
  } | null>(null);

  const loadTasks = async () => {
    if (!accessToken) return;
    setIsLoading(true);
    setError(null);
    try {
      const lists = await fetchTaskLists(accessToken);
      setTaskLists(lists);
      const activeList = selectedListId || (lists[0]?.id ?? '@default');
      const items = await fetchTasks(accessToken, activeList);
      setTasks(items);
    } catch (err: any) {
      console.error('Error loading Google Tasks:', err);
      setError(err?.message || 'Failed to sync with Google Tasks');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      loadTasks();
    }
  }, [accessToken, selectedListId]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !newTaskTitle.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const created = await createGoogleTask(accessToken, selectedListId, {
        title: newTaskTitle.trim(),
        notes: newTaskNotes.trim() || undefined,
        due: newTaskDue ? new Date(newTaskDue).toISOString() : undefined,
      });

      setTasks((prev) => [created, ...prev]);
      setNewTaskTitle('');
      setNewTaskNotes('');
      setNewTaskDue('');

      onLogInteraction(
        `Created Google Task: ${created.title}`,
        'task_action',
        { taskId: created.id, title: created.title, listId: selectedListId }
      );
    } catch (err: any) {
      setError(err?.message || 'Failed to create task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleComplete = async (task: GoogleTaskItem) => {
    if (!accessToken) return;
    const newStatus = task.status === 'completed' ? 'needsAction' : 'completed';

    try {
      const updated = await updateGoogleTaskStatus(
        accessToken,
        selectedListId,
        task.id,
        newStatus
      );
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));

      onLogInteraction(
        `Updated Google Task status: ${task.title} -> ${newStatus}`,
        'task_action',
        { taskId: task.id, status: newStatus }
      );
    } catch (err: any) {
      setError(err?.message || 'Failed to update task status');
    }
  };

  const initiateDeleteTask = (task: GoogleTaskItem) => {
    setPendingAction({ type: 'delete', task });
    setConfirmModalOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!pendingAction || !accessToken) return;

    if (pendingAction.type === 'delete') {
      try {
        await deleteGoogleTask(accessToken, selectedListId, pendingAction.task.id);
        setTasks((prev) => prev.filter((t) => t.id !== pendingAction.task.id));

        onLogInteraction(
          `Deleted Google Task: ${pendingAction.task.title}`,
          'task_action',
          { taskId: pendingAction.task.id, title: pendingAction.task.title }
        );
      } catch (err: any) {
        setError(err?.message || 'Failed to delete task');
      }
    }

    setConfirmModalOpen(false);
    setPendingAction(null);
  };

  if (!accessToken) {
    return (
      <div className="p-8 rounded-2xl bg-slate-900/90 border border-cyan-900/50 text-center max-w-xl mx-auto shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center mx-auto mb-4 text-cyan-400">
          <CheckSquare className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-100 font-mono tracking-wide">
          GOOGLE TASKS INTEGRATION
        </h3>
        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
          Authenticate with your Google account to grant ARONE permission to view, schedule, and organize your tasks in Google Tasks.
        </p>
        <div className="mt-6">
          <button
            onClick={onAuthenticate}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-900/40 transition-all cursor-pointer"
          >
            Authorize Google Tasks Sync
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-cyan-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-slate-100 font-mono tracking-wide">
              EXECUTIVE TASK MATRIX // GOOGLE TASKS
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Two-way synchronization with your Google Workspace Tasks
          </p>
        </div>

        <div className="flex items-center gap-3">
          {taskLists.length > 0 && (
            <select
              value={selectedListId}
              onChange={(e) => setSelectedListId(e.target.value)}
              className="bg-slate-950 border border-cyan-900/70 text-cyan-300 text-xs rounded-lg px-3 py-1.5 font-mono focus:outline-none focus:border-cyan-400"
            >
              {taskLists.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.title}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={loadTasks}
            disabled={isLoading}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 transition-colors disabled:opacity-50"
            title="Refresh Tasks"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/60 text-xs text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Task Creation Form */}
      <form
        onSubmit={handleCreateTask}
        className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-3"
      >
        <div className="text-xs font-mono font-semibold text-cyan-400 flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Quick Dispatch Task to Google Tasks
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <input
            type="text"
            placeholder="Task title (e.g., Review Q4 financial model)..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            required
            className="sm:col-span-2 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <input
            type="date"
            value={newTaskDue}
            onChange={(e) => setNewTaskDue(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>
        <div className="flex justify-between items-center">
          <input
            type="text"
            placeholder="Optional notes or details..."
            value={newTaskNotes}
            onChange={(e) => setNewTaskNotes(e.target.value)}
            className="w-2/3 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            disabled={isLoading || !newTaskTitle.trim()}
            className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-slate-950 text-xs font-bold transition-all"
          >
            {isLoading ? 'Dispatching...' : 'Add Task'}
          </button>
        </div>
      </form>

      {/* Task List */}
      <div className="space-y-2">
        {tasks.length === 0 && !isLoading ? (
          <div className="p-8 text-center rounded-xl bg-slate-950/40 border border-slate-800/60 text-slate-500 text-xs font-mono">
            No active tasks found in this list. Use voice or form to add your first item.
          </div>
        ) : (
          tasks.map((task) => {
            const isCompleted = task.status === 'completed';
            return (
              <div
                key={task.id}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                  isCompleted
                    ? 'bg-slate-950/40 border-slate-900 text-slate-500 opacity-60'
                    : 'bg-slate-900/80 border-slate-800 hover:border-cyan-900/60 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => handleToggleComplete(task)}
                    className="p-1 hover:text-cyan-400 text-slate-400 transition-colors"
                  >
                    {isCompleted ? (
                      <CheckSquare className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-medium truncate ${
                        isCompleted ? 'line-through text-slate-500' : 'text-slate-100'
                      }`}
                    >
                      {task.title}
                    </p>
                    {task.notes && (
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{task.notes}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {task.due && (
                    <span className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-cyan-400/80 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40">
                      <Calendar className="w-3 h-3" />
                      {new Date(task.due).toLocaleDateString()}
                    </span>
                  )}

                  <button
                    onClick={() => initiateDeleteTask(task)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                    title="Delete Task from Google Tasks"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModalOpen}
        title="Confirm Google Task Deletion"
        description="Are you sure you want to delete this task from Google Tasks? This action will permanently remove it from your Google account."
        actionLabel="Delete Task"
        isDestructive={true}
        onConfirm={handleConfirmAction}
        onCancel={() => {
          setConfirmModalOpen(false);
          setPendingAction(null);
        }}
        details={
          pendingAction?.task
            ? {
                title: pendingAction.task.title,
                notes: pendingAction.task.notes,
                status: pendingAction.task.status,
              }
            : undefined
        }
      />
    </div>
  );
};
