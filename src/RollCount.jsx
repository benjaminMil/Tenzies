export default function RollCount(props) {
  return (
    <div className="score-board" role="status">
      <div>
        <p>Rolls</p>
        <p>{props.rolls}</p>
      </div>
      <div>
        <p className="time-value">
          {props.time}
          <span className="seconds">s</span>
        </p>
      </div>
      <div>
        <p>Best</p>
        <p>
          {props.bestScore && props.bestScore.time > 0
            ? `${props.bestScore.time.toFixed(1)}s (${props.bestScore.rolls})`
            : "N/A"}
        </p>
      </div>
    </div>
  );
}
