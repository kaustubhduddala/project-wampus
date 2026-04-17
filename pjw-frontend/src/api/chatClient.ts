export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  answer: string;
  sources: string[];
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001';

export async function askChatbot(
  question: string,
  history: ChatMessage[]
): Promise<ChatResponse> {
  const response = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, history }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error ?? `Request failed with status ${response.status}`);
  }

  return response.json();
}
