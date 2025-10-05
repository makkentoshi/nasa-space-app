import { create } from 'zustand';

export type EmergencyType = 
  | 'earthquake' 
  | 'fire' 
  | 'flood' 
  | 'medical' 
  | 'accident' 
  | 'evacuation';

export interface EmergencyMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: {
    officialLinks?: string[];
    videoUrls?: string[];
    emergencyNumbers?: string[];
  };
}

export interface EmergencyConversation {
  id: string;
  type: EmergencyType;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  messages: EmergencyMessage[];
  createdAt: number;
  updatedAt: number;
  location?: {
    lat: number;
    lng: number;
    name: string;
  };
}

interface EmergencyChatStore {
  conversations: EmergencyConversation[];
  currentConversation: EmergencyConversation | null;
  
  // Actions
  createConversation: (type: EmergencyType, severity: 'low' | 'medium' | 'high' | 'critical', initialMessage?: string) => void;
  setCurrentConversation: (id: string) => void;
  addMessage: (role: 'user' | 'assistant', content: string, metadata?: EmergencyMessage['metadata']) => void;
  clearCurrentConversation: () => void;
  deleteConversation: (id: string) => void;
}

export const useEmergencyChatStore = create<EmergencyChatStore>((set, get) => ({
  conversations: [],
  currentConversation: null,

  createConversation: (type, severity, initialMessage) => {
    const conversation: EmergencyConversation = {
      id: `emergency-${Date.now()}`,
      type,
      title: getEmergencyTitle(type),
      severity,
      messages: initialMessage ? [{
        id: `msg-${Date.now()}`,
        role: 'user',
        content: initialMessage,
        timestamp: Date.now()
      }] : [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    set((state) => ({
      conversations: [conversation, ...state.conversations],
      currentConversation: conversation
    }));
  },

  setCurrentConversation: (id) => {
    const conversation = get().conversations.find((c) => c.id === id);
    if (conversation) {
      set({ currentConversation: conversation });
    }
  },

  addMessage: (role, content, metadata) => {
    const { currentConversation } = get();
    if (!currentConversation) return;

    const message: EmergencyMessage = {
      id: `msg-${Date.now()}`,
      role,
      content,
      timestamp: Date.now(),
      metadata
    };

    const updatedConversation: EmergencyConversation = {
      ...currentConversation,
      messages: [...currentConversation.messages, message],
      updatedAt: Date.now()
    };

    set((state) => ({
      currentConversation: updatedConversation,
      conversations: state.conversations.map((c) =>
        c.id === currentConversation.id ? updatedConversation : c
      )
    }));
  },

  clearCurrentConversation: () => {
    set({ currentConversation: null });
  },

  deleteConversation: (id) => {
    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== id),
      currentConversation: state.currentConversation?.id === id ? null : state.currentConversation
    }));
  }
}));

function getEmergencyTitle(type: EmergencyType): string {
  const titles: Record<EmergencyType, string> = {
    earthquake: 'Earthquake Emergency',
    fire: 'Fire Emergency',
    flood: 'Flood Emergency',
    medical: 'Medical Emergency',
    accident: 'Accident Emergency',
    evacuation: 'Evacuation Emergency'
  };
  return titles[type];
}
