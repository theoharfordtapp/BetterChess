const pieces = {
    'r': 'rook_black.png',
    'n': 'knight_black.png',
    'b': 'bishop_black.png',
    'q': 'queen_black.png',
    'k': 'king_black.png',
    'p': 'pawn_black.png',
    'R': 'rook_white.png',
    'N': 'knight_white.png',
    'B': 'bishop_white.png',
    'Q': 'queen_white.png',
    'K': 'king_white.png',
    'P': 'pawn_white.png'
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
                img.src = `assets/${pieces[piece]}`;
                img.className = 'piece';
                board[row * 8 + col].appendChild(img);
            }
        }
    }
}

createBoard();
placePieces();
