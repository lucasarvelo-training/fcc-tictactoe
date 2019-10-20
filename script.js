document.addEventListener("DOMContentLoaded", function(event) {
  var modalOption = document.getElementById("modal-options");
  var playersOptionsBtn = document
    .getElementById("modal-options")
    .getElementsByTagName("button");
  var modalMarks = document.getElementById("modal-marks");
  var marksOptionsBtn = document
    .getElementById("modal-marks")
    .getElementsByTagName("button");
  var modalGameOver = document.getElementById("modal-winner");
  var winnerMsg = document.getElementById("winner-msg");
  var boardContainer = document.getElementById("container");
  var restartBtn = document.getElementById("btn-again");
  var resetBtn = document.getElementsByClassName("btn-reset");
  var cells = document.getElementsByClassName("cell");

  /*Initialize Game*/
  var gameInstance = new game();

  /*Add Event Listeners*/
  [].forEach.call(playersOptionsBtn, function(button) {
    button.addEventListener(
      "click",
      function() {
        gameInstance.setPlayersNumber(parseInt(button.value));
        toggleHide(modalOption);
        toggleHide(modalMarks);
      },
      false
    );
  });

  [].forEach.call(marksOptionsBtn, function(button) {
    button.addEventListener(
      "click",
      function() {
        gameInstance.setPlayersMarks(button.value);
        gameInstance.setTurn(randomize("x", "o"));
        showTurn(gameInstance);
        toggleHide(modalMarks);
        toggleHide(boardContainer);
        window.setTimeout(function() {
          if (gameInstance.isComputerTurn()) {
            computerMove(gameInstance, cells);
            gameInstance.updateTurn();
            showTurn(gameInstance);
          }
        }, 1500);
      },
      false
    );
  });

  [].forEach.call(cells, function(cell) {
    cell.addEventListener(
      "click",
      function() {
        var validCell = addMark(cell, gameInstance, cells);
        if (validCell) {
          gameInstance.updateCells(parseInt(cell.id));
          var moveResult = isGameOver(gameInstance.cells);
          if (moveResult !== false) {
            finishGame(gameInstance, modalGameOver, winnerMsg, boardContainer);
          } else {
            gameInstance.updateTurn();
            showTurn(gameInstance);
            window.setTimeout(function() {
              if (gameInstance.isComputerTurn()) {
                computerMove(gameInstance, cells);
                moveResult = isGameOver(gameInstance.cells);
                if (moveResult !== false) {
                  finishGame(
                    gameInstance,
                    modalGameOver,
                    winnerMsg,
                    boardContainer
                  );
                } else {
                  gameInstance.updateTurn();
                  showTurn(gameInstance);
                }
              }
            }, 1500);
          }
        } else {
          return null;
        }
      },
      false
    );
  });

  [].forEach.call(resetBtn, function(btn) {
    btn.addEventListener("click", function() {
      var elements = [modalMarks, boardContainer, modalGameOver];

      cleanBoard(cells);
      gameInstance = new game();

      elements.forEach(function(element) {
        if (!element.classList.contains("hide")) {
          toggleHide(element);
        }
      });

      if (modalOption.classList.contains("hide")) {
        toggleHide(modalOption);
      }
    });
  });

  restartBtn.addEventListener("click", function() {
    var elements = [modalMarks, modalGameOver];
    var firstTurnPlayer = randomize("o", "x");

    gameInstance.newGame(firstTurnPlayer);
    cleanBoard(cells);
    showTurn(gameInstance);

    elements.forEach(function(element) {
      if (!element.classList.contains("hide")) {
        toggleHide(element);
      }
    });

    if (boardContainer.classList.contains("hide")) {
      toggleHide(boardContainer);
    }

    window.setTimeout(function() {
      if (gameInstance.isComputerTurn()) {
        computerMove(gameInstance, cells);
        gameInstance.updateTurn();
        showTurn(gameInstance);
      }
    }, 1500);
  });
});

/*Game*/
function game() {
  this.cells = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  this.turn = "";
  this.playersNumber = 0;
  this.playerOneMark = "";
  this.playerTwoMark = "";
  this.gamesResult = [];

  this.setPlayersNumber = function(playersNumber) {
    this.playersNumber = playersNumber;
  };

  this.setPlayersMarks = function(playerOneMark) {
    this.playerOneMark = playerOneMark;
    if (playerOneMark === "x") {
      this.playerTwoMark = "o";
    } else {
      this.playerTwoMark = "x";
    }
  };

  this.isComputerTurn = function() {
    if (this.playerOneMark === this.turn || this.playersNumber === 2) {
      return false;
    } else {
      return true;
    }
  };

  this.setTurn = function(playerMark) {
    this.turn = playerMark;
  };

  this.updateTurn = function() {
    if (this.turn === "x") {
      this.turn = "o";
    } else {
      this.turn = "x";
    }
  };

  this.updateCells = function(cellIndex) {
    this.cells[cellIndex] = this.turn;
  };

  this.newGame = function(firstTurnPlayer) {
    this.cells = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    this.gamesResult = [];
    this.setTurn(firstTurnPlayer);
  };

  this.gameOver = function() {
    this.gamesResult.push(this.turn);
  };
}
/*Helpers*/
function toggleHide(element) {
  element.classList.toggle("hide");
}

