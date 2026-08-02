import { useMemo } from "react";
import { ACTIVITIES, createActivityPlan } from "../utils/activityPlanner";
import ActivityIcon from "./ActivityIcon";

function ActivityPlanner({ hourly, currentTime, activity, onActivityChange, preferences, convertTemperature, unit }) {
  const plan = useMemo(
    () => createActivityPlan(hourly, currentTime, activity, preferences),
    [activity, currentTime, hourly, preferences]
  );

  if (!plan) return null;

  return (
    <section className="activity-planner" id="planner" aria-labelledby="planner-heading">
      <div className="planner-heading">
        <div>
          <span className="eyebrow">Plan with the forecast</span>
          <h2 id="planner-heading">What can I do today?</h2>
          <p>Choose an activity and CliMate will find its best weather window.</p>
        </div>
        <span className={`planner-score planner-score--${plan.verdict.tone}`}>
          <strong>{plan.score}</strong>
          <small>{plan.verdict.label}</small>
        </span>
      </div>

      <div className="activity-options" aria-label="Choose an activity">
        {ACTIVITIES.map((item) => (
          <button
            key={item.id}
            type="button"
            className={activity === item.id ? "is-active" : ""}
            aria-pressed={activity === item.id}
            onClick={() => onActivityChange(item.id)}
          >
            <ActivityIcon type={item.icon} />
            {item.label}
          </button>
        ))}
      </div>

      <div className="planner-result">
        <div className="best-window">
          <span>Best window</span>
          <strong>{plan.window}</strong>
          <small>Based on the next 24 hours</small>
        </div>
        <div className="planner-reasons">
          <h3>Why this time</h3>
          <ul>{plan.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
        </div>
        <div className="planner-conditions">
          <h3>Expected conditions</h3>
          <div>
            <span><small>Feels like</small><strong>{convertTemperature(plan.conditions.feelsLike)}°{unit}</strong></span>
            <span><small>Rain chance</small><strong>{plan.conditions.rainChance}%</strong></span>
            <span><small>Wind</small><strong>{plan.conditions.wind} km/h</strong></span>
            <span><small>UV index</small><strong>{plan.conditions.uv}</strong></span>
          </div>
          {plan.conditions.gust > plan.conditions.wind + 8 && <p>Gusts may reach {plan.conditions.gust} km/h.</p>}
        </div>
      </div>
    </section>
  );
}

export default ActivityPlanner;
