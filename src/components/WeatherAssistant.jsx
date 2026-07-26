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
    "Tell me what you have planned, and I’ll match it with today’s forecast.",
};

function WeatherAssistant({ weather, locationName, unit }) {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [question, setQuestion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const logRef = useRef(null);
  const messageId = useRef(0);

  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages, submitting]);

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
    <section className="weather-assistant" aria-labelledby="assistant-heading">
      <div className="assistant-intro">
        <div className="assistant-avatar" aria-hidden="true">
          <span />
        </div>
        <div>
          <span className="eyebrow">Weather, made personal</span>
          <h2 id="assistant-heading">Ask MeteoMood</h2>
          <p>
            Ask about an activity, what to wear, or the best time to head out.
          </p>
        </div>
        <span className="assistant-badge">AI forecast guide</span>
      </div>

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
        aria-label="Conversation with MeteoMood"
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
          Ask MeteoMood a weather question
        </label>
        <input
          id="weather-question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder={`Ask about your day in ${locationName}...`}
          maxLength={360}
          autoComplete="off"
          disabled={submitting}
        />
        <button
          type="submit"
          disabled={submitting || !question.trim()}
          aria-label="Send weather question"
        >
          <span aria-hidden="true">→</span>
        </button>
      </form>

      <p className="assistant-disclaimer">
        Answers use the displayed forecast and may change as conditions update.
      </p>
    </section>
  );
}

export default WeatherAssistant;
