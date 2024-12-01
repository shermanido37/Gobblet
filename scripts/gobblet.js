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
  alreadySelectedCell = null;
  winner = [];

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
  console.log(gameBoard.toString());
  console.log("---");
  console.log(playerBoards[0].toString());
  console.log("---");
  console.log(playerBoards[1].toString());
}

function trySelect(event) {
  //  if game is over, don't select
  if (winner.length > 1) return;
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
      return;
    } else {
      //  here, no existing selection, but tried to select opponent's or no piece. quit execution
      console.log("you dun goofed");
      return;
    }
  } else {
    //  if it's the same one again, just reset selection
    if (alreadySelectedCell.id === targetCell.id) {
      resetSelection();
      return;
    }
    //  here, we know we have an existing selection, and we're selecting a target.

    //  switch turns
    isPlayer1 = !isPlayer1;
    let turnIndicator = document.getElementById("turn-indicator");
    turnIndicator.classList.toggle("player1turn");
    turnIndicator.classList.toggle("player2turn");
  }
}

/* select the given piece and display it as such. */
function selectCell(cell) {
  if (alreadySelectedCell != null && alreadySelectedCell === cell) {
    resetSelection();
    return;
  }

  const pieceToSelect = cell.lastElementChild;
  pieceToSelect.classList.toggle("selected");
  alreadySelectedCell = cell;
  if (!alreadySelectedCell) return;
  console.log(
    "selected " +
      alreadySelectedCell.id.substr(8) +
      " " +
      pieceToSelect.id.substr(5)
  );
  const temp = pieceIdToXY(
    isPlayer1 ? WHITE : BLACK,
    parseInt(pieceToSelect.id.substr(5))
  );
  console.log("converted: " + temp);

  const temp4 = playerBoards[0].getCoordinates(temp);
  console.log("coordinates in database: " + temp4);

  const temp2 = parseInt(alreadySelectedCell.id.substr(8));
  console.log(temp2);

  const temp3 = cellIdToXY(isPlayer1 ? WHITE : BLACK, temp2);
  console.log(temp3);
}

/* reset the currently selected cell's tag, then set the currently selected cell to null */
function resetSelection() {
  console.log("resetting");
  if (
    alreadySelectedCell === null ||
    alreadySelectedCell.childElementCount <= 0
  )
    return;
  const piece = alreadySelectedCell.lastElementChild;
  piece.classList.toggle("selected");
  alreadySelectedCell = null;
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
  console.log(boardToSearch.getCoordinates(id));
  return boardToSearch.getCoordinates(id);
}

//  return an array with the coordinates of the cell on the given board, according to its id
function cellIdToXY(boardOwner, id) {
  const fixedID = id - 1;
  if (boardOwner === FAILURE)
    return [Math.floor(fixedID / boardColumns), fixedID % boardRows]; //  if cell is on game board and not a player's board
  return [Math.floor(fixedID / playerColumns), fixedID % playerColumns];
}
