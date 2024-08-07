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
    'P': 'wp.png',
};

const piecesLocal = {
    'o': 'bo.png',
    'O': 'wo.png',
    'j': 'bj.png',
    'J': 'wj.png',
    'e': 'be.png',
    'E': 'we.png',
    'd': 'bd.png',
    'D': 'wd.png',
    'a': 'ba.png',
    'A': 'wa.png',
    'x': 'bx.png',
    'X': 'wx.png',
    'c': 'tlc.png',
    'C': 'trc.png',
    'h': 'blc.png',
    'H': 'brc.png',
}

function flipSauce(saucePiece) {
    if (flipped) {
        switch (saucePiece) {
            case 'tlc.png':
                return 'brc.png'
            case 'trc.png':
                return 'blc.png'
            case 'blc.png':
                return 'trc.png'
            case 'brc.png':
                return 'tlc.png'
        }
    }
    else {
        return saucePiece;
    }
}

let initialBoard = [
    'arnbqkbnoa',
    'eeppppppee',
    '          ',
    '          ',
    'cC  dD    ',
    'hH  Dd    ',
    '          ',
    '          ',
    'EEPPPPPPEE',
    'ARNBQKBNOA'
];

let lastBoard = [
    'arnbqkbnoa',
    'eeppppppee',
    '          ',
    '          ',
    'cC  dD    ',
    'hH  Dd    ',
    '          ',
    '          ',
    'EEPPPPPPEE',
    'ARNBQKBNOA'
];

let gambleBoard = [
    '          ',
    '          ',
    '          ',
    '          ',
    '          ',
    '          ',
    '          ',
    '          ',
    '          ',
    '          ',
];

let whiteTrainPassengers = [
    ' ',
    ' '
]
let blackTrainPassengers = [
    ' ',
    ' '
]

const rowLength = 10;
const colLength = 10;

let trainArrived = false;

let movesUntilArrival = 5;
let movesUntilDeparture = 2;

let selectedPiece = null;
let selectedOldSquare = null;
let selectedSquare = null;

let lastSelectedOldSquare = null;
let lastSelectedSquare = null;

let blackJoeOldSquare = null;
let blackJoeSquare = null;
let whiteJoeOldSquare = null;
let whiteJoeSquare = null;

let casinoCaptured = false;

let currentTurn = null;

let check = false;
let checkmate = false;
let stalemate = false;

let enPassantTargetSquare = null;

let flipped = false;

let mute = false;
let theme = 'neo';

let joeBidenTurns = 5;

let firstMove = true;

let bidensStarted = false;

let rulesShown = false;

function createBoard() {
    const board = document.getElementById('chessboard');
    
    const sheet = document.styleSheets[0];
    const rules = sheet.cssRules;

    const rule = Array.from(rules).find(item => item.selectorText === '#chessboard');

    rule.style.gridTemplateColumns = `repeat(${rowLength}, 1fr)`;
    rule.style.maxWidth = `${72*rowLength}px`;

    rule.style.gridTemplateRows = `repeat(${colLength}, 1fr)`;
    rule.style.maxHeight = `${72*colLength}px`;

    let isWhite = true;

    for (let row = 0; row < colLength; row++) {
        for (let col = 0; col < rowLength; col++) {
            const square = document.createElement('div');
            square.className = `square ${isWhite ? 'white' : 'black'}`;
            square.dataset.row = row;
            square.dataset.col = col;
            square.addEventListener('click', onSquareClick);
            if (col !== rowLength-1) isWhite = !isWhite;
            board.appendChild(square);
        }
    }
}

function toggleTheme() {
    theme = (theme == 'neo') ? 'classic' : 'neo';

    updateBoard();
}

function toggleMute() {
    mute = !mute

    const muteButton = document.getElementById('mute');
    muteButton.innerHTML = mute ? 'Unmute' : 'Mute';
    
    updateBoard();
}

function flipBoard() {
    let newBoard = [];
    let newGambleBoard = [];

    initialBoard.forEach(row => {
        const rowArray = row.split('');
        const rowArrayReversed = rowArray.reverse();
        const rowReversed = rowArrayReversed.join('');
        newBoard.push(rowReversed);
    })

    gambleBoard.forEach(row => {
        const rowArray = row.split('');
        const rowArrayReversed = rowArray.reverse();
        const rowReversed = rowArrayReversed.join('');
        newGambleBoard.push(rowReversed);
    })

    newBoard = newBoard.reverse();
    newGambleBoard = newGambleBoard.reverse();

    initialBoard = structuredClone(newBoard);
    gambleBoard = structuredClone(newGambleBoard);

    if (enPassantTargetSquare) {
        const newSquare = { dataset: { row: (colLength-1) - enPassantTargetSquare.dataset.row, col: (rowLength-1) - enPassantTargetSquare.dataset.col } };
        enPassantTargetSquare = newSquare;
    }
    
    if (selectedOldSquare) {
        const newSquare = { dataset: { row: (colLength-1) - selectedOldSquare.dataset.row, col: (rowLength-1) - selectedOldSquare.dataset.col } };
        selectedOldSquare = newSquare;
    }

    if (lastSelectedOldSquare) {
        const newSquare = { dataset: { row: (colLength-1) - lastSelectedOldSquare.dataset.row, col: (rowLength-1) - lastSelectedOldSquare.dataset.col } };
        lastSelectedOldSquare = newSquare;
    }

    if (lastSelectedSquare) {
        const newSquare = { dataset: { row: (colLength-1) - lastSelectedSquare.dataset.row, col: (rowLength-1) - lastSelectedSquare.dataset.col } };
        lastSelectedSquare = newSquare;
    }
    
    if (blackJoeOldSquare) {
        const newSquare = { dataset: { row: (colLength-1) - blackJoeOldSquare.dataset.row, col: (rowLength-1) - blackJoeOldSquare.dataset.col } };
        blackJoeOldSquare = newSquare;
    }
    
    if (blackJoeSquare) {
        const newSquare = { dataset: { row: (colLength-1) - blackJoeSquare.dataset.row, col: (rowLength-1) - blackJoeSquare.dataset.col } };
        blackJoeSquare = newSquare;
    }

    if (whiteJoeOldSquare) {
        const newSquare = { dataset: { row: (colLength-1) - whiteJoeOldSquare.dataset.row, col: (rowLength-1) - whiteJoeOldSquare.dataset.col } };
        whiteJoeOldSquare = newSquare;
    }
    
    if (whiteJoeSquare) {
        const newSquare = { dataset: { row: (colLength-1) - whiteJoeSquare.dataset.row, col: (rowLength-1) - whiteJoeSquare.dataset.col } };
        whiteJoeSquare = newSquare;
    }
    
    flipped = !flipped;

    updateBoard();
}

