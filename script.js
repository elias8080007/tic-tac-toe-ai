"use strict";

/*
  All possible winning lines.
*/
const winningCombinations = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],

  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],

  [0, 4, 8],
  [2, 4, 6]
];

/*
  The AI evaluates the center first,
  then corners, then side positions.
*/
const preferredMoveOrder = [
  4,
  0,
  2,
  6,
  8,
  1,
  3,
  5,
  7
];

/*
  Get HTML elements.
*/
const cells = Array.from(
  document.querySelectorAll(".cell")
);

const statusText =
  document.getElementById("status");

const difficultySelect =
  document.getElementById("difficulty-select");

const symbolSelect =
  document.getElementById("symbol-select");

const difficultyDescription =
  document.getElementById(
    "difficulty-description"
  );

const symbolDescription =
  document.getElementById(
    "symbol-description"
  );

const newGameButton =
  document.getElementById("new-game-button");

const resetStatisticsButton =
  document.getElementById(
    "reset-statistics-button"
  );

const humanSymbolText =
  document.getElementById("human-symbol");

const aiSymbolText =
  document.getElementById("ai-symbol");

const aiExplanationText =
  document.getElementById("ai-explanation");

const algorithmUsedText =
  document.getElementById("algorithm-used");

const minimaxScoreText =
  document.getElementById("minimax-score");

const statesEvaluatedText =
  document.getElementById("states-evaluated");

const decisionTimeText =
  document.getElementById("decision-time");

const humanWinsText =
  document.getElementById("human-wins");

const aiWinsText =
  document.getElementById("ai-wins");

const drawsText =
  document.getElementById("draws");

const moveHistoryList =
  document.getElementById("move-history");

/*
  Game variables.
*/
let board = Array(9).fill("");

let humanPlayer = "X";

let aiPlayer = "O";

let currentTurn = "X";

let difficulty = "hard";

let gameActive = true;

let aiThinking = false;

let aiTimeoutId = null;

let evaluatedStates = 0;

let moveCounter = 0;

/*
  Load saved statistics from the browser.
*/
let statistics = loadStatistics();

/*
  Add event listeners.
*/
cells.forEach((cell) => {
  cell.addEventListener(
    "click",
    handleHumanMove
  );
});

newGameButton.addEventListener(
  "click",
  startNewGame
);
difficultySelect.addEventListener(
  "change",
  () => {
    difficulty =
      difficultySelect.value;

    updateDifficultyPresentation();
  }
);

symbolSelect.addEventListener(
  "change",
  () => {
   
    startNewGame();
  }
);

resetStatisticsButton.addEventListener(
  "click",
  resetStatistics
);
function updateDifficultyPresentation() {
  const selectedDifficulty =
    difficultySelect.value;

  difficultySelect.classList.remove(
    "difficulty-easy",
    "difficulty-medium",
    "difficulty-hard"
  );

  difficultySelect.classList.add(
    `difficulty-${selectedDifficulty}`
  );

  const descriptions = {
    easy:
      "Casual play with random AI decisions.",

    medium:
      "Balanced play combining strategy and chance.",

    hard:
      "Optimal AI using Minimax and alpha-beta pruning."
  };

  difficultyDescription.textContent =
    descriptions[selectedDifficulty];
}
function updateSymbolPresentation() {
  humanPlayer =
    symbolSelect.value;

  aiPlayer =
    humanPlayer === "X"
      ? "O"
      : "X";

  humanSymbolText.textContent =
    humanPlayer;

  aiSymbolText.textContent =
    aiPlayer;

  /*
    Update the colors of the marker
    inside each player card.
  */
  humanSymbolText.className =
    `marker marker-${humanPlayer.toLowerCase()}`;

  aiSymbolText.className =
    `marker marker-${aiPlayer.toLowerCase()}`;

  /*
    Update the color of the marker selector.
  */
  symbolSelect.classList.remove(
    "symbol-x",
    "symbol-o"
  );

  symbolSelect.classList.add(
    `symbol-${humanPlayer.toLowerCase()}`
  );

  /*
    Display a professional description
    beneath the marker selector.
  */
  if (humanPlayer === "X") {
    symbolDescription.textContent =
      "You make the opening move.";
  } else {
    symbolDescription.textContent =
      "The AI makes the opening move.";
  }
}

