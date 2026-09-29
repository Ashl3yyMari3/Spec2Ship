import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useProject } from './ProjectContext';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface CopilotContextValue {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  askQuestion: (question: string) => Promise<void>;
  clearConversation: () => void;
}

const WELCOME_MESSAGE: ChatMessage = {
  role: 'assistant',
  content:
    'Hi, I’m Spec2Ship AI. Ask me about requirements, tests, coverage gaps, change impact, risk, automation, or release readiness.',
};

const CopilotContext = createContext<CopilotContextValue | null>(null);

function storageKey(projectId: string): string {
  return `spec2ship.ai.chat.${projectId}`;
}

function loadMessages(projectId: string): ChatMessage[] {
  if (typeof window === 'undefined') {
    return [WELCOME_MESSAGE];
  }

  const stored = window.sessionStorage.getItem(storageKey(projectId));

  if (!stored) {
    return [WELCOME_MESSAGE];
  }

  try {
    const parsed = JSON.parse(stored) as ChatMessage[];

    if (
      Array.isArray(parsed) &&
      parsed.every(
        (message) =>
          message &&
          (message.role === 'user' || message.role === 'assistant') &&
          typeof message.content === 'string',
      )
    ) {
      return parsed.length > 0 ? parsed : [WELCOME_MESSAGE];
    }
  } catch {
    // Ignore malformed session data and start a fresh conversation.
  }

  return [WELCOME_MESSAGE];
}

export function CopilotProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const { selectedProjectId, projectApiUrl } = useProject();

  const [histories, setHistories] = useState<Record<string, ChatMessage[]>>(
    () => ({
      [selectedProjectId]: loadMessages(selectedProjectId),
    }),
  );

  const [loadingByProject, setLoadingByProject] = useState<
    Record<string, boolean>
  >({});

  const [errorsByProject, setErrorsByProject] = useState<
    Record<string, string | null>
  >({});

  useEffect(() => {
    setHistories((current) => {
      if (current[selectedProjectId]) {
        return current;
      }

      return {
        ...current,
        [selectedProjectId]: loadMessages(selectedProjectId),
      };
    });
  }, [selectedProjectId]);

  const messages =
    histories[selectedProjectId] ?? [WELCOME_MESSAGE];

  const loading = loadingByProject[selectedProjectId] ?? false;
  const error = errorsByProject[selectedProjectId] ?? null;

  function persist(
    projectId: string,
    nextMessages: ChatMessage[],
  ): void {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(
        storageKey(projectId),
        JSON.stringify(nextMessages),
      );
    }
  }

  async function askQuestion(question: string): Promise<void> {
    const trimmed = question.trim();

    if (!trimmed || loading) return;

    const requestProjectId = selectedProjectId;
    const currentMessages =
      histories[requestProjectId] ?? loadMessages(requestProjectId);

    const conversationHistory = currentMessages.filter(
      (message, index) =>
        index !== 0 || message.role !== 'assistant',
    );

    const userMessage: ChatMessage = {
      role: 'user',
      content: trimmed,
    };

    const withUser = [...currentMessages, userMessage];

    setHistories((current) => ({
      ...current,
      [requestProjectId]: withUser,
    }));
    persist(requestProjectId, withUser);

    setLoadingByProject((current) => ({
      ...current,
      [requestProjectId]: true,
    }));

    setErrorsByProject((current) => ({
      ...current,
      [requestProjectId]: null,
    }));

    try {
      const response = await fetch(projectApiUrl('/api/ai/chat'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: trimmed,
          history: conversationHistory.slice(-8),
        }),
      });

      const payload = (await response.json()) as {
        answer?: string;
        error?: string;
      };

      if (!response.ok || !payload.answer) {
        throw new Error(
          payload.error ??
            `Spec2Ship AI failed with status ${response.status}.`,
        );
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: payload.answer,
      };

      setHistories((current) => {
        const projectMessages =
          current[requestProjectId] ?? withUser;
        const next = [...projectMessages, assistantMessage];

        persist(requestProjectId, next);

        return {
          ...current,
          [requestProjectId]: next,
        };
      });
    } catch (err) {
      setErrorsByProject((current) => ({
        ...current,
        [requestProjectId]:
          err instanceof Error
            ? err.message
            : 'Spec2Ship AI could not answer that question.',
      }));
    } finally {
      setLoadingByProject((current) => ({
        ...current,
        [requestProjectId]: false,
      }));
    }
  }

  function clearConversation(): void {
    const next = [WELCOME_MESSAGE];

    setHistories((current) => ({
      ...current,
      [selectedProjectId]: next,
    }));

    persist(selectedProjectId, next);

    setErrorsByProject((current) => ({
      ...current,
      [selectedProjectId]: null,
    }));
  }

  const value = useMemo<CopilotContextValue>(
    () => ({
      messages,
      loading,
      error,
      askQuestion,
      clearConversation,
    }),
    [messages, loading, error, selectedProjectId],
  );

  return (
    <CopilotContext.Provider value={value}>
      {children}
    </CopilotContext.Provider>
  );
}

export function useCopilot(): CopilotContextValue {
  const context = useContext(CopilotContext);

  if (!context) {
    throw new Error(
      'useCopilot must be used inside CopilotProvider.',
    );
  }

  return context;
}
