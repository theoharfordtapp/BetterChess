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
}

let initialBoard = [
    'onbqkbnr',
    'pppppppp',
    '        ',
    '        ',
    '        ',
    '        ',
    'PPPPPPPP',
    'RNBQKBNO'
];

let selectedPiece = null;
let selectedOldSquare = null;
let selectedSquare = null;

let currentTurn = null;
let check = false;
let checkmate = false;

let enPassantTargetSquare = null;

let flipped = false;

let mute = false;
let theme = 'neo';

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
                if (piece in pieces) { img.src = `https://images.chesscomfiles.com/chess-themes/pieces/${theme}/150/${pieces[piece]}`; }
                else { img.src = `assets/${theme}/${piecesLocal[piece]}`; }
                img.className = 'piece';
                board[row * 8 + col].appendChild(img);
            }
        }
    }
}

function toggleTheme() {
    theme = (theme == 'neo') ? 'classic' : 'neo';

    updateBoard();
}

function toggleMute() {
    mute = (mute) ? false : true;

    const muteButton = document.getElementById('mute');
    muteButton.innerHTML = mute ? 'Unmute' : 'Mute';
    
    updateBoard();
}

function flipBoard() {
    let newBoard = [];

    initialBoard.forEach(row => {
        const rowArray = row.split('');
        const rowArrayReversed = rowArray.reverse();
        const rowReversed = rowArrayReversed.join('');
        newBoard.push(rowReversed);
    })

    newBoard = newBoard.reverse();

    initialBoard = structuredClone(newBoard);

    if (enPassantTargetSquare) {
        const newSquare = { dataset: { row: 7 - enPassantTargetSquare.dataset.row, col: 7 - enPassantTargetSquare.dataset.col } };
        enPassantTargetSquare = newSquare;
    }

    if (selectedOldSquare) {
        selectedOldSquare = null;
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
        
        initialBoard = movePiece(true, initialBoard, selectedPiece, selectedOldSquare, selectedSquare);
        updateBoard();
        
        // Reset en passant tracking
        enPassantTargetSquare = null;
        
        // Track potential en passant targets
        if (selectedPiece.toLowerCase() === 'p' && Math.abs(newRow - oldRow) === 2) {
            enPassantTargetSquare = { dataset: { row: (oldRow + newRow) / 2, col: newCol } };
        }
        
        console.log(`Moved ${selectedPiece} from ${selectedOldSquare} to ${selectedSquare}`);
        currentTurn = !(selectedPiece == selectedPiece.toLowerCase());
        selectedPiece = null;
        selectedOldSquare = null;
        selectedSquare = null;
    } else {
        console.log(`Selected ${selectedPiece}`);
    }

    updateBoard();
}

function hasAnyMoves(boardState, square) {
    const piece = boardState[square.dataset.row][square.dataset.col];
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (checkValidMove(boardState, false, piece, square, { dataset: { row: row, col: col } })) {
                return true;
            }
        }
    }
    return false;
}

function inCheckmate(boardState) {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (hasAnyMoves(boardState, { dataset: { row: row, col: col } })) {
                return false;
            }
        }
    }
    return true;
}

