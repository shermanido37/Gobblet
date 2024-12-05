//  Board:
//  Variable to access the entirety of the board.
//  Treated as a 2d array, all elements are Stacks.
let gameBoard;
let playerBoards;
const boardRows = 4;
const boardColumns = 4;

//  Player pieces:
//  Variable to access all player pieces not yet placed on the board.
//  It is an array, with each element of an array representing a player.
//  Each element contains an array of game pieces.
let playerPieces;

const NumOfPlayers = 2;
const playerColumns = 3;
const playerRows = 4;
const WHITE = 100;
const BLACK = 101;
const FAILURE = -1; //  signifies error or failure

//  turn indicator variable. If true, it's player 1's turn.
let isPlayer1;

//  selected element variable. holds the already selected player piece, if any
let alreadySelectedCell;

//  here we save the winning state
let isGameOver;

//  function to initialize page
function initializePage() {
  /*Setting cells with click functions (cells themselves don't change between game runs) */
  for (let i = 0; i < boardColumns * boardRows; i++) {
    document
      .getElementById("cell-" + (i + 1))
      .addEventListener("click", trySelect);
  }

  for (let playerIndex = 0; playerIndex < NumOfPlayers; playerIndex++) {
    for (let i = 0; i < playerColumns; i++) {
      for (let j = 0; j < playerRows; j++) {
        const elemName =
          "p" + (playerIndex + 1) + "-cell-" + (1 + i + j * playerColumns);
        document.getElementById(elemName).addEventListener("click", trySelect);
      }
    }
  }

  initializeGame();
}

//  function to initialize a new game
function initializeGame() {
  //    initialize variables
  isPlayer1 = true;
  alreadySelectedCell = null;
  isGameOver = false;

  //    initialize game board
  gameBoard = new Board(boardColumns, boardRows, true, FAILURE);

  //    initialize player sections
  playerBoards = [
    new Board(playerColumns, playerRows, false, WHITE),
    new Board(playerColumns, playerRows, false, BLACK),
  ];
  for (let playerIndex = 0; playerIndex < NumOfPlayers; playerIndex++) {
    //  loop resetting pieces for each player
    for (let i = 0; i < playerRows; i++) {
      for (let j = 0; j < playerColumns; j++) {
        const pieceElem = document.createElement("div");
        pieceElem.setAttribute(
          "id",
          "piece" +
            (j + i * playerColumns + playerIndex * playerColumns * playerRows)
        );
        pieceElem.classList.add("piece"); //  adding first cosmetic class to apply piece appearance
        //  saving owning player for each game piece
        pieceElem.classList.add("player" + (playerIndex + WHITE)); //  adding a cosmetic class to the piece classifying it as the current player's. WHITE is the beginning of the player index
        //  controlling game piece size
        pieceElem.classList.add("size" + (playerRows - (i + 1))); //  adding a cosmetic class to the piece classifying it as the size, according to column
        pieceElem.style.zIndex = playerRows - (i + 1); //  higher size means higher display priority. we will also use this for size comparisons

        //  adding the new element to the appropriate cell for the appropriate player
        const cellName =
          "p" + (playerIndex + 1) + "-cell-" + (i * playerColumns + j + 1);
        const elem = document.getElementById(cellName);
        elem.appendChild(pieceElem);
        pieceElem.parentElement = elem;
      }
    }
  }
}

