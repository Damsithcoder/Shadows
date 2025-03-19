import React, { useRef, useEffect, useState } from 'react';
import './App.css';

function App() {
  const canvasRef = useRef(null);
  // Replace cars state with a ref
  const carsRef = useRef([]); // <-- changed
  const roadWidth = 400;
  const laneWidth = roadWidth / 2;
  const roadX = 200;
  const carWidth = 30;
  const carHeight = 50;

  const [personX, setPersonX] = useState(roadX);
  const personXRef = useRef(personX); // add new ref
  const personWidth = 20;
  const personHeight = 40;
  const personY = 500;
  const personSpeed = 10;

  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0); // new score state

  useEffect(() => {
    personXRef.current = personX; // sync personXRef with personX
  }, [personX]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    let animationFrameId;
    let carInterval;
    let lastLane = 0; // add this above createCar

    const createCar = () => {
      lastLane = 1 - lastLane; // alternate lanes to remove randomness
      const lane = lastLane;
      const x = carWidth + laneWidth/ Math.floor(Math.random()*9) + lane * laneWidth / 2;
      const y = -carHeight;
      const speed = Math.random() * 2 + 1;
      return { x, y, speed, lane, scored: false }; // add scored flag
    };

    const addNewCar = () => {
      // push new car into the ref array
      carsRef.current.push(createCar());
    };

    const checkCollision = () => {
      for (let car of carsRef.current) {
        if (
          personXRef.current < car.x + carWidth &&
          personXRef.current + personWidth > car.x &&
          personY < car.y + carHeight &&
          personY + personHeight > car.y
        ) {
          // Prevent collision when edges exactly touch
          if (!(personY === car.y + carHeight)) {
            setGameOver(true);
            return;
          }
        }
      }
    };

    const draw = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Draw road
      context.fillStyle = 'gray';
      context.fillRect(roadX - laneWidth, 0, roadWidth, canvas.height);

      // Draw lane divider
      context.strokeStyle = 'white';
      context.lineWidth = 5;
      context.beginPath();
      context.moveTo(roadX, 0);
      context.lineTo(roadX, canvas.height);
      context.stroke();

      // Draw cars using carsRef
      carsRef.current.forEach(car => {
        context.fillStyle = 'blue';
        context.fillRect(car.x, car.y, carWidth, carHeight);
      });

      // Draw person using the latest position from personXRef
      context.fillStyle = 'green';
      context.fillRect(personXRef.current, personY, personWidth, personHeight);

      // Update car positions directly on the ref and update score if a car passes personY
      carsRef.current = carsRef.current.map(car => {
        const newY = car.y + car.speed;
        // If the car passes from above personY to below and hasn't been scored yet
        if (!car.scored && car.y < personY && newY >= personY) {
          setScore(prev => prev + 5);
          return { ...car, y: newY, scored: true };
        }
        return { ...car, y: newY };
      }).filter(car => car.y < canvas.height);

      checkCollision();

      if (!gameOver) {
        animationFrameId = requestAnimationFrame(draw);
      }
    };

    if (!gameOver) {
      carInterval = setInterval(addNewCar, 1000); // decreased interval to reduce gaps
      draw();
    }

    return () => {
      clearInterval(carInterval);
      cancelAnimationFrame(animationFrameId);
    };
  }, [roadX, laneWidth, carWidth, carHeight, personWidth, personHeight, personY, gameOver]);

  const handleKeyDown = (event) => {
    if (gameOver) return;

    if (event.key === 'ArrowLeft') {
      setPersonX(prevX => Math.max(prevX - personSpeed, roadX - laneWidth));
    } else if (event.key === 'ArrowRight') {
      setPersonX(prevX => Math.min(prevX + personSpeed, roadX + laneWidth - personWidth));
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const restartGame = () => {
    carsRef.current = [];  // <-- changed
    setPersonX(roadX);
    setScore(0); // reset score on restart
    setGameOver(false);
  };

  return (
    <div className="App" tabIndex="0" onKeyDown={handleKeyDown}>
      <canvas ref={canvasRef} width={roadWidth} height={600} />
      {/* Scorecard */}
      <div className="scoreCard">Score: {score}</div>
      {gameOver && (
        <div className="gameOver">
          <h1>Game Over!</h1>
          <button onClick={restartGame}>Restart</button>
        </div>
      )}
    </div>
  );
}

export default App;