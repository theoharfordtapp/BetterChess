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
        movePiece();
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

function checkValidMove(piece, oldSquare, newSquare) {
    const oldRow = parseInt(oldSquare.dataset.row);
    const oldCol = parseInt(oldSquare.dataset.col);
    const newRow = parseInt(newSquare.dataset.row);
    const newCol = parseInt(newSquare.dataset.col);

    const pieceType = piece.toLowerCase();
    const isWhite = piece === piece.toUpperCase();

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
    if (destinationPiece !== ' ' && (isWhite === (destinationPiece === destinationPiece.toUpperCase()))) {
        return false;
    }

    // Pawn moves
    if (pieceType === 'p') {
        const direction = isWhite ? -1 : 1;
        if (newCol === oldCol) {
            if (newRow === oldRow + direction && initialBoard[newRow][newCol] === ' ') {
                return true;
            }
            if (newRow === oldRow + 2 * direction && oldRow === (isWhite ? 6 : 1) && initialBoard[newRow][newCol] === ' ') {
                return true;
            }
        } else if (Math.abs(newCol - oldCol) === 1 && newRow === oldRow + direction) {
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
    if (currentTurn == null || (piece == piece.toLowerCase()) == currentTurn) {
        if (selectedOldSquare !== null && selectedSquare == null) {
            if (checkValidMove(selectedPiece, selectedOldSquare, square) == true) {
                console.log(`Selecting square`);
                selectedSquare = square;
            } else {
                console.log('Invalid move, resetting');
                selectedPiece = null;
                selectedOldSquare = null;
            }
        } else if (selectedOldSquare == null) {
            console.log(`Selecting piece`);
            selectedOldSquare = square;
            selectedPiece = piece;
        }
    }
    console.log(`Selected Piece: ${selectedPiece} | Selected Square: ${selectedSquare} | Selected Old Square: ${selectedOldSquare}`);
}

function movePiece() {
    const oldRow = selectedOldSquare.dataset.row;
    const oldCol = selectedOldSquare.dataset.col;
    const row = selectedSquare.dataset.row;
    const col = selectedSquare.dataset.col;
    console.log(`Old: ${oldCol}x${oldRow} | New: ${col}x${row}`)
    
    initialBoard[oldRow] = initialBoard[oldRow].substring(0, oldCol) + ' ' + initialBoard[oldRow].substring(parseInt(oldCol) + 1);
    initialBoard[row] = initialBoard[row].substring(0, col) + selectedPiece + initialBoard[row].substring(parseInt(col) + 1);

    console.log(initialBoard);
    
    updateBoard();
}

function updateBoard() {
    const board = document.getElementById('chessboard').children;
    console.log(initialBoard);
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
            if (checkValidMove(selectedPiece, selectedOldSquare, square)) {
                const dot = document.createElement('div');
                dot.classList.add('dot');
                square.appendChild(dot);
            }
        }
    }
}

createBoard();
placePieces();
