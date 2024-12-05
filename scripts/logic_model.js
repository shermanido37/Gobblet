class Piece {
  constructor(id, player, size) {
    this.id = id;
    this.player = player;
    this.size = size;
  }
}

class Stack {
  constructor() {
    this.items = [];
  }

  // Add a number to the stack
  push(number) {
    this.items.push(number);
  }

  // Take the top number off the stack
  pop() {
    if (this.items.length === 0) throw Exception("Stack is empty");
    return this.items.pop();
  }

  // See what the top number is
  peek() {
    return this.items[this.items.length - 1];
  }

  // Check if the stack is empty
  isEmpty() {
    return this.items.length === 0;
  }

  // Find out how many items are in the stack
  size() {
    return this.items.length;
  }
}

class Board {
  constructor(width, height, isPlacable, player) {
    this.board = [];
    for (let i = 0; i < height; i++) {
      this.board[i] = [];
      for (let j = 0; j < width; j++) {
        this.board[i][j] = new Stack();
      }
    }

    this.isPlacable = isPlacable;
    if (!isPlacable) {
      for (let i = 0; i < this.board.length; i++) {
        for (let j = 0; j < this.board[0].length; j++) {
          this.board[i][j].push(
            new Piece(
              i * (this.board.length - 1) +
                j +
                (player - WHITE) * playerRows * playerColumns,
              player,
              this.board.length - i
            )
          );
        }
      }
    }
  }

  toString() {
    for (let i = 0; i < this.board.length; i++) {
      for (let j = 0; j < this.board[0].length; j++) {
        const temp = this.board[i][j].peek();
        if (temp != null)
          console.log(
            i + " " + j + ": " + temp.id + " " + temp.player + " " + temp.size
          );
      }
    }
  }

  moveNew(x, y, piece) {
    this.board[x][y].push(piece);
  }

  withdraw(x, y) {
    const piece = this.board[x][y].pop();
    return piece;
  }

  move(prevCoordinates, newCoordinates) {
    const piece = this.withdraw(prevCoordinates[0], prevCoordinates[1]);
    this.moveNew(newCoordinates[0], newCoordinates[1], piece);
  }

  //    checking if the move the player is trying to make is valid
  //    pieceToMove is the Piece object selected, placeToMove is an array of coordinates on the board
  isLegalMove(pieceToMove, placeToMoveXY) {
    if (!this.isPlacable) return false; //  if trying to move a piece to an unplacable board, declare illegal move
    if (pieceToMove === null) throw Exception("Trying to move empty piece");
    const target = this.board[placeToMoveXY[0]][placeToMoveXY[1]];
    if (target.isEmpty()) return true;

    //  here we know that the place we want to move is a currently existing piece
    let placeToMoveTop = target.peek();
    if (pieceToMove.size <= placeToMoveTop.size) return false;
    return true;
  }

  //    returns coordinates of piece if found on top of one of the board tiles
  getCoordinates(pieceID) {
    for (let i = 0; i < this.board.length; i++) {
      for (let j = 0; j < this.board[0].length; j++) {
        if (
          this.board[i][j].peek() != null &&
          this.board[i][j].peek().id === pieceID
        )
          return [i, j];
      }
    }
    return [];
  }

  //    checks for a victory in the given row. if no victory returns -1, else returns the player number
  checkVictoryRow(targetRow) {
    return this.checkVictory(0, targetRow, 1, 0);
  }

  //    checks for a victory in the given column. if no victory returns -1, else returns the player number
  checkVictoryColumn(targetColumn) {
    return this.checkVictory(targetColumn, 0, 0, 1);
  }

  //    checks for a victory in the first diagonal. if no victory returns -1, else returns the player number
  checkDiagonal1() {
    return this.checkVictory(0, 0, 1, 1);
  }

  //    checks for a victory in the second diagonal. if no victory returns -1, else returns the player number
  checkDiagonal2() {
    return this.checkVictory(0, this.board.length - 1, 1, -1);
  }

  //    checking for victory. can read rows, columns, or diagonals
  //    returns FAILURE if no victory, otherwise returns the identity of the winning player
  checkVictory(startX, startY, hInc, vInc) {
    let winningPlayer;
    const firstStack = this.board[startX][startY];
    if (firstStack.isEmpty()) return FAILURE;
    winningPlayer = firstStack.peek().player;
    for (let i = 1; i < this.board.length; i++) {
      //    check according to position in loop and according to starting and increment parameters
      let currentStack = this.board[startX + i * hInc][startY + i * vInc];
      //    if no victory, stop checking
      if (currentStack.isEmpty()) return FAILURE;
      if (currentStack.peek().player != winningPlayer) return FAILURE;
    }
    //  we've checked the entire thing and it's all the same player. they are the victor
    return winningPlayer;
  }

  //    individual victory check per stack, assuming the stack is not empty.
  //    if no victory returns -1, else returns player number
  //    winningPlayer is the player that we're checking if they're the winner
  //    stack is the stack of the individual spot we're checking
  //    i is the sequence number in the loop
  individualVictoryCheck(winningPlayer, stack, i) {
    //    if empty spot, there cannot be a victory
    if (stack.isEmpty) return -1;

    const pieceOwner = tempStack.peek.player;

    //    otherwise, check if the player owning the piece is the same as all the others. if not, no victory
    if (pieceOwner != winningPlayer) return -1;
    //  this indicates that it's ok to keep searching the board, since it's the same player
    return winningPlayer;
  }
}