/*
  Start or restart the game.
*/
function startNewGame() {
  /*
    Cancel a waiting AI move.
  */
  if (aiTimeoutId !== null) {
    clearTimeout(aiTimeoutId);
    aiTimeoutId = null;
  }

  /*
    Read settings selected by the user.
  */
  difficulty =
  difficultySelect.value;

updateDifficultyPresentation();

updateSymbolPresentation();

  /*
    Reset game data.
  */
  board = Array(9).fill("");

  currentTurn = "X";

  gameActive = true;

  aiThinking = false;

  moveCounter = 0;

  /*
    Clear board display.
  */
  cells.forEach((cell) => {
    cell.textContent = "";

    cell.classList.remove(
      "x",
      "o",
      "winner"
    );
  });

  /*
    Update player labels.
  */


  /*
    Clear AI information.
  */
  aiExplanationText.textContent =
    "The AI explanation will appear after its first move.";

  algorithmUsedText.textContent = "—";

  minimaxScoreText.textContent = "—";

  statesEvaluatedText.textContent = "0";

  decisionTimeText.textContent = "0 ms";

  /*
    Clear move history.
  */
 moveHistoryList.innerHTML = `
  <li class="empty-log">
    Your moves and the AI decisions
    will appear here.
  </li>
`;

  /*
    X always plays first.
  */
  if (aiPlayer === "X") {
    statusText.textContent =
      "The AI will play first.";

    scheduleAIMove();
  } else {
    statusText.textContent =
      "Your turn";
  }
}

/*
  Handle the human clicking a cell.
*/
function handleHumanMove(event) {
  const selectedCell =
    event.currentTarget;

  const selectedIndex =
    Number(selectedCell.dataset.index);

  /*
    Prevent invalid moves.
  */
  if (
    !gameActive ||
    aiThinking ||
    currentTurn !== humanPlayer ||
    board[selectedIndex] !== ""
  ) {
    return;
  }

  /*
    Apply human move.
  */
  makeMove(
    selectedIndex,
    humanPlayer
  );

function recordMove(player, index) {
  if (moveCounter === 0) {
    moveHistoryList.innerHTML = "";
  }

  moveCounter++;

  const row =
    Math.floor(index / 3) + 1;

  const column =
    (index % 3) + 1;

  const isHumanMove =
    player === humanPlayer;

  const playerName =
    isHumanMove
      ? "You"
      : "AI Opponent";

  const historyItem =
    document.createElement("li");

  historyItem.className =
    isHumanMove
      ? "move-item human-move"
      : "move-item ai-move";

  historyItem.innerHTML = `
    <span class="move-number">
      ${moveCounter}
    </span>

    <span class="move-player">
      <span class="move-player-name">
        ${playerName}
      </span>

      <span
        class="
          move-symbol
          marker-${player.toLowerCase()}
        "
      >
        ${player}
      </span>
    </span>

    <span class="move-position">
      Row ${row} · Column ${column}
    </span>
  `;

  moveHistoryList.appendChild(
    historyItem
  );

  moveHistoryList.scrollTop =
    moveHistoryList.scrollHeight;
}

  /*
    Check whether the human ended the game.
  */
  const result =
    getGameResult(board);

  if (finishGame(result)) {
    return;
  }

  /*
    Switch to AI.
  */
  currentTurn = aiPlayer;

  scheduleAIMove();
}

/*
  Wait briefly before allowing the AI to play.
*/
function scheduleAIMove() {
  if (
    !gameActive ||
    currentTurn !== aiPlayer
  ) {
    return;
  }

  aiThinking = true;

  statusText.textContent =
    "AI is thinking...";

  aiTimeoutId = setTimeout(() => {
    performAIMove();
  }, 450);
}

