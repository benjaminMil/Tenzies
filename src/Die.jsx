export default function Die(props) {
  const styles = {
    backgroundColor: props.isHeld ? "#59E391" : "white",
    "--shake-intensity": `${Math.random() * 2 + 2}px`,
  };

  return (
    <button
      className={`die ${props.isRolling && !props.isHeld ? "shake" : ""}`}
      style={styles}
      onClick={props.hold}
      aria-pressed={props.isHeld}
      aria-label={`Die with ${props.value} ${
        props.value === 1 ? "dot" : "dots"
      }, ${props.isHeld ? "held" : "not held"}`}
    >
      <div
        className={`die-face die-face-${props.value} ${
          props.isFading && !props.isHeld ? "fade" : ""
        }`}
      >
        {[...Array(props.value)].map((_, index) => (
          <span key={index} className="dot" />
        ))}
      </div>
    </button>
  );
}