// Find the king's position for a given team
function findKing(boardState, isWhite) {
    const kingChar = isWhite ? 'K' : 'k';
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
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
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = boardState[r][c];
                if (piece !== ' ' && (piece === piece.toUpperCase()) !== isWhite) {
                    if (checkValidMove(boardState, true, piece, { dataset: { row: r, col: c } }, { dataset: { row: row, col: col } })) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    // Find both kings
    const whiteKingPos = findKing(boardState, true);
    const blackKingPos = findKing(boardState, false);

    if (whiteKingPos === null || blackKingPos === null) {
        throw new Error("King not found on the board!");
    }

    // Check if either king's position is under attack
    const whiteKingInCheck = isUnderAttack(whiteKingPos.dataset.row, whiteKingPos.dataset.col, true);
    const blackKingInCheck = isUnderAttack(blackKingPos.dataset.row, blackKingPos.dataset.col, false);

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


function checkValidMove(boardState, testingCheck, piece, oldSquare, newSquare) {
    const oldRow = parseInt(oldSquare.dataset.row);
    const oldCol = parseInt(oldSquare.dataset.col);
    const newRow = parseInt(newSquare.dataset.row);
    const newCol = parseInt(newSquare.dataset.col);

    const pieceType = piece.toLowerCase();
    const isWhite = (piece == piece.toUpperCase());

    // Helper function to check if the path is clear for rooks, bishops, and queens
    function isPathClear(startRow, startCol, endRow, endCol) {
        const rowDiff = endRow - startRow;
        const colDiff = endCol - startCol;
        const stepRow = rowDiff === 0 ? 0 : rowDiff / Math.abs(rowDiff);
        const stepCol = colDiff === 0 ? 0 : colDiff / Math.abs(colDiff);
    
        let row = startRow + stepRow;
        let col = startCol + stepCol;
    
        while (row !== endRow || col !== endCol) {
            if (row < 0 || row > 7 || col < 0 || col > 7) {
                return false; // Out of bounds
            }
            console.log(row, col);
            console.log(boardState[row][col]); // this line specifically
            if (boardState[row][col] !== ' ') {
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
    const destinationPiece = boardState[newRow][newCol];
    const destinationIsWhite = destinationPiece === destinationPiece.toUpperCase();

    // If destination is occupied by the same colour, return false
    if (destinationPiece !== ' ' && isWhite === destinationIsWhite) {
        return false;
    }

    if (!testingCheck && (boardState[newRow][newCol] == 'K' || boardState[newRow][newCol] == 'k')) {
        return false;
    }
    
    if (!testingCheck) {
        throwawayBoard = structuredClone(boardState);
        hypothetical = movePiece(false, throwawayBoard, piece, oldSquare, newSquare);
        
        if ((inCheck(hypothetical) == 'white' && isWhite) || (inCheck(hypothetical) == 'black' && !isWhite)) {
            return false;
        }
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
            if (newRow === oldRow + 2 * direction && oldRow === (flipped ? (isWhite ? 1 : 6) : (isWhite ? 6 : 1)) && boardState[newRow - direction][newCol] === ' ' && boardState[newRow][newCol] === ' ') {
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
    
    // Knook moves
    if (pieceType === 'o') {
        const rowDiff = Math.abs(newRow - oldRow);
        const colDiff = Math.abs(newCol - oldCol);
    
        // Rook-like move
        if (newRow === oldRow || newCol === oldCol) {
            return isPathClear(oldRow, oldCol, newRow, newCol);
        }
        
        // Knight-like move
        if ((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)) {
            return true;
        }
        
        return false;
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
        if (checkValidMove(initialBoard, false, selectedPiece, selectedOldSquare, square) == true) {
            console.log(`Selecting square`);
            selectedSquare = square;
        } else {
            console.log('Invalid move, resetting');
            if (piece !== ' ') {
                if (currentTurn == null || (piece == piece.toLowerCase()) == currentTurn) {
                    selectedPiece = piece;
                    selectedOldSquare = square;
                }
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

function movePiece(real, boardToUpdate, piece, oldSquare, newSquare) {
    const newBoard = structuredClone(boardToUpdate);
    console.log(newBoard)
    
    const oldRow = oldSquare.dataset.row;
    const oldCol = oldSquare.dataset.col;
    const row = newSquare.dataset.row;
    const col = newSquare.dataset.col;
    
    // Handle en passant capture
    if (real && piece.toLowerCase() === 'p' && col !== oldCol && newBoard[row][col] === ' ') {
        newBoard[oldRow] = newBoard[oldRow].substring(0, oldCol) + ' ' + newBoard[oldRow].substring(parseInt(oldCol) + 1);
        newBoard[oldRow] = newBoard[oldRow].substring(0, col) + ' ' + newBoard[oldRow].substring(parseInt(col) + 1); // Remove the captured pawn
    } else {
        newBoard[oldRow] = newBoard[oldRow].substring(0, oldCol) + ' ' + newBoard[oldRow].substring(parseInt(oldCol) + 1);
    }
    
    newBoard[row] = newBoard[row].substring(0, col) + piece + newBoard[row].substring(parseInt(col) + 1);

    if (real && !mute) {
        let sound = null

        if (inCheck(newBoard)) {
            if (inCheckmate(newBoard)) {
                sound = new Audio('assets/audio/checkmate.wav');
            } else {
                sound = new Audio('assets/audio/check.wav');
            }
        } else if (newBoard.join('').replace(/\s/g, '').length !== boardToUpdate.join('').replace(/\s/g, '').length) {
            sound = new Audio('assets/audio/capture.wav');
        } else {
            sound = new Audio('assets/audio/move.wav')
        }

        sound.volume = 0.2;
        sound.play()
    }
    
    return newBoard;
}

function viewBoard() {
    const blurScreen = document.getElementById('blurScreen');
    
    blurScreen.classList.remove('visible');

    const viewButton = document.getElementById('viewButton');
    
    viewButton.classList.add('invisible');
}

function updateBoard() {
    const board = document.getElementById('chessboard').children;
    if (inCheck(initialBoard)) {
        if (inCheckmate(initialBoard)) {
            checkmate = true;
            document.body.classList.add('check');
        } else {
            check = true;
            document.body.classList.add('check');
        }
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
        if (piece !== ' ') {
            const img = document.createElement('img');
            if (piece in pieces) { img.src = `https://images.chesscomfiles.com/chess-themes/pieces/${theme}/150/${pieces[piece]}`; }
            else { img.src = `assets/${theme}/${piecesLocal[piece]}`; }
            img.className = 'piece';
            square.appendChild(img);
        }
        if (square == selectedOldSquare) {
            square.classList.add('highlighted');
        } else {
            square.classList.remove('highlighted');
        }

        if (selectedPiece !== null && selectedOldSquare !== null) {
            if (checkValidMove(initialBoard, false, selectedPiece, selectedOldSquare, square)) {
                const dot = document.createElement('div');
                dot.classList.add('dot');
                square.appendChild(dot);
            }
        }
    }
    if (checkmate) {
        let winner = '';
        if (inCheck(initialBoard) == 'white') {
            winner = 'Black';
        } else {
            winner = 'White';
        }
        
        const blurScreen = document.getElementById('blurScreen');

        blurScreen.classList.add('visible')
        blurScreen.innerHTML = `${winner} wins!`;

        const viewButton = document.getElementById('viewButton');

        viewButton.classList.remove('invisible');
    }
}

createBoard();
placePieces();