function onSquareClick(event) {
    if (checkmate) { return null; }
    
    const square = event.currentTarget;
    const row = square.dataset.row;
    const col = square.dataset.col;

    select(square, row, col);
    
    if (selectedOldSquare && selectedSquare) {
        const oldRow = parseInt(selectedOldSquare.dataset.row);
        const newRow = parseInt(selectedSquare.dataset.row);
        const newCol = parseInt(selectedSquare.dataset.col);
        
        lastBoard = initialBoard;
        [gambleBoard, initialBoard] = movePiece(true, gambleBoard, initialBoard, selectedPiece, selectedOldSquare, selectedSquare);
        
        // Reset en passant tracking
        enPassantTargetSquare = null;
        
        // Track potential en passant targets
        if (selectedPiece.toLowerCase() === 'p' && Math.abs(newRow - oldRow) === 2) {
            enPassantTargetSquare = { dataset: { row: (oldRow + newRow) / 2, col: newCol } };
        }
        
        console.log(`Moved ${selectedPiece} from ${selectedOldSquare} to ${selectedSquare}`);
        currentTurn = !(selectedPiece == selectedPiece.toLowerCase());
        lastSelectedOldSquare = selectedOldSquare;
        lastSelectedSquare = selectedSquare;
        selectedPiece = null;
        selectedOldSquare = null;
        selectedSquare = null;
        blackJoeOldSquare = blackJoeSquare;
        whiteJoeOldSquare = whiteJoeSquare;

        firstMove = false;
    } else {
        console.log(`Selected ${selectedPiece}`);
    }
    
    updateBoard();
}

function hasAnyMoves(gambleBoardState, boardState, square) {
    const piece = boardState[square.dataset.row][square.dataset.col];
    for (let row = 0; row < colLength; row++) {
        for (let col = 0; col < rowLength; col++) {
            if (checkValidMove(gambleBoardState, boardState, piece, square, { dataset: { row: row, col: col } })) {
                return true;
            }
        }
    }
    return false;
}

function inCheckmate(gambleBoardState, boardState) {
    let blackInCheckmate = true;
    let whiteInCheckmate = true;
    for (let row = 0; row < colLength; row++) {
        for (let col = 0; col < rowLength; col++) {
            if (hasAnyMoves(gambleBoardState, boardState, { dataset: { row: row, col: col } })) {
                if (boardState[row][col] == boardState[row][col].toLowerCase()) {
                    blackInCheckmate = false;
                    if (whiteInCheckmate == false) { return false; }
                }
                if (boardState[row][col] != boardState[row][col].toLowerCase()) {
                    whiteInCheckmate = false;
                    if (blackInCheckmate == false) { return false; }
                }
            }
        }
    }
    if (whiteInCheckmate) { return 'white'; }
    else if (blackInCheckmate) { return 'black'; }
    else { return false; }
}

// Find the king's position for a given team
function findKing(boardState, isWhite) {
    const kingChar = isWhite ? 'K' : 'k';
    for (let row = 0; row < colLength; row++) {
        for (let col = 0; col < rowLength; col++) {
            if (boardState[row][col] === kingChar) {
                return { dataset: { row: row, col: col } };
            }
        }
    }
    return null; // King not found (shouldn't happen in a valid game)
}

function inCheck(boardState) {
    // Helper function to determine if a position is under attack by any opponent piece
    function isUnderAttack(row, col, isWhite) {
        // Define movement directions for rooks, bishops, and queens
        const directions = [
            [1, 0], [-1, 0], [0, 1], [0, -1],  // Rook and Knook (vertical and horizontal)
            [1, 1], [-1, -1], [1, -1], [-1, 1] // Bishop
        ];

        // Rook, Bishop, Queen, and Knook moves
        for (let [dr, dc] of directions) {
            let r = row + dr;
            let c = col + dc;
            while (r >= 0 && r < colLength && c >= 0 && c < rowLength) {
                if (boardState[r][c] !== ' ') {
                    const piece = boardState[r][c];
                    const pieceIsWhite = piece === piece.toUpperCase();
                    const pieceType = piece.toLowerCase();
                    if (pieceIsWhite !== isWhite) {
                        if ((pieceType === 'q') ||
                            (pieceType === 'r' && (dr === 0 || dc === 0)) ||
                            (pieceType === 'b' && (dr !== 0 && dc !== 0)) ||
                            (pieceType === 'o' && (dr === 0 || dc === 0))) {
                            return true;
                        }
                    }
                    break;
                }
                r += dr;
                c += dc;
            }
        }

        // Knight and Knook moves
        const knightMoves = [
            [2, 1], [2, -1], [-2, 1], [-2, -1],
            [1, 2], [1, -2], [-1, 2], [-1, -2]
        ];

        for (let [dr, dc] of knightMoves) {
            const r = row + dr;
            const c = col + dc;
            if (r >= 0 && r < colLength && c >= 0 && c < rowLength) {
                const piece = boardState[r][c];
                if (piece !== ' ') {
                    const pieceIsWhite = piece === piece.toUpperCase();
                    if (pieceIsWhite !== isWhite && (piece.toLowerCase() === 'n' || piece.toLowerCase() === 'o')) {
                        return true;
                    }
                }
            }
        }

        // King moves
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr !== 0 || dc !== 0) {
                    const r = row + dr;
                    const c = col + dc;
                    if (r >= 0 && r < colLength && c >= 0 && c < rowLength) {
                        const piece = boardState[r][c];
                        if (piece !== ' ') {
                            const pieceIsWhite = piece === piece.toUpperCase();
                            if (pieceIsWhite !== isWhite && piece.toLowerCase() === 'k') {
                                return true;
                            }
                        }
                    }
                }
            }
        }

        // Pawn moves
        const direction = isWhite ? -1 : 1;
        for (let dc of [-1, 1]) {
            const r = row + direction;
            const c = col + dc;
            if (r >= 0 && r < colLength && c >= 0 && c < rowLength) {
                const piece = boardState[r][c];
                if (piece !== ' ') {
                    const pieceIsWhite = piece === piece.toUpperCase();
                    if (pieceIsWhite !== isWhite && piece.toLowerCase() === 'p') {
                        return true;
                    }
                }
            }
        }

        // En Passant moves
        [-1, 1].forEach(colMove => {
            const r = row;
            const c = col + colMove;
            if (r >= 0 && r < colLength && c >= 0 && c < rowLength) {
                const piece = boardState[r][c];
                if (piece !== ' ') {
                    const pieceIsWhite = piece === piece.toUpperCase();
                    if (pieceIsWhite !== isWhite && piece.toLowerCase() === 'e') {
                        return true;
                    }
                }
            }
        });

        return false;
    }

    // Find both kings
    const whiteKingPos = findKing(boardState, true);
    const blackKingPos = findKing(boardState, false);

    let whiteKingInCheck = false;
    let blackKingInCheck = false;

    if (whiteKingPos) {
        whiteKingInCheck = isUnderAttack(parseInt(whiteKingPos.dataset.row), parseInt(whiteKingPos.dataset.col), true);
    }
    if (blackKingPos) {
        blackKingInCheck = isUnderAttack(parseInt(blackKingPos.dataset.row), parseInt(blackKingPos.dataset.col), false);
    }

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


