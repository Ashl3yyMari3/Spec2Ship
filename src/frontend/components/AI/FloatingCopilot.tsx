import React, {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Link } from 'react-router-dom';
import { useCopilot } from '../../context/CopilotContext';
import { useProject } from '../../context/ProjectContext';
import { useApi } from '../../hooks/useApi';
import '../../styles/floating-copilot.css';

interface ProjectHeader {
  id: string;
  name: string;
}

const PROJECT_QUESTIONS = [
  'Why is this release Review Required?',
  'What should I test next?',
  'Where is the highest risk?',
];

const ONBOARDING_QUESTIONS = [
  'How do I create a workspace?',
  'How do I explore the demo?',
  'How do I find a project or test?',
];

export default function FloatingCopilot(): React.ReactElement {
  const {
    messages,
    loading,
    error,
    projectAware,
    askQuestion,
    clearConversation,
  } = useCopilot();

  const { selectedProjectId } = useProject();

  const { data: project } = useApi<ProjectHeader>(
    selectedProjectId
      ? `/api/projects/${encodeURIComponent(
          selectedProjectId,
        )}`
      : null,
  );

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const threadRef =
    useRef<HTMLDivElement | null>(null);

  const suggestions = projectAware
    ? PROJECT_QUESTIONS
    : ONBOARDING_QUESTIONS;

  useEffect(() => {
    if (!open) return;

    const element = threadRef.current;

    if (element) {
      element.scrollTop =
        element.scrollHeight;
    }
  }, [messages, loading, open]);

  async function send(): Promise<void> {
    const question = input.trim();

    if (!question || loading) return;

    setInput('');
    await askQuestion(question);
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): void {
    event.preventDefault();
    void send();
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>,
  ): void {
    if (
      event.key === 'Enter' &&
      !event.shiftKey
    ) {
      event.preventDefault();
      void send();
    }
  }

  return (
    <div className="floating-copilot">
      {open && (
        <section
          className="floating-copilot__panel"
          aria-label="Spec2Ship AI assistant"
        >
          <header className="floating-copilot__header">
            <div>
              <div className="floating-copilot__title">
                <span aria-hidden="true">
                  ✦
                </span>
                <strong>Spec2Ship AI</strong>
              </div>

              <span className="floating-copilot__project">
                {projectAware
                  ? project?.name ??
                    'Current workspace'
                  : 'Getting Started'}
              </span>
            </div>

            <div className="floating-copilot__header-actions">
              <button
                type="button"
                onClick={clearConversation}
                title="Start a new conversation"
                aria-label="Clear AI conversation"
              >
                ↻
              </button>

              <button
                type="button"
                onClick={() =>
                  setOpen(false)
                }
                title="Minimize chat"
                aria-label="Minimize Spec2Ship AI"
              >
                −
              </button>
            </div>
          </header>

          <div
            className="floating-copilot__thread"
            ref={threadRef}
            aria-live="polite"
          >
            {messages.map(
              (message, index) => (
                <article
                  className={
                    'floating-copilot__message ' +
                    `floating-copilot__message--${message.role}`
                  }
                  key={`${message.role}-${index}-${message.content.slice(
                    0,
                    18,
                  )}`}
                >
                  <span>
                    {message.role ===
                    'assistant'
                      ? '✦ Spec2Ship AI'
                      : 'You'}
                  </span>
                  <p>{message.content}</p>
                </article>
              ),
            )}

            {loading && (
              <article className="floating-copilot__message floating-copilot__message--assistant">
                <span>✦ Spec2Ship AI</span>
                <p className="floating-copilot__thinking">
                  Reviewing this workspace’s QA
                  evidence…
                </p>
              </article>
            )}
          </div>

          {messages.length <= 1 && (
            <div className="floating-copilot__suggestions">
              {suggestions.map(
                (question) => (
                  <button
                    type="button"
                    key={question}
                    disabled={loading}
                    onClick={() =>
                      void askQuestion(
                        question,
                      )
                    }
                  >
                    {question}
                  </button>
                ),
              )}
            </div>
          )}

          {error && (
            <div
              className="floating-copilot__error"
              role="alert"
            >
              {error}
            </div>
          )}

          <form
            className="floating-copilot__composer"
            onSubmit={handleSubmit}
          >
            <textarea
              value={input}
              onChange={(event) =>
                setInput(
                  event.target.value,
                )
              }
              onKeyDown={handleKeyDown}
              placeholder={
                projectAware
                  ? 'Ask Spec2Ship about this workspace…'
                  : 'Ask how to get started with Spec2Ship…'
              }
              maxLength={2000}
              rows={2}
              disabled={loading}
              aria-label="Ask Spec2Ship AI"
            />

            <div className="floating-copilot__composer-footer">
              <Link to="/ai">
                Open full chat
              </Link>

              <button
                type="submit"
                disabled={
                  loading ||
                  !input.trim()
                }
              >
                {loading
                  ? 'Thinking…'
                  : 'Send'}
              </button>
            </div>
          </form>
        </section>
      )}

      <button
        type="button"
        className={
          'floating-copilot__launcher' +
          (open
            ? ' floating-copilot__launcher--open'
            : '')
        }
        onClick={() =>
          setOpen(
            (current) => !current,
          )
        }
        aria-label={
          open
            ? 'Close Spec2Ship AI'
            : 'Open Spec2Ship AI'
        }
        aria-expanded={open}
      >
        <span className="floating-copilot__launcher-orb">
          ✦
        </span>

        {!open && (
          <span className="floating-copilot__launcher-label">
            Ask Spec2Ship AI
          </span>
        )}
      </button>
    </div>
  );
}