function trySelect(event) {
  //  if game is over, don't select
  if (isGameOver) return;
  let tempCell = event.target;
  if (tempCell.classList.contains("piece")) {
    tempCell = tempCell.parentElement;
  }

  const activePlayer = isPlayer1 ? WHITE : BLACK; //  the player currently playing
  const targetCell = tempCell; //  the cell the player just selected
  const targetPiece = targetCell.lastElementChild; //  biggest piece in the cell
  //    first, if no existing selection
  if (alreadySelectedCell === null) {
    //  if tried to select their piece, just select it
    if (
      targetPiece != null &&
      targetPiece.classList.contains("player" + activePlayer)
    ) {
      selectCell(targetCell);
    } else {
      //  here, no existing selection, but tried to select opponent's or no piece. quit execution
      console.log("you dun goofed");
    }
  } else {
    //  here, we know we have an existing selection, and we're selecting a target.

    //  if it's the same one again, just reset selection
    if (alreadySelectedCell.id === targetCell.id) {
      resetSelection(targetCell);
      return;
    }

    //  if selecting something not on the game board with an existing, non-same selection, do nothing and quit execution
    if (targetCell.parentElement.id != "game-board") {
      console.log("selected something wrong");
      return;
    }

    //  now we know thing was selected on the game board
    //  get coordinates of the selected piece on the board
    const targetCellID = parseInt(targetCell.id.substr(5));
    const targetCoordinates = cellIdToXY(FAILURE, targetCellID);

    //  get more data about the piece that's already selected
    const selectedPieceElem = alreadySelectedCell.lastElementChild;
    const selectedPieceID = parseInt(selectedPieceElem.id.substr(5));
    const selectedPieceBoard = alreadySelectedCell.parentElement;

    let selectedPieceXY;
    let selectedPieceSource;

    if (selectedPieceBoard.id === "game-board") {
      selectedPieceXY = pieceIdToXY(FAILURE, selectedPieceID);
      selectedPieceSource = gameBoard;
    } else {
      selectedPieceXY = pieceIdToXY(getActivePlayer(), selectedPieceID);
      selectedPieceSource = playerBoards[getActivePlayer() - WHITE];
    }

    const selectedPieceLogic =
      selectedPieceSource.board[selectedPieceXY[0]][selectedPieceXY[1]].peek();

    //  check if legal move
    const isLegal = gameBoard.isLegalMove(
      selectedPieceLogic,
      targetCoordinates
    );

    /*if the move is legal, begin moving process*/
    if (isLegal) {
      /*moving the piece*/
      movePiece(selectedPieceSource, selectedPieceXY, targetCoordinates);

      /*update interface*/
      alreadySelectedCell.removeChild(selectedPieceElem);
      targetCell.appendChild(selectedPieceElem);
      resetSelection(targetCell);

      /*check victory conditions*/
      const winner = isVictory();
      console.log(winner);
      if (winner === null) throw Exception("invalid winner result");
      if (winner != null && winner.length > 0) {
        /*game is over*/
        isGameOver = true;
        let winningPlayer = winner[0][2];

        /*checking for draw*/
        for (let i = 1; i < winner.length; i++) {
          if (winner[i] != winningPlayer) {
            winningPlayer = FAILURE;
            break;
          }
        }

        //  update game graphics on winner or draw
        let winningMessage;
        if (winningPlayer === FAILURE) winningMessage = "The game is a draw.";
        else
          winningMessage =
            "Player " + (winningPlayer - WHITE + 1) + " is the winner!";
        alert(winningMessage);
        displayVictory(winner);
        return;
      }

      //  there are no winners. game can resume.
      //  switch turns
      isPlayer1 = !isPlayer1;
      const turnIndicator = document.getElementById("turn-indicator");
      turnIndicator.classList.toggle("player1turn");
      turnIndicator.classList.toggle("player2turn");
    }
  }
}

/* select the given piece and display it as such. */
function selectCell(cell) {
  if (alreadySelectedCell != null && alreadySelectedCell === cell) {
    resetSelection(cell);
    return;
  }

  const pieceToSelect = cell.lastElementChild;
  pieceToSelect.classList.toggle("selected");
  alreadySelectedCell = cell;
  if (!alreadySelectedCell) return;

  const pieceID = parseInt(pieceToSelect.id.substr(5));
}

/* reset the currently selected cell's tag, then set the currently selected cell to null */
function resetSelection(cell) {
  console.log("resetting");
  if (cell === null || cell.childElementCount <= 0) return;
  const piece = cell.lastElementChild;
  piece.classList.toggle("selected");
  alreadySelectedCell = null;
}