function isPathClear(boardState, startRow, startCol, endRow, endCol) {
    const rowDiff = endRow - startRow;
    const colDiff = endCol - startCol;
    const stepRow = rowDiff === 0 ? 0 : rowDiff / Math.abs(rowDiff);
    const stepCol = colDiff === 0 ? 0 : colDiff / Math.abs(colDiff);

    let row = startRow + stepRow;
    let col = startCol + stepCol;

    while (row !== endRow || col !== endCol) {
        if (row < 0 || row > (colLength-1) || col < 0 || col > (rowLength-1)) {
            return false; // Out of bounds
        }
        if (boardState[row][col] !== ' ') {
            return false;
        }
        row += stepRow;
        col += stepCol;
    }
    return true;
}

function checkValidMove(gambleBoardState, boardState, piece, oldSquare, newSquare) {
    const oldRow = parseInt(oldSquare.dataset.row);
    const oldCol = parseInt(oldSquare.dataset.col);
    const newRow = parseInt(newSquare.dataset.row);
    const newCol = parseInt(newSquare.dataset.col);

    const pieceType = piece.toLowerCase();
    const isWhite = (piece == piece.toUpperCase());

    // Check if move is within bounds
    if (newRow < 0 || newRow > (colLength - 1) || newCol < 0 || newCol > (rowLength - 1)) {
        return false;
    }

    // Check if the destination square is occupied by the same colour
    const destinationPiece = boardState[newRow][newCol];
    const destinationIsWhite = destinationPiece === destinationPiece.toUpperCase();

    // If destination is occupied by the same colour, return false
    if (destinationPiece !== ' ' && isWhite === destinationIsWhite && destinationPiece.toLowerCase() !== 'd' && destinationPiece.toLowerCase() !== 'x' && destinationPiece.toLowerCase() !== 'c' && destinationPiece.toLowerCase() !== 'h') {
        return false;
    }

    if (gambleBoard[oldRow][oldCol] === 'l') {
        if (destinationPiece !== ' ') {
            return false;
        }
        if (piece === 'd') {
            return false;
        }
    }

    if ((newSquare.dataset.row === (colLength / 2) - 2 || newSquare.dataset.row === (colLength / 2) + 1) && piece.toLowerCase() === 'k' && movesUntilArrival === 1) {
        return false;
    }

    if (boardState[newRow][newCol].toLowerCase() == 'k' && !inCheck(boardState)) {
        return false;
    }

    const throwawayBoard = structuredClone(boardState);
    const throwawayGambleBoard = structuredClone(gambleBoardState);
    const [, hypothetical] = movePiece(false, throwawayGambleBoard, throwawayBoard, piece, oldSquare, newSquare);

    // Check if the move leaves the current player's king in check
    const checkStatusAfterMove = inCheck(hypothetical);
    if ((checkStatusAfterMove === 'white' && isWhite) || (checkStatusAfterMove === 'black' && !isWhite) || checkStatusAfterMove === 'both') {
        return false;
    }

    // Pawn moves
    if (pieceType === 'p') {
        const direction = flipped ? (isWhite ? 1 : -1) : (isWhite ? -1 : 1);
        // Move one square forward
        if (newCol === oldCol) {
            if (newRow === oldRow + direction && boardState[newRow][newCol] === ' ') {
                return true;
            }
            // Move two squares forward from the starting position
            if (newRow === oldRow + 2 * direction && oldRow === (flipped ? (isWhite ? 1 : colLength - 2) : (isWhite ? colLength - 2 : 1)) && boardState[newRow - direction][newCol] === ' ' && boardState[newRow][newCol] === ' ') {
                return true;
            }
        }
        // Capture diagonally
        else if (Math.abs(newCol - oldCol) === 1 && newRow === oldRow + direction) {
            if (destinationPiece !== ' ') {
                return true;
            }
            // En passant capture
            if (enPassantTargetSquare && newRow === enPassantTargetSquare.dataset.row && newCol === enPassantTargetSquare.dataset.col) {
                return true;
            }
        }
        return false;
    }

    if (pieceType === 'e') {
        const direction = flipped ? (isWhite ? 1 : -1) : (isWhite ? -1 : 1);
        // Move one square forward
        if (newCol === oldCol) {
            if (newRow === oldRow + direction && boardState[newRow][newCol] === ' ') {
                return true;
            }
        }
        // En passant
        else if (Math.abs(newCol - oldCol) === 1 && newRow === oldRow + direction && boardState[oldRow][newCol] !== ' ' && boardState[newRow][newCol] === ' ' && ((boardState[oldRow][newCol].toUpperCase() == boardState[oldRow][newCol]) !== isWhite || boardState[oldRow][newCol].toLowerCase() === 'd' || boardState[oldRow][newCol].toLowerCase() === 'x')) {
            return true;
        }

        else if (gambleBoard[oldRow][oldCol] === 'w') {
            if (Math.abs(newCol - oldCol) === 1 && newRow === oldRow + direction) {
                if (destinationPiece !== ' ') {
                    return true;
                }
            }
        }

        return false;
    }

    if (pieceType === 'd') {
        if (Math.abs(newCol - oldCol) <= 1 && Math.abs(newRow - oldRow) <= 1 && boardState[newRow][newCol] === ' ') {
            return true;
        }

        return false;
    }

    // Rook moves
    if (pieceType === 'r') {
        if (newRow === oldRow || newCol === oldCol) {
            return isPathClear(boardState, oldRow, oldCol, newRow, newCol);
        }
        if (gambleBoard[oldRow][oldCol] === 'w') {
            if (Math.abs(newCol - oldCol) === 1 && Math.abs(newRow-oldRow) === 1 && boardState[oldRow][newCol] !== ' ' && boardState[newRow][newCol] === ' ' && ((boardState[oldRow][newCol].toUpperCase() == boardState[oldRow][newCol]) !== isWhite || boardState[oldRow][newCol].toLowerCase() === 'd' || boardState[oldRow][newCol].toLowerCase() === 'x')) {
                return true;
            }
        }
        return false;
    }

    // Knight moves
    if (pieceType === 'n') {
        const rowDiff = Math.abs(newRow - oldRow);
        const colDiff = Math.abs(newCol - oldCol);

        if (gambleBoard[oldRow][oldCol] === 'w') {
            if (Math.abs(newCol - oldCol) === 1 && Math.abs(newRow-oldRow) === 1 && boardState[oldRow][newCol] !== ' ' && boardState[newRow][newCol] === ' ' && ((boardState[oldRow][newCol].toUpperCase() == boardState[oldRow][newCol]) !== isWhite || boardState[oldRow][newCol].toLowerCase() === 'd' || boardState[oldRow][newCol].toLowerCase() === 'x')) {
                return true;
            }
        }

        return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
    }

    // Knook moves
    if (pieceType === 'o') {
        const rowDiff = Math.abs(newRow - oldRow);
        const colDiff = Math.abs(newCol - oldCol);

        // Rook-like move
        if (newRow === oldRow || newCol === oldCol) {
            return isPathClear(boardState, oldRow, oldCol, newRow, newCol);
        }

        // Knight-like move
        if ((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)) {
            return true;
        }

        if (gambleBoard[oldRow][oldCol] === 'w') {
            if (Math.abs(newCol - oldCol) === 1 && Math.abs(newRow-oldRow) === 1 && boardState[oldRow][newCol] !== ' ' && boardState[newRow][newCol] === ' ' && ((boardState[oldRow][newCol].toUpperCase() == boardState[oldRow][newCol]) !== isWhite || boardState[oldRow][newCol].toLowerCase() === 'd' || boardState[oldRow][newCol].toLowerCase() === 'x')) {
                return true;
            }
        }

        return false;
    }

    // Bishop moves
    if (pieceType === 'b') {
        if (Math.abs(newRow - oldRow) === Math.abs(newCol - oldCol)) {
            return isPathClear(boardState, oldRow, oldCol, newRow, newCol);
        }

        if (gambleBoard[oldRow][oldCol] === 'w') {
            if (Math.abs(newCol - oldCol) === 1 && Math.abs(newRow-oldRow) === 1 && boardState[oldRow][newCol] !== ' ' && boardState[newRow][newCol] === ' ' && ((boardState[oldRow][newCol].toUpperCase() == boardState[oldRow][newCol]) !== isWhite || boardState[oldRow][newCol].toLowerCase() === 'd' || boardState[oldRow][newCol].toLowerCase() === 'x')) {
                return true;
            }
        }

        return false;
    }

    // Queen moves
    if (pieceType === 'q') {
        if (newRow === oldRow || newCol === oldCol || Math.abs(newRow - oldRow) === Math.abs(newCol - oldCol)) {
            return isPathClear(boardState, oldRow, oldCol, newRow, newCol);
        }

        if (gambleBoard[oldRow][oldCol] === 'w') {
            if (Math.abs(newCol - oldCol) === 1 && Math.abs(newRow-oldRow) === 1 && boardState[oldRow][newCol] !== ' ' && boardState[newRow][newCol] === ' ' && ((boardState[oldRow][newCol].toUpperCase() == boardState[oldRow][newCol]) !== isWhite || boardState[oldRow][newCol].toLowerCase() === 'd' || boardState[oldRow][newCol].toLowerCase() === 'x')) {
                return true;
            }
        }

        return false;
    }

    if (pieceType === 'a') {
        const rowDiff = Math.abs(newRow - oldRow);
        const colDiff = Math.abs(newCol - oldCol);

        if ((rowDiff === colDiff || colDiff === 0 || rowDiff === 0) && (destinationPiece.toLowerCase() === 'r' || destinationPiece.toLowerCase() === 'o' || destinationPiece === ' ')) {
            return true;
        }
        return false;
    }

    // King moves
    if (pieceType === 'k') {
        const rowDiff = Math.abs(newRow - oldRow);
        const colDiff = Math.abs(newCol - oldCol);

        if (gambleBoard[oldRow][oldCol] === 'w') {
            if (Math.abs(newCol - oldCol) === 1 && Math.abs(newRow-oldRow) === 1 && boardState[oldRow][newCol] !== ' ' && boardState[newRow][newCol] === ' ' && ((boardState[oldRow][newCol].toUpperCase() == boardState[oldRow][newCol]) !== isWhite || boardState[oldRow][newCol].toLowerCase() === 'd' || boardState[oldRow][newCol].toLowerCase() === 'x')) {
                return true;
            }
        }

        return (rowDiff <= 1 && colDiff <= 1);
    }

    return false;
}