/*
  Calculate and perform the AI move.
*/
function performAIMove() {
  if (!gameActive) {
    return;
  }

  /*
    Save a copy of the board before the AI move.
    It will be used to explain the decision.
  */
  const boardBeforeMove = [...board];

  evaluatedStates = 0;

  const startTime =
    performance.now();

  /*
    Choose a move depending on difficulty.
  */
  const decision =
    chooseAIMove(board);

  const endTime =
    performance.now();

  const decisionTime =
    endTime - startTime;

  if (decision.move === -1) {
    aiThinking = false;
    return;
  }

  /*
    Generate an explanation before modifying
    the real board.
  */
  const explanation =
    explainAIMove(
      boardBeforeMove,
      decision.move,
      decision
    );

  /*
    Apply real AI move.
  */
  makeMove(
    decision.move,
    aiPlayer
  );

  recordMove(
    aiPlayer,
    decision.move
  );

  /*
    Show AI analysis.
  */
  aiExplanationText.textContent =
    explanation;

  algorithmUsedText.textContent =
    decision.algorithm;

  minimaxScoreText.textContent =
    decision.score === null
      ? "Not calculated"
      : decision.score;

  statesEvaluatedText.textContent =
    decision.algorithm === "Random move"
      ? "0"
      : evaluatedStates;

  decisionTimeText.textContent =
    `${decisionTime.toFixed(3)} ms`;

  /*
    Check whether AI ended the game.
  */
  const result =
    getGameResult(board);

  aiThinking = false;

  if (finishGame(result)) {
    return;
  }

  /*
    Return control to human.
  */
  currentTurn = humanPlayer;

  statusText.textContent =
    "Your turn";
}

/*
  Difficulty system.
*/
function chooseAIMove(currentBoard) {
  /*
    Easy difficulty:
    the AI chooses randomly.
  */
  if (difficulty === "easy") {
    return {
      move: getRandomMove(currentBoard),
      score: null,
      algorithm: "Random move"
    };
  }

  /*
    Medium difficulty:
    65% chance of using Minimax,
    35% chance of choosing randomly.
  */
  if (difficulty === "medium") {
    const useMinimax =
      Math.random() < 0.65;

    if (!useMinimax) {
      return {
        move: getRandomMove(currentBoard),
        score: null,
        algorithm: "Random move"
      };
    }

    const decision =
      findBestMove(currentBoard);

    return {
      ...decision,
      algorithm: "Minimax + alpha-beta"
    };
  }

  /*
    Hard difficulty:
    always use optimized Minimax.
  */
  const decision =
    findBestMove(currentBoard);

  return {
    ...decision,
    algorithm: "Minimax + alpha-beta"
  };
}

/*
  Choose a random empty position.
*/
function getRandomMove(currentBoard) {
  const emptyPositions = [];

  for (
    let index = 0;
    index < currentBoard.length;
    index++
  ) {
    if (currentBoard[index] === "") {
      emptyPositions.push(index);
    }
  }

  if (emptyPositions.length === 0) {
    return -1;
  }

  const randomIndex =
    Math.floor(
      Math.random() *
      emptyPositions.length
    );

  return emptyPositions[randomIndex];
}

/*
  Find the strongest AI move.
*/
function findBestMove(currentBoard) {
  let bestScore = -Infinity;

  let bestMove = -1;

  /*
    Test every available move.
  */
  for (
    const index of preferredMoveOrder
  ) {
    if (currentBoard[index] === "") {
      /*
        Temporarily place the AI move.
      */
      currentBoard[index] =
        aiPlayer;

      /*
        Evaluate future game states.
      */
      const score = minimax(
        currentBoard,
        0,
        false,
        -Infinity,
        Infinity
      );

      /*
        Undo the temporary move.
        This is backtracking.
      */
      currentBoard[index] = "";

      /*
        Keep the highest-scoring move.
      */
      if (score > bestScore) {
        bestScore = score;
        bestMove = index;
      }
    }
  }

  return {
    move: bestMove,
    score: bestScore
  };
}

