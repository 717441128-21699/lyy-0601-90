import { create } from 'zustand';
import type { NutritionistNote, TodoItem } from '@/types';
import { mockNutritionistNotes, mockTodos } from '@/mock/data';
import { storage, generateId } from '@/utils/storage';
import { getToday, getTodayISO } from '@/utils/date';
import { useNotificationStore } from '@/store/useNotificationStore';

interface NoteState {
  notes: NutritionistNote[];
  todos: TodoItem[];
  addNote: (data: Omit<NutritionistNote, 'id' | 'userId' | 'createdAt'>) => NutritionistNote;
  upsertNoteForDietRecord: (dietRecordId: string, data: Partial<NutritionistNote>) => NutritionistNote;
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
  
  addNote: (data) => {
    const newNote: NutritionistNote = {
      ...data,
      id: generateId('note'),
      userId: 'user-001',
      createdAt: getTodayISO(),
    };
    
    set((state) => {
      const updated = [newNote, ...state.notes];
      storage.set('notes', updated);
      return { notes: updated };
    });
    
    const { addNotification } = useNotificationStore.getState();
    addNotification({
      type: 'note',
      title: '💬 营养师新留言',
      content: `营养师给您发了一条新留言：${data.content.substring(0, 30)}...，点击查看详情并回复。`,
      relatedRecordId: newNote.id,
    });
    
    return newNote;
  },
  
  upsertNoteForDietRecord: (dietRecordId, data) => {
    const existingNote = get().notes.find(n => n.relatedRecordId === dietRecordId);
    
    if (existingNote) {
      const updatedNote: NutritionistNote = {
        ...existingNote,
        ...data,
        updatedAt: getTodayISO(),
      };
      
      set((state) => {
        const updated = state.notes.map(note =>
          note.id === existingNote.id ? updatedNote : note
        );
        storage.set('notes', updated);
        return { notes: updated };
      });
      
      return updatedNote;
    } else {
      const newNote: NutritionistNote = {
        nutritionistId: 'nutri-001',
        nutritionistName: '李营养师',
        nutritionistAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=100&h=100',
        content: data.content || '营养师已处理该餐食的风险评估',
        isHighRisk: data.isHighRisk || false,
        relatedRecordId: dietRecordId,
        relatedRecordType: data.relatedRecordType || 'diet',
        ...data,
        id: generateId('note'),
        userId: 'user-001',
        createdAt: getTodayISO(),
      };
      
      set((state) => {
        const updated = [newNote, ...state.notes];
        storage.set('notes', updated);
        return { notes: updated };
      });
      
      const { addNotification } = useNotificationStore.getState();
      addNotification({
        type: 'note',
        title: '💬 营养师新留言',
        content: `营养师给您发了一条新留言：${newNote.content.substring(0, 30)}...，点击查看详情并回复。`,
        relatedRecordId: newNote.id,
      });
      
      return newNote;
    }
  },
  
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
