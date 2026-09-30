import React, {
  FormEvent,
  KeyboardEvent,
  useState,
} from 'react';
import '../styles/copilot.css';
import { useCopilot } from '../context/CopilotContext';

const PROJECT_QUESTIONS = [
  'Why is this release Review Required?',
  'Which requirement has the highest risk?',
  'What testing gaps should I focus on first?',
  'What would need to change for this release to be Ready?',
];

const ONBOARDING_QUESTIONS = [
  'How do I create a workspace?',
  'How do I explore the demo?',
  'How do I find a project or test?',
  'What does Spec2Ship do?',
];

export default function CopilotPage(): React.ReactElement {
  const {
    messages,
    loading,
    error,
    projectAware,
    askQuestion,
    clearConversation,
  } = useCopilot();

  const [input, setInput] = useState('');

  const suggestedQuestions = projectAware
    ? PROJECT_QUESTIONS
    : ONBOARDING_QUESTIONS;

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
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void send();
    }
  }

  return (
    <>
      <div className="page-header">
        <p className="copilot-page__eyebrow">
          QA Intelligence Copilot
        </p>
        <h1 className="page-header__title">
          ✦ Spec2Ship AI
        </h1>
        <p className="page-header__subtitle">
          {projectAware
            ? 'Ask questions about the current workspace using Spec2Ship’s traceability, coverage, automation, risk, change-impact, and release-readiness evidence.'
            : 'No workspace is open. Use Spec2Ship AI to get started, find a workspace, explore the demo, or learn how the workflow fits together.'}
        </p>
      </div>

      <section
        className="copilot-shell"
        aria-label="Spec2Ship AI chat"
      >
        <div className="copilot-status">
          <span
            className="copilot-status__dot"
            aria-hidden="true"
          />
          <span>
            {projectAware
              ? 'Project-aware · Read-only'
              : 'Getting started · No workspace context'}
          </span>

          <button
            type="button"
            onClick={clearConversation}
            style={{
              marginLeft: 'auto',
              border: '1px solid rgba(139,92,246,.24)',
              borderRadius: 999,
              padding: '6px 9px',
              background: 'rgba(30,27,75,.35)',
              color: '#ddd6fe',
              font: 'inherit',
              fontSize: 10,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            New Chat
          </button>
        </div>

        {messages.length <= 1 && (
          <div
            className="copilot-suggestions"
            aria-label="Suggested questions"
          >
            {suggestedQuestions.map((question) => (
              <button
                type="button"
                className="copilot-suggestion"
                key={question}
                onClick={() => void askQuestion(question)}
                disabled={loading}
              >
                {question}
              </button>
            ))}
          </div>
        )}

        <div className="copilot-thread" aria-live="polite">
          {messages.map((message, index) => (
            <article
              className={
                `copilot-message copilot-message--${message.role}`
              }
              key={`${message.role}-${index}-${message.content.slice(
                0,
                20,
              )}`}
            >
              <div className="copilot-message__label">
                {message.role === 'assistant'
                  ? '✦ Spec2Ship AI'
                  : 'You'}
              </div>
              <div className="copilot-message__content">
                {message.content}
              </div>
            </article>
          ))}

          {loading && (
            <article className="copilot-message copilot-message--assistant">
              <div className="copilot-message__label">
                ✦ Spec2Ship AI
              </div>
              <div className="copilot-message__content copilot-message__thinking">
                {projectAware
                  ? 'Reviewing project evidence…'
                  : 'Getting started…'}
              </div>
            </article>
          )}
        </div>

        {error && (
          <div className="copilot-error" role="alert">
            {error}
          </div>
        )}

        <form
          className="copilot-composer"
          onSubmit={handleSubmit}
        >
          <label
            htmlFor="copilot-input"
            className="sr-only"
          >
            Ask Spec2Ship AI
          </label>

          <textarea
            id="copilot-input"
            className="copilot-composer__input"
            value={input}
            onChange={(event) =>
              setInput(event.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder={
              projectAware
                ? 'Ask why the release needs review, what to test next, where risk exists…'
                : 'Ask how to get started with Spec2Ship…'
            }
            rows={3}
            maxLength={2000}
            disabled={loading}
          />

          <div className="copilot-composer__footer">
            <span className="copilot-composer__hint">
              Enter to send · Shift + Enter for a new line
            </span>

            <button
              type="submit"
              className="copilot-composer__send"
              disabled={loading || !input.trim()}
            >
              {loading ? 'Thinking…' : 'Ask Spec2Ship AI'}
            </button>
          </div>
        </form>
      </section>
    </>
  );
}
