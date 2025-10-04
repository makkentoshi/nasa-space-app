import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface WeatherInsight {
  id: string
  type: 'temperature' | 'precipitation' | 'general'
  insight: string
  confidence: 'high' | 'medium' | 'low'
  location: string
  timestamp: string
  nasaData?: any
}

export interface ConversationContext {
  insightId: string
  insightType: 'temperature' | 'precipitation' | 'general'
  location: string
  messages: Array<{
    role: 'user' | 'assistant'
    content: string
    timestamp: string
  }>
}

interface WeatherInsightsState {
  insights: WeatherInsight[]
  conversations: ConversationContext[]
  currentConversation: ConversationContext | null
  
  // Actions
  addInsight: (insight: WeatherInsight) => void
  startConversation: (insight: WeatherInsight) => void
  addMessage: (role: 'user' | 'assistant', content: string) => void
  clearCurrentConversation: () => void
  getConversationById: (insightId: string) => ConversationContext | undefined
}

export const useWeatherInsightsStore = create<WeatherInsightsState>()(
  persist(
    (set, get) => ({
      insights: [],
      conversations: [],
      currentConversation: null,

      addInsight: (insight) => {
        set((state) => ({
          insights: [insight, ...state.insights.slice(0, 49)] // Keep last 50
        }))
      },

      startConversation: (insight) => {
        const existingConversation = get().conversations.find(
          c => c.insightId === insight.id
        )

        if (existingConversation) {
          set({ currentConversation: existingConversation })
        } else {
          const newConversation: ConversationContext = {
            insightId: insight.id,
            insightType: insight.type,
            location: insight.location,
            messages: [
              {
                role: 'assistant',
                content: insight.insight,
                timestamp: insight.timestamp
              }
            ]
          }

          set((state) => ({
            conversations: [newConversation, ...state.conversations.slice(0, 19)], // Keep last 20
            currentConversation: newConversation
          }))
        }
      },

      addMessage: (role, content) => {
        const { currentConversation } = get()
        if (!currentConversation) return

        const newMessage = {
          role,
          content,
          timestamp: new Date().toISOString()
        }

        const updatedConversation = {
          ...currentConversation,
          messages: [...currentConversation.messages, newMessage]
        }

        set((state) => ({
          currentConversation: updatedConversation,
          conversations: state.conversations.map(c =>
            c.insightId === currentConversation.insightId ? updatedConversation : c
          )
        }))
      },

      clearCurrentConversation: () => {
        set({ currentConversation: null })
      },

      getConversationById: (insightId) => {
        return get().conversations.find(c => c.insightId === insightId)
      }
    }),
    {
      name: 'weather-insights-storage',
      partialize: (state) => ({
        insights: state.insights,
        conversations: state.conversations
      })
    }
  )
)