/*
  Minimax with alpha-beta pruning.
*/
function minimax(
  currentBoard,
  depth,
  isMaximizing,
  alpha,
  beta
) {
  /*
    Count the number of board states
    explored by the AI.
  */
  evaluatedStates++;

  const result =
    getGameResult(currentBoard);

  /*
    Terminal game states.
  */
  if (result.winner === aiPlayer) {
    return 10 - depth;
  }

  if (
    result.winner === humanPlayer
  ) {
    return depth - 10;
  }

  if (result.draw) {
    return 0;
  }

  /*
    AI simulated turn:
    maximize the score.
  */
  if (isMaximizing) {
    let bestScore = -Infinity;

    for (
      const index of preferredMoveOrder
    ) {
      if (
        currentBoard[index] === ""
      ) {
        currentBoard[index] =
          aiPlayer;

        const score = minimax(
          currentBoard,
          depth + 1,
          false,
          alpha,
          beta
        );

        currentBoard[index] = "";

        bestScore = Math.max(
          bestScore,
          score
        );

        /*
          Alpha is the best score the AI
          can guarantee so far.
        */
        alpha = Math.max(
          alpha,
          bestScore
        );

        /*
          Stop exploring this branch
          when it cannot improve the result.
        */
        if (beta <= alpha) {
          break;
        }
      }
    }

    return bestScore;
  }

  /*
    Human simulated turn:
    minimize the AI's score.
  */
  let bestScore = Infinity;

  for (
    const index of preferredMoveOrder
  ) {
    if (
      currentBoard[index] === ""
    ) {
      currentBoard[index] =
        humanPlayer;

      const score = minimax(
        currentBoard,
        depth + 1,
        true,
        alpha,
        beta
      );

      currentBoard[index] = "";

      bestScore = Math.min(
        bestScore,
        score
      );

      /*
        Beta is the lowest score the
        human can force so far.
      */
      beta = Math.min(
        beta,
        bestScore
      );

      if (beta <= alpha) {
        break;
      }
    }
  }

  return bestScore;
}

/*
  Explain why the AI selected a move.
*/
function explainAIMove(
  boardBeforeMove,
  move,
  decision
) {
  /*
    Check whether this move wins immediately.
  */
  if (
    wouldPlayerWin(
      boardBeforeMove,
      move,
      aiPlayer
    )
  ) {
    return (
      `The AI selected position ${move + 1} ` +
      "because it completes a winning line."
    );
  }

  /*
    Check whether this move blocks the human.
  */
  if (
    wouldPlayerWin(
      boardBeforeMove,
      move,
      humanPlayer
    )
  ) {
    return (
      `The AI selected position ${move + 1} ` +
      "to block your immediate winning move."
    );
  }

  /*
    Explain a random decision.
  */
  if (
    decision.algorithm ===
    "Random move"
  ) {
    return (
      `The AI selected position ${move + 1} ` +
      "randomly because the current difficulty " +
      "does not always use Minimax."
    );
  }

  /*
    Explain strategic position choices.
  */
  if (move === 4) {
    return (
      "The AI selected the center because it " +
      "participates in four possible winning lines. " +
      `Minimax assigned this move a score of ${decision.score}.`
    );
  }

  if (
    [0, 2, 6, 8].includes(move)
  ) {
    return (
      `The AI selected corner position ${move + 1}. ` +
      "Corners can contribute to multiple winning " +
      "lines and fork opportunities. " +
      `Its Minimax score was ${decision.score}.`
    );
  }

  return (
    `The AI selected side position ${move + 1} ` +
    "after evaluating future human and AI moves. " +
    `Its Minimax score was ${decision.score}.`
  );
}

/*
  Test whether a player would win by
  selecting a particular position.
*/
function wouldPlayerWin(
  currentBoard,
  move,
  player
) {
  if (currentBoard[move] !== "") {
    return false;
  }

  const simulatedBoard =
    [...currentBoard];

  simulatedBoard[move] = player;

  return (
    getGameResult(simulatedBoard)
      .winner === player
  );
}