function select(square, row, col) {
    const piece = initialBoard[row][col];

    console.log(`Selected Piece: ${selectedPiece} | Selected Square: ${selectedSquare} | Selected Old Square: ${selectedOldSquare}`);
    if (selectedOldSquare !== null && selectedSquare == null) {
        console.log('Selecting square')
        if (checkValidMove(gambleBoard, initialBoard, selectedPiece, selectedOldSquare, square)) {
            console.log('Valid move')

            selectedSquare = square;
        } else {
            console.log('Invalid move, resetting');
            if (piece !== ' ' && piece !== 'j' && piece !== 'J') {
                if (currentTurn == null || (piece == piece.toLowerCase()) == currentTurn) {
                    selectedPiece = piece;
                    selectedOldSquare = square;
                }
            } else {
                selectedPiece = null;
                selectedOldSquare = null;
            }
        }
    } else if (selectedOldSquare == null && piece !== ' ' && piece !== 'j' & piece !== 'J') {
        if (currentTurn == null || (piece == piece.toLowerCase()) == currentTurn) {
            console.log(`Selecting piece`);
            selectedOldSquare = square;
            selectedPiece = piece;
        }
    }
    console.log(`Selected Piece: ${selectedPiece} | Selected Square: ${selectedSquare} | Selected Old Square: ${selectedOldSquare}`);
}

