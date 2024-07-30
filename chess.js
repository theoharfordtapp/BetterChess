const pieces = {
    'r': 'bR.png',
    'n': 'bN.png',
    'b': 'bB.png',
    'q': 'bQ.png',
    'k': 'bK.png',
    'p': 'bP.png',
    'R': 'wR.png',
    'N': 'wN.png',
    'B': 'wB.png',
    'Q': 'wQ.png',
    'K': 'wK.png',
    'P': 'wP.png'
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

function createBoard() {
    const board = document.getElementById('chessboard');
    let isWhite = true;

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.className = `square ${isWhite ? 'white' : 'black'}`;
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

createBoard();
placePieces();
