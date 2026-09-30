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
  projectAware: boolean;
  askQuestion: (question: string) => Promise<void>;
  clearConversation: () => void;
}

const ONBOARDING_KEY = '__onboarding__';

const PROJECT_WELCOME_MESSAGE: ChatMessage = {
  role: 'assistant',
  content:
    'Hi, I’m Spec2Ship AI. Ask me about this workspace’s requirements, tests, coverage gaps, change impact, risk, automation, or release readiness.',
};

const ONBOARDING_WELCOME_MESSAGE: ChatMessage = {
  role: 'assistant',
  content:
    'Hi, I’m Spec2Ship AI. No workspace is open right now. I can help you get started, find a workspace, or explain how Spec2Ship works.',
};

const CopilotContext =
  createContext<CopilotContextValue | null>(null);

function storageKey(contextKey: string): string {
  return `spec2ship.ai.chat.${contextKey}`;
}

function welcomeMessage(
  projectAware: boolean,
): ChatMessage {
  return projectAware
    ? PROJECT_WELCOME_MESSAGE
    : ONBOARDING_WELCOME_MESSAGE;
}

function loadMessages(
  contextKey: string,
  projectAware: boolean,
): ChatMessage[] {
  const fallback = [welcomeMessage(projectAware)];

  if (typeof window === 'undefined') {
    return fallback;
  }

  const stored = window.sessionStorage.getItem(
    storageKey(contextKey),
  );

  if (!stored) return fallback;

  try {
    const parsed = JSON.parse(
      stored,
    ) as ChatMessage[];

    if (
      Array.isArray(parsed) &&
      parsed.every(
        (message) =>
          message &&
          (message.role === 'user' ||
            message.role === 'assistant') &&
          typeof message.content === 'string',
      )
    ) {
      return parsed.length > 0
        ? parsed
        : fallback;
    }
  } catch {
    // Ignore malformed session data.
  }

  return fallback;
}

function onboardingAnswer(
  question: string,
): string {
  const normalized = question.toLowerCase();

  if (
    normalized.includes('create') ||
    normalized.includes('new workspace') ||
    normalized.includes('new project')
  ) {
    return 'Open Projects and choose New Workspace. You’ll name the project, choose its Ship Key, and Spec2Ship will generate requirement and test IDs from that key.';
  }

  if (
    normalized.includes('demo') ||
    normalized.includes('example') ||
    normalized.includes('learn')
  ) {
    return 'Open Projects, expand Learn Spec2Ship, and choose Explore Demo. The ShopSphere workspace is read-only, so you can explore the full workflow safely.';
  }

  if (
    normalized.includes('search') ||
    normalized.includes('find')
  ) {
    return 'Use Global Search in the header to find projects, Ship Keys, requirement IDs, test IDs, and automation evidence across all workspaces.';
  }

  if (
    normalized.includes('open') ||
    normalized.includes('workspace') ||
    normalized.includes('project')
  ) {
    return 'Open Projects and choose a workspace. Once it is open, the workspace-specific navigation appears and I can answer questions using that project’s QA evidence.';
  }

  return 'I’m in getting-started mode because no workspace is open. I can help you create or open a workspace, use Global Search, explore the demo, or explain the Spec2Ship workflow.';
}

export function CopilotProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const {
    selectedProjectId,
    projectApiUrl,
  } = useProject();

  const projectAware =
    selectedProjectId !== null;

  const contextKey =
    selectedProjectId ?? ONBOARDING_KEY;

  const [histories, setHistories] =
    useState<Record<string, ChatMessage[]>>(
      () => ({
        [contextKey]: loadMessages(
          contextKey,
          projectAware,
        ),
      }),
    );

  const [
    loadingByContext,
    setLoadingByContext,
  ] = useState<Record<string, boolean>>({});

  const [
    errorsByContext,
    setErrorsByContext,
  ] = useState<
    Record<string, string | null>
  >({});

  useEffect(() => {
    setHistories((current) => {
      if (current[contextKey]) {
        return current;
      }

      return {
        ...current,
        [contextKey]: loadMessages(
          contextKey,
          projectAware,
        ),
      };
    });
  }, [contextKey, projectAware]);

  const messages =
    histories[contextKey] ??
    [welcomeMessage(projectAware)];

  const loading =
    loadingByContext[contextKey] ?? false;

  const error =
    errorsByContext[contextKey] ?? null;

  function persist(
    key: string,
    nextMessages: ChatMessage[],
  ): void {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(
        storageKey(key),
        JSON.stringify(nextMessages),
      );
    }
  }

  async function askQuestion(
    question: string,
  ): Promise<void> {
    const trimmed = question.trim();

    if (!trimmed || loading) return;

    const requestKey = contextKey;

    const currentMessages =
      histories[requestKey] ??
      loadMessages(
        requestKey,
        projectAware,
      );

    const userMessage: ChatMessage = {
      role: 'user',
      content: trimmed,
    };

    const withUser = [
      ...currentMessages,
      userMessage,
    ];

    setHistories((current) => ({
      ...current,
      [requestKey]: withUser,
    }));

    persist(requestKey, withUser);

    setErrorsByContext((current) => ({
      ...current,
      [requestKey]: null,
    }));

    if (!selectedProjectId) {
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: onboardingAnswer(trimmed),
      };

      const next = [
        ...withUser,
        assistantMessage,
      ];

      setHistories((current) => ({
        ...current,
        [requestKey]: next,
      }));

      persist(requestKey, next);
      return;
    }

    const conversationHistory =
      currentMessages.filter(
        (message, index) =>
          index !== 0 ||
          message.role !== 'assistant',
      );

    setLoadingByContext((current) => ({
      ...current,
      [requestKey]: true,
    }));

    try {
      const response = await fetch(
        projectApiUrl('/api/ai/chat'),
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            message: trimmed,
            history:
              conversationHistory.slice(-8),
          }),
        },
      );

      const payload =
        (await response.json()) as {
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
          current[requestKey] ??
          withUser;

        const next = [
          ...projectMessages,
          assistantMessage,
        ];

        persist(requestKey, next);

        return {
          ...current,
          [requestKey]: next,
        };
      });
    } catch (err) {
      setErrorsByContext((current) => ({
        ...current,
        [requestKey]:
          err instanceof Error
            ? err.message
            : 'Spec2Ship AI could not answer that question.',
      }));
    } finally {
      setLoadingByContext((current) => ({
        ...current,
        [requestKey]: false,
      }));
    }
  }

  function clearConversation(): void {
    const next = [
      welcomeMessage(projectAware),
    ];

    setHistories((current) => ({
      ...current,
      [contextKey]: next,
    }));

    persist(contextKey, next);

    setErrorsByContext((current) => ({
      ...current,
      [contextKey]: null,
    }));
  }

  const value =
    useMemo<CopilotContextValue>(
      () => ({
        messages,
        loading,
        error,
        projectAware,
        askQuestion,
        clearConversation,
      }),
      [
        messages,
        loading,
        error,
        projectAware,
        contextKey,
      ],
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
