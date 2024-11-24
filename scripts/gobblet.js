//  Board:
//  Variable to access the entirety of the board.
//  Treated as a 2d array, all elements are Stacks.
let board;
const boardRows = 4;
const boardColumns = 4;

//  Player pieces:
//  Variable to access all player pieces not yet placed on the board.
//  It is an array, with each element of an array representing a player.
//  Each element contains an array of game pieces.
let playerPieces;
const NumOfPlayers = 2;
const playerColumns = 4;
const playerRows = 3;

//  turn indicator variable. If true, it's player 1's turn.
let isPlayer1;

//  selected element variable. holds the previously selected player piece, if any
let prevSelectedCell;

//  here will be stored win cases for players
let winner = null;

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
  prevSelectedCell = null;
  winner = [];
  //    initialize player sections
  for (let playerIndex = 0; playerIndex < NumOfPlayers; playerIndex++) {
    //  loop resetting pieces for each player
    for (let i = 0; i < playerColumns; i++) {
      for (let j = 0; j < playerRows; j++) {
        const pieceElem = document.createElement("div");
        pieceElem.setAttribute(
          "id",
          "piece" +
            (i + j * playerColumns + playerIndex * playerColumns * playerRows)
        );
        pieceElem.classList.add("piece"); //  adding first cosmetic class to apply piece appearance
        //  saving owning player for each game piece
        pieceElem.classList.add("player" + playerIndex); //  adding a cosmetic class to the piece classifying it as the current player's
        pieceElem.dataset.player = playerIndex;
        //  controlling game piece size
        pieceElem.classList.add("size" + i); //  adding a cosmetic class to the piece classifying it as the size, according to column
        pieceElem.style.zIndex = i; //  higher size means higher display priority. we will also use this for size comparisons

        //  adding the new element to the appropriate cell for the appropriate player
        const cellName =
          "p" + (playerIndex + 1) + "-cell-" + (i + j * playerColumns + 1);
        const elem = document.getElementById(cellName);
        elem.appendChild(pieceElem);
        elem.parentElement = pieceElem;
      }
    }
  }
}

function trySelect(event) {
  if (winner.length > 1) return;
  let tempCell = event.target;
  if (tempCell.classList.contains("piece")) {
    tempCell = tempCell.parentElement;
  }
  const targetCell = tempCell;
  const activePlayer = 0 + (isPlayer1 ? 0 : 1);
  const targetPiece = targetCell.lastElementChild; //  biggest piece in the cell

  console.log(targetCell);

  //    first, if no existing selection
  if (prevSelectedCell === null) {
    //  if tried to select their piece, just select it
    if (
      targetPiece != null &&
      targetPiece.classList.contains("player" + activePlayer)
    ) {
      selectCell(targetCell);
      return;
    } else {
      //  here, no existing selection, but tried to select opponent's or no piece. quit execution
      console.log("you dun goofed");
      return;
    }
  } else {
    //  if it's the same one again, just reset selection
    if (prevSelectedCell.id === targetCell.id) {
      resetSelection();
      return;
    }
    //  here, we know we have an existing selection, and we're selecting a target.
    //  first, make sure target is on the board
    if (targetCell.parentElement.id === "game-board") {
      //  if target is empty, just move there
      if (targetCell.childElementCount === 0) {
        console.log("target empty + already selected");
        movePiece(prevSelectedCell, targetCell);
        return;
      }
      //  now we need to figure out if it's a valid target.
      //  if target cell has children, check the topmost one
      if (targetCell.childElementCount > 0) {
        //    if that child is of equal or higher size to the current selected piece, stop execution
        if (
          prevSelectedCell.lastElementChild.style.zIndex <=
          targetPiece.style.zIndex
        ) {
          console.log("too big");
          return;
        } else {
          console.log("tested z index");
          movePiece(prevSelectedCell, targetCell);
        }
      }
    }
  }
}

/* select the given piece and display it as such. */
function selectCell(cell) {
  if (prevSelectedCell != null && prevSelectedCell === cell) {
    resetSelection();
    return;
  }

  const pieceToSelect = cell.lastElementChild;
  pieceToSelect.classList.toggle("selected");
  prevSelectedCell = cell;
}

/* reset the currently selected cell's tag, then set the currently selected cell to null */
function resetSelection() {
  console.log("resetting");
  if (prevSelectedCell === null || prevSelectedCell.childElementCount <= 0)
    return;
  const piece = prevSelectedCell.lastElementChild;
  piece.classList.toggle("selected");
  prevSelectedCell = null;
}

