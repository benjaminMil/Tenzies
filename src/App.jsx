import { useState, useRef, useEffect } from "react";
import Die from "./Die.jsx";
import { nanoid } from "nanoid";
import Confetti from "react-confetti";
import RollCount from "./RollCount.jsx";

export default function App() {
  const [dice, setDice] = useState(() => generateAllNewDice());
  const [isRolling, setIsRolling] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [isTiming, setIsTiming] = useState(false);
  const [time, setTime] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [rollCount, setRollCount] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    const storedScore = localStorage.getItem("bestScore");
    let parsedScore;
    try {
      parsedScore = storedScore
        ? JSON.parse(storedScore)
        : { time: 0, rolls: 0 };
      if (
        typeof parsedScore !== "object" ||
        parsedScore === null ||
        !("time" in parsedScore) ||
        !("rolls" in parsedScore)
      ) {
        return { time: 0, rolls: 0 };
      }
      return parsedScore;
    } catch (e) {
      return { time: 0, rolls: 0 };
    }
  });

  const buttonRef = useRef(null);

  const gameWon =
    dice.every((die) => die.isHeld) &&
    dice.every((die) => die.value === dice[0].value);

  useEffect(() => {
    let intervalId = null;
    if (isTiming) {
      intervalId = setInterval(() => {
        const newTime = ((Date.now() - startTime) / 1000).toFixed(1);
        setTime(parseFloat(newTime));
      }, 100);
    }
    return () => clearInterval(intervalId);
  }, [isTiming, startTime]);

  useEffect(() => {
    if (gameWon && isTiming) {
      const finalTime =
        parseFloat(time) || ((Date.now() - startTime) / 1000).toFixed(1);
      setGameTime(finalTime);
      setIsTiming(false);
      setBestScore((prev) => {
        const currentScore = { time: parseFloat(finalTime), rolls: rollCount };
        if (
          prev.time === 0 ||
          currentScore.time < prev.time ||
          (Math.abs(currentScore.time - prev.time) < 0.01 &&
            currentScore.rolls < prev.rolls)
        ) {
          localStorage.setItem("bestScore", JSON.stringify(currentScore));
          return currentScore;
        }
        return prev;
      });
      buttonRef.current.focus();
    }
  }, [gameWon, time, rollCount, isTiming, startTime]);

  function generateAllNewDice() {
    return new Array(10).fill(0).map(() => ({
      value: Math.ceil(Math.random() * 6),
      isHeld: false,
      id: nanoid(),
    }));
  }

  function rollDice() {
    if (gameWon) {
      setDice(generateAllNewDice());
      setIsRolling(false);
      setIsFading(false);
      setIsTiming(false);
      setTime(0);
      setGameTime(0);
      setStartTime(null);
      setRollCount(0);
      return;
    }
    if (!isTiming && rollCount === 0 && !dice.some((die) => die.isHeld)) {
      setIsTiming(true);
      setStartTime(Date.now());
    }
    setIsRolling(true);
    setRollCount((prev) => prev + 1);
    setTimeout(() => {
      setIsRolling(false);
      setIsFading(true);
      setDice((oldDice) =>
        oldDice.map((die) =>
          die.isHeld ? die : { ...die, value: Math.ceil(Math.random() * 6) }
        )
      );
      setTimeout(() => setIsFading(false), 300);
    }, 300);
  }

  function hold(id) {
    if (!isTiming && rollCount === 0 && !dice.some((die) => die.isHeld)) {
      setIsTiming(true);
      setStartTime(Date.now());
    }
    setDice((oldDice) =>
      oldDice.map((die) =>
        die.id === id ? { ...die, isHeld: !die.isHeld } : die
      )
    );
  }

  const diceElements = dice.map((dieObj) => (
    <Die
      key={dieObj.id}
      value={dieObj.value}
      isHeld={dieObj.isHeld}
      hold={() => hold(dieObj.id)}
      isRolling={isRolling}
      isFading={isFading}
    />
  ));

  return (
    <main>
      {gameWon && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
        />
      )}
      <div aria-live="polite" className="sr-only">
        {gameWon && (
          <p>
            Congratulations! You won in {gameTime}s with {rollCount} rolls.
            Press "New Game" to start again.
          </p>
        )}
      </div>
      <h1 className="title">Tenzies</h1>
      <p className="instructions">
        Roll until all dice are the same. Click die to freeze its current value
        between rolls.
      </p>
      <RollCount
        rolls={rollCount}
        time={time}
        gameTime={gameTime}
        bestScore={bestScore}
      />
      <div className="dice-container">{diceElements}</div>
      <button ref={buttonRef} className="roll-dice" onClick={rollDice}>
        {gameWon ? "New Game" : "Roll"}
      </button>
    </main>
  );
}