function promote(boardState, square) {
    return new Promise((resolve) => {
        const isWhite = (boardState[square.dataset.row][square.dataset.col] == boardState[square.dataset.row][square.dataset.col].toUpperCase());

        const promotionWindow = document.createElement('div');
        promotionWindow.classList.add('promotion');

        ['q', 'o', 'r', 'b', 'n', 'a'].forEach(option => {
            const piece = isWhite ? option.toUpperCase() : option;

            const optionButton = document.createElement('button');
            optionButton.classList.add('promotionButton');

            const img = document.createElement('img');
            if (piece in pieces) { img.src = `https://images.chesscomfiles.com/chess-themes/pieces/${theme}/150/${pieces[piece]}`; }
            else { img.src = `assets/${theme}/${piecesLocal[piece]}`; }
            img.className = 'piece';

            optionButton.appendChild(img);
            promotionWindow.append(optionButton);

            optionButton.addEventListener('click', () => {
                let rowArray = boardState[square.dataset.row].split('');
                rowArray[square.dataset.col] = piece;
                boardState[square.dataset.row] = rowArray.join('');
                promotionWindow.remove();
                const sound = new Audio('assets/audio/promote.wav');
                sound.volume = 0.75;
                sound.play();
                resolve(boardState);
            });
        });
;
        document.body.appendChild(promotionWindow);
    })
}

function toggleRules() {
    const rulesWindow = document.getElementById('rulesWindow');

    if (rulesShown) { rulesWindow.classList.add('invisible'); }
    else { rulesWindow.classList.remove('invisible'); }

    rulesShown = !rulesShown
}

function movePiece(real, gambleBoard, boardToUpdate, piece, oldSquare, newSquare) {
    let newBoard = structuredClone(boardToUpdate);
    let newGambleBoard = structuredClone(gambleBoard)
    
    const oldRow = oldSquare.dataset.row;
    const oldCol = oldSquare.dataset.col;
    const row = newSquare.dataset.row;
    const col = newSquare.dataset.col;
    
    if ((piece.toLowerCase() === 'e' || piece.toLowerCase() === 'p' || gambleBoard[oldRow][oldCol] === 'w') && col !== oldCol && boardToUpdate[row][col] === ' ') {
        newBoard[oldRow] = newBoard[oldRow].substring(0, oldCol) + ' ' + newBoard[oldRow].substring(parseInt(oldCol) + 1);
        newGambleBoard[oldRow] = newGambleBoard[oldRow].substring(0, oldCol) + ' ' + newGambleBoard[oldRow].substring(parseInt(oldCol) + 1);
        newBoard[oldRow] = newBoard[oldRow].substring(0, col) + ' ' + newBoard[oldRow].substring(parseInt(col) + 1); // Remove the captured pawn
    } else if (boardToUpdate[row][col].toLowerCase() === 'c' || boardToUpdate[row][col].toLowerCase() === 'h') {
        for (let r = 0; r < colLength; r++) {
            for (let c = 0; c < rowLength; c++) {
                if (boardToUpdate[r][c].toLowerCase() === 'c' || boardToUpdate[r][c].toLowerCase() === 'h') {
                    newBoard[r] = newBoard[r].substring(0, c) + ' ' + newBoard[r].substring(parseInt(c) + 1);
                }
            }
        }
        newBoard[oldRow] = newBoard[oldRow].substring(0, oldCol) + ' ' + newBoard[oldRow].substring(parseInt(oldCol) + 1);
        newGambleBoard[oldRow] = newGambleBoard[oldRow].substring(0, oldCol) + ' ' + newGambleBoard[oldRow].substring(parseInt(oldCol) + 1);
    } else if (piece.toLowerCase() !== 'd') {
        newBoard[oldRow] = newBoard[oldRow].substring(0, oldCol) + ' ' + newBoard[oldRow].substring(parseInt(oldCol) + 1);
        newGambleBoard[oldRow] = newGambleBoard[oldRow].substring(0, oldCol) + ' ' + newGambleBoard[oldRow].substring(parseInt(oldCol) + 1);
    }
    
    if (piece.toLowerCase() === 'a' && boardToUpdate[row][col] !== ' ') {
        newBoard[row] = newBoard[row].substring(0, col) + ((piece.toLowerCase() === piece) ? 'X' : 'x') + newBoard[row].substring(parseInt(col) + 1);
    } else {
        newBoard[row] = newBoard[row].substring(0, col) + piece + newBoard[row].substring(parseInt(col) + 1);
        if (gambleBoard[oldRow][oldCol] === 'w') {
            newGambleBoard[row] = newGambleBoard[row].substring(0, col) + 'w' + newGambleBoard[row].substring(parseInt(col) + 1);
        } else {
            newGambleBoard[row] = newGambleBoard[row].substring(0, col) + ' ' + newGambleBoard[row].substring(parseInt(col) + 1);
        }
    }
    
    if (real && !mute) {
        let sound = null
        
        if (newBoard[0].toLowerCase().includes('p') || newBoard[(colLength-1)].toLowerCase().includes('p')) {
            // pass
        } else if (inCheck(newBoard)) {
            if (inCheckmate(newGambleBoard, newBoard)) {
                sound = new Audio('assets/audio/checkmate.wav');
            } else {
                sound = new Audio('assets/audio/check.wav');
            }
        } else if (inCheckmate(newGambleBoard, newBoard)) {
            sound = new Audio('assets/audio/stalemate.wav');
        } else if (piece.toLowerCase() === 'a' && boardToUpdate[row][col] !== ' ') {
            sound = new Audio('assets/audio/explode.wav');
        } else if (newBoard.join('').replace(/\s/g, '').length < boardToUpdate.join('').replace(/\s/g, '').length) {
            sound = new Audio('assets/audio/capture.wav');
        } else if (piece.toLowerCase() === 'd') {
            sound = new Audio('assets/audio/duplicate.wav')
        } else {
            sound = new Audio('assets/audio/move.wav')
        }
        
        if (sound) {
            sound.volume = 0.6;
            sound.play()
        }
    }
    
    if (real) { console.log(movesUntilArrival, movesUntilDeparture); }
    
    if (real) { joeBidenTurns--; }
    
    if (real && piece.toLowerCase() !== 'j') {
        if (movesUntilArrival > 0) {
            movesUntilArrival--;
        }
        else if (movesUntilDeparture > 0) {
            movesUntilDeparture--;
        }
    }
    
    return [newGambleBoard, newBoard];
}

function viewBoard() {
    const blurScreen = document.getElementById('blurScreen');
    
    blurScreen.classList.remove('visible');
    
    const viewButton = document.getElementById('viewButton');
    
    viewButton.classList.add('invisible');
}

