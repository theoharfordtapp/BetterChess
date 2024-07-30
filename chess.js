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
