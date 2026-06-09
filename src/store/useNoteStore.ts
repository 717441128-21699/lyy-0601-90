import { create } from 'zustand';
import type { NutritionistNote, TodoItem } from '@/types';
import { mockNutritionistNotes, mockTodos } from '@/mock/data';
import { storage, generateId } from '@/utils/storage';
import { getToday, getTodayISO } from '@/utils/date';

interface NoteState {
  notes: NutritionistNote[];
  todos: TodoItem[];
  replyToNote: (noteId: string, content: string) => void;
  toggleTodo: (todoId: string) => void;
  addTodo: (data: Omit<TodoItem, 'id' | 'userId' | 'completed'>) => void;
  getUnreadCount: () => number;
  getHighRiskCount: () => number;
}

const getInitialNotes = (): NutritionistNote[] => {
  const stored = storage.get<NutritionistNote[] | null>('notes', null);
  return stored || mockNutritionistNotes;
};

const getInitialTodos = (): TodoItem[] => {
  const stored = storage.get<TodoItem[] | null>('todos', null);
  return stored || mockTodos;
};

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: getInitialNotes(),
  todos: getInitialTodos(),
  
  replyToNote: (noteId, content) => set((state) => {
    const updated = state.notes.map(note =>
      note.id === noteId
        ? { ...note, reply: content, replyAt: getTodayISO() }
        : note
    );
    storage.set('notes', updated);
    return { notes: updated };
  }),
  
  toggleTodo: (todoId) => set((state) => {
    const updated = state.todos.map(todo =>
      todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
    );
    storage.set('todos', updated);
    return { todos: updated };
  }),
  
  addTodo: (data) => set((state) => {
    const newTodo: TodoItem = {
      ...data,
      id: generateId('todo'),
      userId: 'user-001',
      completed: false,
    };
    const updated = [newTodo, ...state.todos];
    storage.set('todos', updated);
    return { todos: updated };
  }),
  
  getUnreadCount: () => {
    return get().notes.filter(n => !n.reply).length;
  },
  
  getHighRiskCount: () => {
    return get().notes.filter(n => n.isHighRisk).length;
  },
}));