function gamble() {
    const startSound = new Audio('assets/audio/startGamble.wav');
    startSound.volume = 0.32;
    if (!mute) { startSound.play(); }
    return new Promise((resolve) => {
        const gambleWindow = document.createElement('div');
        gambleWindow.classList.add('gambleWindow');
        
        const gambleGrid = document.createElement('div');
        gambleGrid.classList.add('gambleGrid');

        for (let i = 0; i < 3; i++) {
            const slot = document.createElement('div');
            slot.classList.add('slot');
            slot.id = `slot${i}`;
            
            gambleGrid.append(slot);
            
        }
        
        const spinButton = document.createElement('button');
        spinButton.classList.add('gambleButton');
        spinButton.innerHTML = 'Spin';
        
        const symbols = [
            'orange.png',
            '7.png',
            'lemon.png',
            'cherry.png',
        ]
        
        const spinSound = new Audio('assets/audio/spinGamble.wav');
        const loseSound = new Audio('assets/audio/loseGamble.wav');
        const winSound = new Audio('assets/audio/winGamble.wav');
        
        spinSound.volume = 0.32;
        loseSound.volume = 0.32;
        winSound.volume = 0.32;
        
        let spins = 3;
        
        spinButton.addEventListener('click', () => {
            let symbolsChosen = [];
            
            function randomiseSlots(i, continueCode) {
                setTimeout(() => {
                    let imgs = document.getElementsByClassName('slotSymbol');
                    Array.from(imgs).forEach(img => img.remove());
                    symbolsChosen = [];
                    for (let j = 0; j < 3; j++) {
                        let slotDiv = document.getElementById(`slot${j}`);
                        
                        let symbolChosen = symbols[Math.floor(Math.random() * symbols.length)];
                        
                        symbolsChosen.push(symbolChosen);
                        
                        let img = document.createElement('img');
                        img.classList.add('slotSymbol');
                        img.src = `assets/gambling/${symbolChosen}`;
                        
                        slotDiv.appendChild(img);
                    }
                    console.log(spins);
                    if (continueCode) {
                        setTimeout(() => {
                            console.log(symbolsChosen);
                            if (!symbolsChosen.every(val => val === symbolsChosen[0])) {
                                if (!mute) { loseSound.play(); }
                                if (spins === 0) {
                                    spinButton.remove();
                                    setTimeout(() => {
                                        gambleWindow.remove();
                                        rowloop: for (let r = 0; r < colLength; r++) {
                                            for (let c = 0; c < rowLength; c++) {
                                                if (initialBoard[r][c] === ' ' && lastBoard[r][c] !== ' ') {
                                                    gambleBoard[r] = gambleBoard[r].substring(0, c) + 'l' + gambleBoard[r].substring(parseInt(c) + 1);
                                                    break rowloop;
                                                }
                                            }
                                        }
                                        initialBoard = lastBoard;
                                        resolve();
                                    }, 1200);
                                }
                            } else {
                                spinButton.remove();
                                if (!mute) { winSound.play(); }
                                function changeColor(color, i) {
                                    setTimeout(() => {
                                        gambleWindow.style.backgroundColor = color;
                                    }, 130 * i);
                                }
                                [
                                    'red', 'orange', 'yellow', 'lime', 'aqua',
                                    'fuchsia', 'magenta', 'purple', 'blue', 'cyan',
                                    'green', 'yellowgreen', 'springgreen', 'crimson', 'hotpink',
                                    'deeppink', 'orangered', 'gold', 'darkorange', 'tomato',
                                    'salmon', 'coral', 'mediumvioletred', 'chocolate', 'sandybrown',
                                    'orangered', 'firebrick', 'mediumseagreen', 'lightcoral', 'darkviolet',
                                    'plum', 'violet', 'mediumorchid', 'darkmagenta', 'darkslateblue',
                                    'rebeccapurple', 'slateblue', 'lightsalmon', 'darkturquoise', 'dodgerblue'
                                ].forEach(color => {
                                    changeColor(color, [
                                        'red', 'orange', 'yellow', 'lime', 'aqua',
                                        'fuchsia', 'magenta', 'purple', 'blue', 'cyan',
                                        'green', 'yellowgreen', 'springgreen', 'crimson', 'hotpink',
                                        'deeppink', 'orangered', 'gold', 'darkorange', 'tomato',
                                        'salmon', 'coral', 'mediumvioletred', 'chocolate', 'sandybrown',
                                        'orangered', 'firebrick', 'mediumseagreen', 'lightcoral', 'darkviolet',
                                        'plum', 'violet', 'mediumorchid', 'darkmagenta', 'darkslateblue',
                                        'rebeccapurple', 'slateblue', 'lightsalmon', 'darkturquoise', 'dodgerblue'
                                    ].indexOf(color));
                                })
                                setTimeout(() => {
                                    gambleWindow.remove();
                                    rowloop: for (let r = 0; r < colLength; r++) {
                                        for (let c = 0; c < rowLength; c++) {
                                            if (initialBoard[r][c] === ' ' && lastBoard[r][c] !== ' ') {
                                                gambleBoard[r] = gambleBoard[r].substring(0, c) + 'w' + gambleBoard[r].substring(parseInt(c) + 1);
                                                break rowloop;
                                            }
                                        }
                                    }
                                    initialBoard = lastBoard;
                                    resolve();
                                }, 5200);
                            }
                        }, 112);
                    }
                }, 112 * i);
            }

            spinSound.play();
            randomiseSlots(0, false);
            randomiseSlots(1, false);
            randomiseSlots(2, true);
            spins--;
            
        });

        gambleWindow.appendChild(gambleGrid);
        gambleWindow.appendChild(spinButton);
        document.body.appendChild(gambleWindow);
    });
}

