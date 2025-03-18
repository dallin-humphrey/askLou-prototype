// src/lib/conversation-context.ts
export const ConversationContext = {
  getCurrentConversationId: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('currentConversationId');
  },
  
  setConversationId: (id: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('currentConversationId', id);
  },
  
  clearConversationId: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('currentConversationId');
  }
};