async function movePiece(oldCell, newCell) {
  console.log("moving");

  //    reset selection
  resetSelection();

  //    move piece
  await movePieceAsync(oldCell, newCell);

  //    check win conditions
  checkWinConditions();

  //    switch turns
  isPlayer1 = !isPlayer1;
  let turnIndicator = document.getElementById("turn-indicator");
  turnIndicator.classList.toggle("player1turn");
  turnIndicator.classList.toggle("player2turn");
}

function checkWinConditions() {
  let rowPlayer;
  let columnPlayer;
  let cellNum;
  let tempCell;
  // checking rows
  for (let i = 0; i < boardColumns; i++) {
    rowPlayer = -2;
    for (let j = 0; j < boardRows && rowPlayer != -1; j++) {
      cellNum = 1 + i * boardColumns + j;
      tempCell = document.getElementById("cell-" + cellNum);
      if (j === 0) {
        if (tempCell.childElementCount <= 0) {
          rowPlayer = -1;
          console.log("bad row " + i);
        } else {
          rowPlayer = getPieceOwnerNum(tempCell);
        }
      } else {
        if (
          tempCell.childElementCount <= 0 ||
          getPieceOwnerNum(tempCell) != rowPlayer
        ) {
          rowPlayer = -1;
          console.log("bad column " + i);
        } else {
          if (j === boardRows - 1 && rowPlayer != -1) {
            winner.push(rowPlayer);
          }
        }
      }
    }
  }

  // checking columns
  for (let i = 0; i < boardRows; i++) {
    columnPlayer = -2;
    for (let j = 0; j < boardColumns && columnPlayer != -1; j++) {
      cellNum = 1 + i + j * boardColumns;
      tempCell = document.getElementById("cell-" + cellNum);
      if (j === 0) {
        if (tempCell.childElementCount <= 0) {
          columnPlayer = -1;
        } else {
          columnPlayer = getPieceOwnerNum(tempCell);
        }
      } else {
        if (
          tempCell.childElementCount <= 0 ||
          getPieceOwnerNum(tempCell) != columnPlayer
        ) {
          columnPlayer = -1;
          console.log("bad column " + i);
        } else {
          if (j === boardRows - 1 && columnPlayer != -1) {
            winner.push(columnPlayer);
          }
        }
      }
    }
  }
  let diagonalplayer = -2;
  let diagonal2player = -2;
  // checking both diagonals at once
  for (
    let i = 0;
    i < boardColumns && !(diagonalplayer === -1 && diagonal2player === -1);
    i++
  ) {
    //  checking diagonal 1 \
    cellNum = i * (boardColumns + 1) + 1;
    tempCell = document.getElementById("cell-" + cellNum);
    if (i === 0 && tempCell.childElementCount > 0) {
      diagonalplayer = getPieceOwnerNum(tempCell);
    } else {
      if (
        tempCell.childElementCount === 0 ||
        (tempCell.childElementCount > 0 &&
          getPieceOwnerNum(tempCell) != diagonalplayer)
      ) {
        diagonalplayer = -1;
      } else {
        if (i === boardRows - 1) {
          if (diagonalplayer != -1) {
            winner.push(diagonalplayer);
          }
        }
      }
    }

    //  checking diagonal 2 /
    cellNum = boardColumns * boardRows - (i + 1) * 3;
    tempCell = document.getElementById("cell-" + cellNum);
    console.log(tempCell);
    if (i === 0 && tempCell.childElementCount > 0) {
      diagonal2player = getPieceOwnerNum(tempCell);
    } else {
      if (
        tempCell.childElementCount === 0 ||
        (tempCell.childElementCount > 0 &&
          getPieceOwnerNum(tempCell) != diagonal2player)
      ) {
        diagonal2player = -1;
      } else {
        if (i === boardRows - 1) {
          if (diagonal2player != -1) {
            winner.push(diagonal2player);
          }
        }
      }
    }

    console.log(winner);
    if (winner.length > 0) {
      if (winner.length > 1) {
        let first = winner[0];
        for (i = 0; i < winner.length; i++) {
          console.log(i + " " + winner[i]);
          if (winner[i] != first) {
            alert("draw");
            return;
          }
        }
      } else {
        alert("Player " + (parseInt(winner[0]) + 1) + " is the winner");
        return;
      }
    }
  }
}

async function movePieceAsync(oldCell, newCell) {
  let piece = oldCell.lastElementChild;
  await oldCell.removeChild(piece);
  await newCell.appendChild(piece);
}

function getPieceOwnerNum(cell) {
  let piece = cell.lastElementChild;
  return piece.dataset.player;
}
