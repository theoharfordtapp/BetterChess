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

const initialBoard = [
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
let selectedSquare = null;

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
    
    if (selectedPiece && selectedSquare) {
        movePiece(row, col);
        alert(`Moved ${selectedPiece} to ${selectedSquare}`)
        selectedPiece = null;
        selectedSquare = null;
    } else {
        alert(`Selected ${selectedPiece}`)
    }
}

function checkValidMove(piece, square) {
    return true;
}

function select(square, row, col) {
    const piece = initialBoard[row][col];
    console.log(`Selected Piece: ${selectedPiece} | Selected Square: ${selectedSquare}`);
    if (selectedPiece !== null && selectedSquare == null) {
        if (checkValidMove(selectedPiece, selectedSquare) == true) {
            console.log(`Selecting square`);
            selectedSquare = square;
        } else {
            selectedPiece = null;
        }
    } else if (selectedPiece == null) {
        console.log(`Selecting piece`);
        selectedPiece = piece;
    }
    console.log(`Selected Piece: ${selectedPiece} | Selected Square: ${selectedSquare}`);
}

function movePiece(row, col) {
    if (selectedPiece && selectedSquare) {
        const oldRow = selectedSquare.dataset.row;
        const oldCol = selectedSquare.dataset.col;
        initialBoard[oldRow][oldCol] = ' ';
        initialBoard[row][col] = selectedPiece;
        
        updateBoard();
    }
}

function updateBoard() {
    const board = document.getElementById('chessboard').children;
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
    }
}

createBoard();
placePieces();
