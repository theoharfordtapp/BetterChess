const pieces = {
    'r': 'br.png',
    'n': 'bn.png',
    'b': 'bb.png',
    'q': 'bq.png',
    'k': 'bk.png',
    'p': 'bp.png',
    'R': 'wr.png',
    'N': 'wn.png',
    'B': 'wb.png',
    'Q': 'wq.png',
    'K': 'wk.png',
    'P': 'wp.png'
};

let initialBoard = [
    'rnbqkbnr',
    'pppppppp',
    '        ',
    '        ',
    '        ',
    '        ',
    'PPPPPPPP',
    'RNBQKBNR'
];

let selectedPiece = null;
let selectedOldSquare = null;
let selectedSquare = null;

let currentTurn = null;
let check = false;

function createBoard() {
    const board = document.getElementById('chessboard');
    let isWhite = true;

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.className = `square ${isWhite ? 'white' : 'black'}`;
            square.dataset.row = row;
            square.dataset.col = col;
            square.addEventListener('click', onSquareClick);
            isWhite = !isWhite;
            if (col === 7) isWhite = !isWhite;
            board.appendChild(square);
        }
    }
}

function placePieces() {
    const board = document.getElementById('chessboard').children;
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = initialBoard[row][col];
            if (piece !== ' ') {
                const img = document.createElement('img');
                img.src = `https://images.chesscomfiles.com/chess-themes/pieces/neo/150/${pieces[piece]}`;
                img.className = 'piece';
                board[row * 8 + col].appendChild(img);
            }
        }
    }
}

function onSquareClick(event) {
    const square = event.currentTarget;
    const row = square.dataset.row;
    const col = square.dataset.col;

    select(square, row, col);
    
    if (selectedOldSquare && selectedSquare) {
        initialBoard = movePiece(initialBoard, selectedPiece, selectedOldSquare, selectedNewSquare);
        updateBoard();
        console.log(`Moved ${selectedPiece} from ${selectedOldSquare} to ${selectedSquare}`)
        currentTurn = !(selectedPiece == selectedPiece.toLowerCase());
        selectedPiece = null;
        selectedOldSquare = null;
        selectedSquare = null;
    } else {
        console.log(`Selected ${selectedPiece}`)
    }

    updateBoard();
}

function inCheck(boardState) {
    // Helper function to determine if a position is under attack by any opponent piece
    function isUnderAttack(row, col, isWhite) {
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = boardState[r][c];
                if (piece !== ' ' && (piece === piece.toUpperCase()) !== isWhite) {
                    if (checkValidMove(true, piece, { dataset: { row: r, col: c } }, { dataset: { row: row, col: col } })) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    // Find the king's position for a given team
    function findKing(isWhite) {
        console.log(boardState)
        const king = isWhite ? 'K' : 'k';
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (boardState[row][col] == king) {
                    return { row, col };
                }
            }
        }
        return null; // King not found (shouldn't happen in a valid game)
    }

    // Find both kings
    const whiteKingPos = findKing(true);
    const blackKingPos = findKing(false);

    if (whiteKingPos === null || blackKingPos === null) {
        throw new Error("King not found on the board!");
    }

    // Check if either king's position is under attack
    const whiteKingInCheck = isUnderAttack(whiteKingPos.row, whiteKingPos.col, true);
    const blackKingInCheck = isUnderAttack(blackKingPos.row, blackKingPos.col, false);

    if (whiteKingInCheck && blackKingInCheck) {
        return 'both'; // Both kings are in check (shouldn't typically happen in a normal game)
    } else if (whiteKingInCheck) {
        return 'white';
    } else if (blackKingInCheck) {
        return 'black';
    } else {
        return false;
    }
}