async function updateBoard() {
    if (initialBoard[0].toLowerCase().includes('p') || initialBoard[0].toLowerCase().includes('e')) {
        for (let i = 0; i < rowLength; i++) {
            const piece = initialBoard[0][i]
            if (piece.toLowerCase() == 'p' || piece.toLowerCase() == 'e') {
                initialBoard = await promote(initialBoard, { dataset: { row: 0, col: i } });
                console.log('finished promotion');
            }
        }
    }
    if (initialBoard[(colLength-1)].toLowerCase().includes('p') || initialBoard[(colLength-1)].toLowerCase().includes('e')) {
        for (let i = 0; i < rowLength; i++) {
            const piece = initialBoard[(colLength-1)][i]
            if (piece.toLowerCase() == 'p' || piece.toLowerCase() == 'e') {
                initialBoard = await promote(initialBoard, { dataset: { row: (colLength-1), col: i } });
                console.log('finished promotion');
            }
        }
    }
    if (movesUntilArrival === 0 && movesUntilDeparture === 2 && !trainArrived) {
        console.log('train arrival');

        const sound = new Audio('assets/audio/train.wav');
        sound.volume = 0.6;
        sound.play();
        
        if (initialBoard[(colLength/2)-2].includes('k') || initialBoard[(colLength/2)+1].includes('k')) {
            checkmate = true;
        } else if (initialBoard[(colLength/2)-2].includes('K') || initialBoard[(colLength/2)+1].includes('K')) {
            checkmate = true;
        } else {
            initialBoard[(colLength/2)-2] = ' '.repeat((rowLength/2)-1) + whiteTrainPassengers.join('') + ' '.repeat((rowLength/2)-1);
            initialBoard[(colLength/2)+1] = ' '.repeat((rowLength/2)-1) + blackTrainPassengers.join('') + ' '.repeat((rowLength/2)-1);
        }
        
        trainArrived = true;
    }
    if (movesUntilDeparture === 0 ) {
        console.log('train departure');

        const sound = new Audio('assets/audio/train.wav');
        sound.volume = 0.6;
        sound.play();

        blackTrainPassengers = [initialBoard[(colLength/2)-2][(rowLength/2)-1], initialBoard[(colLength/2)-2][(rowLength/2)]]
        whiteTrainPassengers = [initialBoard[(colLength/2)+1][(rowLength/2)-1], initialBoard[(colLength/2)+1][(rowLength/2)]]

        if (blackTrainPassengers.includes('b') || blackTrainPassengers.includes('B')) {
            let newPassengers = [];
            blackTrainPassengers.forEach(piece => {
                if (piece === 'b' || piece === 'B') {
                    newPassengers.push(' ');
                } else {
                    newPassengers.push(piece);
                }
            })
            blackTrainPassengers = newPassengers;
        }
        if (whiteTrainPassengers.includes('b') || whiteTrainPassengers.includes('B')) {
            let newPassengers = [];
            whiteTrainPassengers.forEach(piece => {
                if (piece === 'b' || piece === 'B') {
                    newPassengers.push(' ');
                } else {
                    newPassengers.push(piece);
                }
            })
            whiteTrainPassengers = newPassengers;
        }
        
        if ((blackTrainPassengers.includes('k') || whiteTrainPassengers.includes('k')) && (blackTrainPassengers.includes('K') || whiteTrainPassengers.includes('K'))) {
            stalemate = true;
        }
        
        initialBoard[(colLength/2)-2] = ' '.repeat(rowLength);
        initialBoard[(colLength/2)+1] = ' '.repeat(rowLength);
        
        movesUntilArrival = 5;
        movesUntilDeparture = 2;
        
        trainArrived = false;
    }
    rowloop: for (let r = (colLength/2)-1; r <= (colLength/2); r++) {
        for (let c = rowLength-2; c < rowLength; c++) {
            let row;
            let col;
            if (flipped) { row = (colLength-r)-1; col = (rowLength-c)-1; }
            else { row = r; col = c; }
            if (initialBoard[row][col] !== ' ' && initialBoard[row][col].toLowerCase() !== 'a' && !casinoCaptured) {
                await gamble();
            } else if (initialBoard[row][col].toLowerCase() === 'a' && !casinoCaptured) {
                casinoCaptured = true;
                for (let xr = (colLength/2)-1; xr <= (colLength/2); xr++) {
                    for (let xc = rowLength-2; xc < rowLength; xc++) {
                        let xrow;
                        let xcol;
                        if (flipped) { xrow = (colLength-xr)-1; xcol = (rowLength-xc)-1; }
                        else { xrow = xr; xcol = xc; }
                        initialBoard[xrow] = initialBoard[xrow].substring(0, xcol) + 'x' + initialBoard[xrow].substring(parseInt(xcol) + 1);
                    }
                }
                break rowloop;
            }
        }
    }
    if (!initialBoard.join('').includes('j')) {
        blackJoeOldSquare = null;
        blackJoeSquare = null;
    }
    if (!initialBoard.join('').includes('J')) {
        whiteJoeOldSquare = null;
        whiteJoeSquare = null;
    }
    if (joeBidenTurns < 1) {
        let bidenSound = null
        if (!bidensStarted) {
            ['j', 'J'].forEach(piece => {
                let row = Math.round(Math.random() * (colLength-1));
                let col = Math.round(Math.random() * (rowLength-1));
                
                while (initialBoard[row][col] == 'k' || initialBoard[row][col] == 'K' || initialBoard[row][col] == 'j' || initialBoard[row][col] == 'J') {
                    row = Math.round(Math.random() * (colLength-1));
                    col = Math.round(Math.random() * (rowLength-1));
                }
                
                if (piece == 'j') { blackJoeSquare = { dataset: { row: row, col: col } } }
                else if (piece == 'J') { whiteJoeSquare = { dataset: { row: row, col: col } } }

                initialBoard[row] = initialBoard[row].substring(0, col) + piece + initialBoard[row].substring(parseInt(col) + 1);
            });
            bidenSound = new Audio('assets/audio/joebiden.wav');
            bidensStarted = true;
        } else {
            if (initialBoard.join('').includes('j')) {
                let row = Math.round(Math.random() * (colLength-1));
                let col = Math.round(Math.random() * (rowLength-1));
                
                while (initialBoard[row][col] == 'k' || initialBoard[row][col] == 'K') {
                    row = Math.round(Math.random() * (colLength-1));
                    col = Math.round(Math.random() * (rowLength-1));
                }

                for (let r = 0; r < rowLength; r++) {
                    for (let c = 0; c < colLength; c++) {
                        if (initialBoard[r][c] === 'j') {
                            blackJoeSquare = { dataset: { row: row, col: col } };
                            [gambleBoard, initialBoard] = movePiece(true, gambleBoard, initialBoard, 'j', { dataset: { row: r, col: c } }, { dataset: { row: row, col: col } });
                        }
                    }
                }
                
                bidenSound = new Audio('assets/audio/joebiden.wav');
            }
            if (initialBoard.join('').includes('J')) {
                let row = Math.round(Math.random() * (colLength-1));
                let col = Math.round(Math.random() * (rowLength-1));
                
                while (initialBoard[row][col] == 'k' || initialBoard[row][col] == 'K') {
                    row = Math.round(Math.random() * (colLength-1));
                    col = Math.round(Math.random() * (rowLength-1));
                }
                
                for (let r = 0; r < colLength; r++) {
                    for (let c = 0; c < rowLength; c++) {
                        if (initialBoard[r][c] === 'J') {
                            whiteJoeOldSquare = whiteJoeSquare;
                            whiteJoeSquare = { dataset: { row: row, col: col } };
                            [gambleBoard, initialBoard] = movePiece(true, gambleBoard, initialBoard, 'J', { dataset: { row: r, col: c } }, { dataset: { row: row, col: col } });
                        }
                    }
                }
                bidenSound = new Audio('assets/audio/joebiden.wav');
            }
        }
        if (!mute && bidenSound) { bidenSound.play(); }
        joeBidenTurns = 5;
    }
    const board = document.getElementById('chessboard').children;
    if (!checkmate && !stalemate && inCheck(initialBoard)) {
        if (inCheckmate(gambleBoard, initialBoard)) {
            checkmate = true;
            document.body.classList.add('check');
        } else {
            check = true;
            document.body.classList.add('check');
        }
    } else if (!checkmate && !stalemate && inCheckmate(gambleBoard, initialBoard)) {
        stalemate = true;
        document.body.classList.add('check');
    } else {
        check = false;
        document.body.classList.remove('check');
    }
    for (let i = 0; i < board.length; i++) {
        const square = board[i];
        square.innerHTML = '';
        const row = square.dataset.row;
        const col = square.dataset.col;
        const piece = initialBoard[row][col];
        if (movesUntilArrival === 0) {
            const img = document.createElement('img');
            if ((square.dataset.row == (colLength/2-2)) && (square.dataset.col == (rowLength/2)-1)) { img.src = `assets/${theme}/blt.png`; }
            if ((square.dataset.row == (colLength/2-2)) && (square.dataset.col == (rowLength/2))) { img.src = `assets/${theme}/brt.png`; }
            if ((square.dataset.row == (colLength/2+1)) && (square.dataset.col == (rowLength/2)-1)) { img.src = `assets/${theme}/wlt.png`; }
            if ((square.dataset.row == (colLength/2+1)) && (square.dataset.col == (rowLength/2))) { img.src = `assets/${theme}/wrt.png`; }
            img.className = 'piece';
            if (img.src !== '') {
                square.appendChild(img);
            }
            console.log('drawing train');
        }
        if (!casinoCaptured) {
            const img = document.createElement('img');
            img.className = 'piece';
            if (!flipped && parseInt(row) === (colLength / 2) - 1 && parseInt(col) === rowLength - 2) {
                img.src = 'assets/gambling/tli.png';
            } else if (!flipped && parseInt(row) === (colLength / 2) && parseInt(col) === rowLength - 2) {
                img.src = 'assets/gambling/bli.png';
            } else if (!flipped && parseInt(row) === (colLength / 2) - 1 && parseInt(col) === rowLength - 1) {
                img.src = 'assets/gambling/tri.png';
            } else if (!flipped && parseInt(row) === (colLength / 2) && parseInt(col) === rowLength - 1) {
                img.src = 'assets/gambling/bri.png';
            } else if (flipped && parseInt(row) === (colLength / 2) - 1 && parseInt(col) === 0) {
                img.src = 'assets/gambling/tli.png';
            } else if (flipped && parseInt(row) === (colLength / 2) && parseInt(col) === 0) {
                img.src = 'assets/gambling/bli.png';
            } else if (flipped && parseInt(row) === (colLength / 2) - 1 && parseInt(col) === 1) {
                img.src = 'assets/gambling/tri.png';
            } else if (flipped && parseInt(row) === (colLength / 2) && parseInt(col) === 1) {
                img.src = 'assets/gambling/bri.png';
            }            
            if (img.src !== '') {
                square.appendChild(img);
            }
        }
        if (piece !== ' ') {
            const img = document.createElement('img');
            let pieceSrc;
            if (piece in pieces) {
                pieceSrc = pieces[piece];
                img.src = `https://images.chesscomfiles.com/chess-themes/pieces/${theme}/150/${pieceSrc}`;
            } else {
                pieceSrc = piecesLocal[piece];
                if (['c', 'h'].includes(piece.toLowerCase())) {
                    pieceSrc = flipSauce(pieceSrc);
                }
                img.src = `assets/${theme}/${pieceSrc}`;
            }
            img.className = 'piece';
            square.appendChild(img);
        }
        if (selectedOldSquare) {
            if (square.dataset.row == selectedOldSquare.dataset.row && square.dataset.col == selectedOldSquare.dataset.col) {
                square.classList.add('yellow');
            } else {
                square.classList.remove('yellow');
            }
        }
        if (lastSelectedOldSquare && lastSelectedSquare) {
            if ((square.dataset.row == lastSelectedOldSquare.dataset.row && square.dataset.col == lastSelectedOldSquare.dataset.col) || (square.dataset.row == lastSelectedSquare.dataset.row && square.dataset.col == lastSelectedSquare.dataset.col)) {
                square.classList.add('green');
            } else {
                square.classList.remove('green');
            }
        }
        if (blackJoeSquare) {
            if (square.dataset.row == blackJoeSquare.dataset.row && square.dataset.col == blackJoeSquare.dataset.col) {
                square.classList.add('red');
            }
        }
        if (whiteJoeSquare) {
            if (square.dataset.row == whiteJoeSquare.dataset.row && square.dataset.col == whiteJoeSquare.dataset.col) {
                square.classList.add('blue');
            }
        }
        if (blackJoeOldSquare) {
            if (square.dataset.row == blackJoeOldSquare.dataset.row && square.dataset.col == blackJoeOldSquare.dataset.col) {
                square.classList.add('red');
            }
        }
        if (whiteJoeOldSquare) {
            if (square.dataset.row == whiteJoeOldSquare.dataset.row && square.dataset.col == whiteJoeOldSquare.dataset.col) {
                square.classList.add('blue');
            }
        }
        if (joeBidenTurns < 5 || firstMove) {
            square.classList.remove('red');
            square.classList.remove('blue');
        }
        if (selectedPiece !== null && selectedOldSquare !== null) {
            if (checkValidMove(gambleBoard, initialBoard, selectedPiece, selectedOldSquare, square)) {
                const dot = document.createElement('div');
                dot.classList.add('dot');
                square.appendChild(dot);
            }
        }
    }
    if (checkmate || stalemate) {
        let winningText = '';
        if (inCheck(initialBoard) == 'white') {
            winningText = 'Black wins';
        } else if (inCheck(initialBoard) == 'black') {
            winningText = 'White wins';
        } else {
            winningText = 'Stalemate'
        }
        
        const blurScreen = document.getElementById('blurScreen');

        blurScreen.classList.add('visible')
        blurScreen.innerHTML = winningText;

        const viewButton = document.getElementById('viewButton');
        const rulesButton = document.getElementById('rulesButton');

        rulesButton.classList.add('invisible');
        viewButton.classList.remove('invisible');
    }
}

createBoard();
updateBoard();