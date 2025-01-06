// stores/aiStore.ts
import { create } from 'zustand';

interface AIState {
  response: string | null;
  loading: boolean;
  error: string | null;
  fetchResponse: (body: { user_id: string; command: string; ai_name: string }) => Promise<void>;
}

export const useAIStore = create<AIState>((set) => ({
    response: null,
    loading: false,
    error: null,
    fetchResponse: async (body) => {
      set({ loading: true, error: null });
      try {
        const res = await fetch('/api/process-ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
  
        if (!res.ok) {
          throw new Error('Failed to fetch data');
        }
  
        const data = await res.json();
        set({ response: data.response, loading: false });
      } catch (error) {
        set({ error: (error as Error).message, loading: false });
      }
    },
  }));
  

  
