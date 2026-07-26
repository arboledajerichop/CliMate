import { useEffect, useRef, useState } from "react";
import {
  askWeatherAssistant,
  buildForecastSnapshot,
} from "../services/weatherAssistantApi";

const STARTER_PROMPTS = [
  "Can I go for a run later?",
  "What should I wear today?",
  "When should I do my laundry?",
  "Suggest an outdoor activity",
];

const WELCOME_MESSAGE = {
  id: "welcome",
  role: "assistant",
  content:
    "Tell me what you have planned, and I'll match it with today's forecast.",
};

function WeatherAssistant({ weather, locationName, unit }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [question, setQuestion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const logRef = useRef(null);
  const inputRef = useRef(null);
  const messageId = useRef(0);

  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages, submitting]);

  useEffect(() => {
    if (!isOpen) return undefined;

    inputRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") setIsOpen(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  async function sendQuestion(rawQuestion) {
    const cleanQuestion = rawQuestion.trim();
    if (!cleanQuestion || submitting) return;
    const currentMessageId = ++messageId.current;

    const userMessage = {
      id: `user-${currentMessageId}`,
      role: "user",
      content: cleanQuestion,
    };
    const conversationHistory = messages
      .filter((message) => message.id !== "welcome")
      .map(({ role, content }) => ({ role, content }));

    setMessages((current) => [...current, userMessage]);
    setQuestion("");
    setError("");
    setSubmitting(true);

    try {
      const answer = await askWeatherAssistant({
        question: cleanQuestion,
        history: conversationHistory,
        forecast: buildForecastSnapshot(weather, locationName, unit),
      });

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${currentMessageId}`,
          role: "assistant",
          content: answer.reply,
          meta: answer,
        },
      ]);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Meteo could not answer that right now."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    sendQuestion(question);
  }

  return (
    <>
      <button
        className={`assistant-launcher ${isOpen ? "is-chat-open" : ""}`}
        type="button"
        onClick={() => setIsOpen(true)}
        aria-expanded={isOpen}
        aria-controls="jerichomood-chat"
        aria-label="Open Ask JerichoMood"
      >
        <span className="assistant-launcher-icon" aria-hidden="true">
          <i />
        </span>
        <span className="assistant-launcher-copy">
          <strong>Ask Meteo</strong>
          <small>Plan around the weather</small>
        </span>
        <span className="assistant-launcher-badge" aria-hidden="true">
          AI
        </span>
      </button>

      {isOpen && (
        <section
          className="weather-assistant"
          id="jerichomood-chat"
          role="dialog"
          aria-modal="false"
          aria-labelledby="assistant-heading"
        >
          <header className="assistant-intro">
            <div className="assistant-avatar" aria-hidden="true">
              <span />
            </div>
            <div>
              <span className="eyebrow">Weather, made personal</span>
              <h2 id="assistant-heading">Ask JerichoMood</h2>
              <p>{locationName}</p>
            </div>
            <button
              className="assistant-close"
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close weather assistant"
            >
              <span aria-hidden="true" />
            </button>
          </header>

          <div className="assistant-prompts" aria-label="Suggested questions">
            {STARTER_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => sendQuestion(prompt)}
                disabled={submitting}
              >
                {prompt}
              </button>
            ))}
          </div>

          <div
            className="assistant-log"
            ref={logRef}
            role="log"
            aria-live="polite"
            aria-label="Conversation with JerichoMood"
          >
            {messages.map((message) => (
              <article
                className={`assistant-message assistant-message--${message.role}`}
                key={message.id}
              >
                <span className="assistant-speaker">
                  {message.role === "assistant" ? "Meteo" : "You"}
                </span>
                <p>{message.content}</p>

                {message.meta?.best_window && (
                  <div className="assistant-window">
                    <span>Best window</span>
                    <strong>{message.meta.best_window}</strong>
                  </div>
                )}

                {message.meta?.tips?.length > 0 && (
                  <ul className="assistant-tips">
                    {message.meta.tips.slice(0, 3).map((tip) => (
                      <li key={tip}>{tip}</li>
                    ))}
                  </ul>
                )}

                {message.meta?.safety_note && (
                  <small className="assistant-safety">
                    {message.meta.safety_note}
                  </small>
                )}
              </article>
            ))}

            {submitting && (
              <div className="assistant-thinking" aria-label="Meteo is thinking">
                <span />
                <span />
                <span />
              </div>
            )}
          </div>

          {error && (
            <p className="assistant-error" role="alert">
              {error}
            </p>
          )}

          <form className="assistant-form" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor="weather-question">
              Ask JerichoMood a weather question
            </label>
            <input
              ref={inputRef}
              id="weather-question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask about your plans..."
              maxLength={360}
              autoComplete="off"
              disabled={submitting}
            />
            <button
              type="submit"
              disabled={submitting || !question.trim()}
              aria-label="Send weather question"
            >
              <span aria-hidden="true">&rarr;</span>
            </button>
          </form>

          <p className="assistant-disclaimer">
            Uses the displayed forecast. Conditions may change.
          </p>
        </section>
      )}
    </>
  );
}

export default WeatherAssistant;