function randomize(firstValue, secondValue) {
  var randomValue = Math.floor(Math.random() * 2 + 1);
  if (randomValue === 1) {
    return firstValue;
  } else {
    return secondValue;
  }
}

function isEmptyCell(cells) {
  return cells.some(function(cell) {
    if (cell === 0) {
      return true;
    }
  });
}

function cleanBoard(cells) {
  [].forEach.call(
    cells,
    function(cell) {
      if (cell.firstChild) {
        cell.removeChild(cell.firstChild);
      }
    },
    false
  );
}

function showTurn(game) {
  var element = document.getElementById("turn");

  if (game.turn === game.playerOneMark) {
    element.textContent = "Player One turn";
  } else if (game.turn === game.playerTwoMark && game.isComputerTurn()) {
    element.textContent = "Computer Turn";
  } else {
    element.textContent = "Player Two turn";
  }
}

function maxMove(posibleMoves) {
  return posibleMoves.reduce(
    (max, result) => (result.cost > max.cost ? result : max),
    posibleMoves[0]
  );
}

function minMove(posibleMoves) {
  return posibleMoves.reduce(
    (max, result) => (result.cost < max.cost ? result : max),
    posibleMoves[0]
  );
}

/*Game Helpers*/
function addMark(cell, game, cells) {
  var nodeI = document.createElement("i");
  var x = "fas fa-times";
  var o = "far fa-circle";
  if (cell.firstChild) {
    return null;
  } else {
    cell.appendChild(nodeI);
    game.updateCells(parseInt(cell.id));
    if (game.turn === "x") {
      cell.firstChild.className = x;
      return true;
    } else if (game.turn === "o") {
      cell.firstChild.className = o;
      return true;
    } else {
      return null;
    }
  }
}

function isGameOver(cells) {
  var winner = null;
  var isEmptyCells = isEmptyCell(cells);
  var winCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [6, 4, 2]
  ];
  var winner = winCombinations.find(function(winComb) {
    if (
      cells[winComb[0]] === cells[winComb[1]] &&
      cells[winComb[0]] === cells[winComb[2]] &&
      cells[winComb[0]] !== 0
    ) {
      return true;
    }
  });

  if (winner) {
    return cells[winner[0]];
  } else if (!isEmptyCells) {
    return null;
  } else {
    return false;
  }
}

function computerMove(game, cells) {
  var aiMove = moveAI(game);
  var aiCell = document.getElementById(String(aiMove));
  game.updateCells(aiMove);
  addMark(aiCell, game, cells);
}

function finishGame(game, modalGameOver, winnerMsg, boardContainer) {
  var moveResult = isGameOver(game.cells);
  switch (moveResult) {
    case null:
      winnerMsg.firstChild.textContent = "Game Tie, try again!!!";
      break;
    case "o":
    case "x":
      winnerMsg.firstChild.textContent = "The Winner is " + game.turn;
  }
  game.gameOver();
  window.setTimeout(function() {
    toggleHide(boardContainer);
    toggleHide(modalGameOver);
  }, 2500);
}

/*Ai*/
function moveAI(game) {
  return minmax(
    game.cells,
    0,
    game.playerTwoMark,
    game.playerOneMark,
    game.playerTwoMark
  );
}

function minmax(cells, depth, player, humanMark, iaMark) {
  var gameState = isGameOver(cells);
  var value = 0;
  var values = [];

  if (gameState === false) {
    cells.forEach(function(cell, index) {
      var nextCells = cells.slice();
      if (cell !== 0) return;
      nextCells[index] = player;
      value = minmax(
        nextCells,
        depth + 1,
        player === humanMark ? iaMark : humanMark,
        humanMark,
        iaMark
      );
      values.push({
        cost: value,
        cell: index
      });
    });

    if (player === iaMark) {
      var max = maxMove(values);
      if (depth === 0) {
        return max.cell;
      } else {
        return max.cost;
      }
    } else {
      var min = minMove(values);
      if (depth === 0) {
        return min.cell;
      } else {
        return min.cost;
      }
    }
  } else if (gameState === null) {
    return 0;
  } else if (gameState === iaMark) {
    return 10 - depth;
  } else if (gameState === humanMark) {
    return depth - 10;
  }
}

function startIA() {
  var gamea = new game();
  gamea.setPlayersNumber(1);
  gamea.setPlayersMarks("x");
  gamea.setTurn("o");
  gamea.cells = ["x", 0, 0, 0, 0, 0, 0, 0, 0];
  return gamea;
}