function checkValidMove(ignoreCheck, piece, oldSquare, newSquare) {
    const oldRow = parseInt(oldSquare.dataset.row);
    const oldCol = parseInt(oldSquare.dataset.col);
    const newRow = parseInt(newSquare.dataset.row);
    const newCol = parseInt(newSquare.dataset.col);

    const pieceType = piece.toLowerCase();
    const isWhite = piece == piece.toUpperCase();

    // Helper function to check if the path is clear for rooks, bishops, and queens
    function isPathClear(startRow, startCol, endRow, endCol) {
        const rowDiff = endRow - startRow;
        const colDiff = endCol - startCol;
        const stepRow = rowDiff === 0 ? 0 : rowDiff / Math.abs(rowDiff);
        const stepCol = colDiff === 0 ? 0 : colDiff / Math.abs(colDiff);

        let row = startRow + stepRow;
        let col = startCol + stepCol;

        while (row !== endRow || col !== endCol) {
            if (initialBoard[row][col] !== ' ') {
                return false;
            }
            row += stepRow;
            col += stepCol;
        }
        return true;
    }

    // Check if move is within bounds
    if (newRow < 0 || newRow > 7 || newCol < 0 || newCol > 7) {
        return false;
    }

    // Check if the destination square is occupied by the same colour
    const destinationPiece = initialBoard[newRow][newCol];
    const destinationIsWhite = destinationPiece === destinationPiece.toUpperCase();

    // If destination is occupied by the same colour, return false
    if (destinationPiece !== ' ' && isWhite === destinationIsWhite) {
        return false;
    }

    if (!ignoreCheck) {
        hypothetical = movePiece(initialBoard, piece, oldSquare, newSquare);
    
        if ((inCheck(hypothetical) == 'white' && isWhite) || (inCheck(hypothetical) == 'black' && !isWhite)) {
            return false;
        }
    }

    // Pawn moves
    if (pieceType === 'p') {
        const direction = isWhite ? -1 : 1;
        // Move one square forward
        if (newCol === oldCol) {
            if (newRow === oldRow + direction && initialBoard[newRow][newCol] === ' ') {
                return true;
            }
            // Move two squares forward from the starting position
            if (newRow === oldRow + 2 * direction && oldRow === (isWhite ? 6 : 1) && initialBoard[newRow][newCol] === ' ') {
                return true;
            }
        }
        // Capture diagonally
        else if (Math.abs(newCol - oldCol) === 1 && newRow === oldRow + direction) {
            if (destinationPiece !== ' ') {
                return true;
            }
        }
        return false;
    }

    // Rook moves
    if (pieceType === 'r') {
        if (newRow === oldRow || newCol === oldCol) {
            return isPathClear(oldRow, oldCol, newRow, newCol);
        }
        return false;
    }

    // Knight moves
    if (pieceType === 'n') {
        const rowDiff = Math.abs(newRow - oldRow);
        const colDiff = Math.abs(newCol - oldCol);
        return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
    }

    // Bishop moves
    if (pieceType === 'b') {
        if (Math.abs(newRow - oldRow) === Math.abs(newCol - oldCol)) {
            return isPathClear(oldRow, oldCol, newRow, newCol);
        }
        return false;
    }

    // Queen moves
    if (pieceType === 'q') {
        if (newRow === oldRow || newCol === oldCol || Math.abs(newRow - oldRow) === Math.abs(newCol - oldCol)) {
            return isPathClear(oldRow, oldCol, newRow, newCol);
        }
        return false;
    }

    // King moves
    if (pieceType === 'k') {
        const rowDiff = Math.abs(newRow - oldRow);
        const colDiff = Math.abs(newCol - oldCol);
        return (rowDiff <= 1 && colDiff <= 1);
    }

    return false;
}


function select(square, row, col) {
    const piece = initialBoard[row][col];
    console.log(`Selected Piece: ${selectedPiece} | Selected Square: ${selectedSquare} | Selected Old Square: ${selectedOldSquare}`);
    if (selectedOldSquare !== null && selectedSquare == null) {
        if (checkValidMove(false, selectedPiece, selectedOldSquare, square) == true) {
            console.log(`Selecting square`);
            selectedSquare = square;
        } else {
            console.log('Invalid move, resetting');
            if (piece !== ' ') {
                selectedPiece = piece;
                selectedOldSquare = square;
            } else {
                selectedPiece = null;
                selectedOldSquare = null;
            }
        }
    } else if (selectedOldSquare == null && piece !== ' ') {
        if (currentTurn == null || (piece == piece.toLowerCase()) == currentTurn) {
            console.log(`Selecting piece`);
            selectedOldSquare = square;
            selectedPiece = piece;
        }
    }
    console.log(`Selected Piece: ${selectedPiece} | Selected Square: ${selectedSquare} | Selected Old Square: ${selectedOldSquare}`);
}

function movePiece(boardToUpdate, piece, oldSquare, newSquare) {
    newBoard = boardToUpdate
    
    const oldRow = oldSquare.dataset.row;
    const oldCol = oldSquare.dataset.col;
    const row = newSquare.dataset.row;
    const col = newSquare.dataset.col;
    console.log(`Old: ${oldCol}x${oldRow} | New: ${col}x${row}`)
    
    newBoard[oldRow] = newBoard[oldRow].substring(0, oldCol) + ' ' + newBoard[oldRow].substring(parseInt(oldCol) + 1);
    newBoard[row] = newBoard[row].substring(0, col) + piece + newBoard[row].substring(parseInt(col) + 1);

    console.log(newBoard);

    return newBoard;
}

function updateBoard() {
    const board = document.getElementById('chessboard').children;
    console.log(initialBoard);
    if (inCheck(initialBoard)) {
        check = true;
        alert('check');
    } else {
        check = false;
    }
    for (let i = 0; i < board.length; i++) {
        const square = board[i];
        square.innerHTML = '';
        const row = square.dataset.row;
        const col = square.dataset.col;
        const piece = initialBoard[row][col];
        if (piece !== ' ') {
            const img = document.createElement('img');
            img.src = `https://images.chesscomfiles.com/chess-themes/pieces/neo/150/${pieces[piece]}`;
            img.className = 'piece';
            square.appendChild(img);
        }
        if (square == selectedOldSquare) {
            square.classList.add('highlighted');
        } else {
            square.classList.remove('highlighted');
        }

        if (selectedPiece !== null && selectedOldSquare !== null) {
            if (checkValidMove(false, selectedPiece, selectedOldSquare, square)) {
                const dot = document.createElement('div');
                dot.classList.add('dot');
                square.appendChild(dot);
            }
        }
    }
}

createBoard();
placePieces();