/*
  Place a real move on the board.
*/
function makeMove(index, player) {
  board[index] = player;

  cells[index].textContent =
    player;

  cells[index].classList.add(
    player.toLowerCase()
  );
}

/*
  Check for a winner or draw.
*/
function getGameResult(
  currentBoard
) {
  for (
    const combination of
    winningCombinations
  ) {
    const [a, b, c] =
      combination;

    if (
      currentBoard[a] !== "" &&
      currentBoard[a] ===
        currentBoard[b] &&
      currentBoard[a] ===
        currentBoard[c]
    ) {
      return {
        winner: currentBoard[a],
        winningCombination:
          combination,
        draw: false
      };
    }
  }

  const boardIsFull =
    currentBoard.every(
      (cell) => cell !== ""
    );

  if (boardIsFull) {
    return {
      winner: null,
      winningCombination: null,
      draw: true
    };
  }

  return {
    winner: null,
    winningCombination: null,
    draw: false
  };
}

/*
  Finish the game when someone wins
  or when the result is a draw.
*/
function finishGame(result) {
  if (
    result.winner === null &&
    !result.draw
  ) {
    return false;
  }

  gameActive = false;

  aiThinking = false;

  if (result.winner !== null) {
    highlightWinningCells(
      result.winningCombination
    );

    if (
      result.winner === humanPlayer
    ) {
      statusText.textContent =
        "You won!";

      statistics.humanWins++;
    } else {
      statusText.textContent =
        "The AI won!";

      statistics.aiWins++;
    }
  } else {
    statusText.textContent =
      "The game ended in a draw.";

    statistics.draws++;
  }

  saveStatistics();

  updateStatisticsDisplay();

  return true;
}

/*
  Highlight the winning line.
*/
function highlightWinningCells(
  winningCombination
) {
  winningCombination.forEach(
    (index) => {
      cells[index].classList.add(
        "winner"
      );
    }
  );
}

/*
  Add a move to the move-history panel.
*/
function recordMove(player, index) {
  if (moveCounter === 0) {
    moveHistoryList.innerHTML = "";
  }

  moveCounter++;

  const row =
    Math.floor(index / 3) + 1;

  const column =
    (index % 3) + 1;

  const playerName =
    player === humanPlayer
      ? "You"
      : "AI";

  const historyItem =
    document.createElement("li");

  historyItem.textContent =
    `${playerName} (${player}) → ` +
    `row ${row}, column ${column}`;

  moveHistoryList.appendChild(
    historyItem
  );

  moveHistoryList.scrollTop =
    moveHistoryList.scrollHeight;
}

/*
  Load statistics from localStorage.
*/
function loadStatistics() {
  try {
    const savedStatistics =
      localStorage.getItem(
        "ticTacToeStatistics"
      );

    if (savedStatistics) {
      return JSON.parse(
        savedStatistics
      );
    }
  } catch (error) {
    console.error(
      "Could not load statistics:",
      error
    );
  }

  return {
    humanWins: 0,
    aiWins: 0,
    draws: 0
  };
}

/*
  Save statistics in the browser.
*/
function saveStatistics() {
  try {
    localStorage.setItem(
      "ticTacToeStatistics",
      JSON.stringify(statistics)
    );
  } catch (error) {
    console.error(
      "Could not save statistics:",
      error
    );
  }
}

/*
  Display statistics.
*/
function updateStatisticsDisplay() {
  humanWinsText.textContent =
    statistics.humanWins;

  aiWinsText.textContent =
    statistics.aiWins;

  drawsText.textContent =
    statistics.draws;
}

/*
  Reset all stored statistics.
*/
function resetStatistics() {
  statistics = {
    humanWins: 0,
    aiWins: 0,
    draws: 0
  };

  saveStatistics();

  updateStatisticsDisplay();
}

/*
  Initialize the application.
*/
updateStatisticsDisplay();

startNewGame();