/*function for moving a piece between cells*/
function movePiece(selectedPieceSource, selectedPieceXY, targetCoordinates) {
  /*if both pieces are on the game board, simply move within the board*/
  if (selectedPieceSource.id === "game-board") {
    gameBoard.move(selectedPieceXY, targetCoordinates);
  } else {
    /*otherwise, withdraw from player board to the game board*/
    const gamePieceToMove = selectedPieceSource.withdraw(
      selectedPieceXY[0],
      selectedPieceXY[1]
    );
    gameBoard.moveNew(
      targetCoordinates[0],
      targetCoordinates[1],
      gamePieceToMove
    );
  }
}

/*check the conditions in which the game ends.*/
/*if a player won, returns true. else returns false.*/
function isVictory() {
  let winners = [];
  for (let i = 0; i < boardColumns; i++) {
    const isRowWinner = gameBoard.checkVictoryRow(i);
    if (isRowWinner != FAILURE)
      winners[winners.length] = ["column", i, isRowWinner];
    const isColumnWinner = gameBoard.checkVictoryColumn(i);
    if (isColumnWinner != FAILURE)
      winners[winners.length] = ["row", i, isColumnWinner];
  }
  const isDiagonal1Winner = gameBoard.checkDiagonal1();
  if (isDiagonal1Winner != FAILURE)
    winners[winners.length] = ["diagonal", 1, isDiagonal1Winner];
  const isDiagonal2Winner = gameBoard.checkDiagonal2();
  if (isDiagonal2Winner != FAILURE)
    winners[winners.length] = ["diagonal", 2, isDiagonal2Winner];
  return winners;
}

//  display victory
function displayVictory(winner) {
  //  highlight all winning moves
  for (let i = 0; i < winner.length; i++) {
    if (winner[i][0] === "row") {
      for (let j = 0; j < boardColumns; j++) {
        const cellName = "cell-" + (winner[i][1] * boardRows + j + 1);
        const cell = document.getElementById(cellName);
        cell.lastElementChild.classList.add("winning");
      }
    } else if (winner[i][0] === "column") {
      for (let j = 0; j < boardRows; j++) {
        const cellName = "cell-" + (winner[i][1] * boardRows + i + 1);
        const cell = document.getElementById(cellName);
        cell.lastElementChild.classList.add("winning");
      }
    }
  }

  let toggleElem;
  //  if the game is a draw
  if (winner.length > 1) {
    //  enable draw graphic element
    toggleElem = document.getElementById("player");
    toggleElem.classList.toggle("disabled");
    toggleElem = document.getElementById("draw");
  } else {
    //  if the winning player didn't win on their turn, switch graphic indicator
    if (
      (isPlayer1 && winner[0][2] != WHITE) ||
      (!isPlayer1 && winner[0][2] != BLACK)
    ) {
      const playerNameDisplay = document.getElementById("turn-indicator");
      playerNameDisplay.classList.toggle("player1turn");
      playerNameDisplay.classList.toggle("player2turn");
    }
    //  enable winner graphic element

    toggleElem = document.getElementById("winner");
  }
  toggleElem.classList.toggle("disabled");

  const turnIndicator = document.getElementById("turn");
  turnIndicator.classList.toggle("disabled");

  const GameOverElem = document.getElementById("gameOver");
  GameOverElem.classList.toggle("disabled");
}

//  return an array with the coordinates of the piece on the given board, according to its id
function pieceIdToXY(boardOwner, id) {
  console.log("searching " + boardOwner + " for " + id);
  let boardToSearch;
  switch (boardOwner) {
    case WHITE:
      boardToSearch = playerBoards[0];
      break;
    case BLACK:
      boardToSearch = playerBoards[1];
      break;
    case FAILURE:
    default:
      boardToSearch = gameBoard;
  }
  return boardToSearch.getCoordinates(id);
}

//  return an array with the coordinates of the cell on the given board, according to its id
function cellIdToXY(boardOwner, id) {
  const fixedID = id - 1;
  if (boardOwner === FAILURE)
    return [Math.floor(fixedID / boardColumns), fixedID % boardRows]; //  if cell is on game board and not a player's board
  return [Math.floor(fixedID / playerColumns), fixedID % playerColumns];
}

function getActivePlayer() {
  return isPlayer1 ? WHITE : BLACK;
}
