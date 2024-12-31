import {data} from './data.js';

let completedLevels = JSON.parse(localStorage.getItem('levels'));

if (completedLevels) {
    completedLevels.sort((a, b) => a - b);
} else {
    completedLevels = [];
}

let currentLevel = 1;
completedLevels.forEach(num => num === currentLevel ? currentLevel++ : null);

let levelData = data[currentLevel];

const boardSetup = {
    rows: levelData.rows,
    cols: levelData.cols,
    mines: levelData.mines,
    availableFlags: levelData.mines
};

let gameWin = false;
let gameOver = false;

const gameBoard = document.getElementById('gameBoard');
const againBtn = document.getElementById('restartGame');
const newBtn = document.getElementById('newGame');
const flagsCounter = document.getElementById('flagsCounter');
const levelSelector = document.getElementById('levelSelect');
const levelImage = document.getElementById('levelImage');

let board = [];

function initializeBoard() {
    const {rows: numRows, cols: numCols, mines: numMines} = boardSetup;
    gameBoard.style.cssText = `grid-template-rows: repeat(${numRows}, 1fr); grid-template-columns: repeat(${numCols}, 1fr)`;
    levelImage.src = `../assets/img/${currentLevel}.png`;
    levelSelector.value = `${currentLevel}`;

    for (let i = 0; i < numRows; i++) {
        board[i] = [];
        for (let j = 0; j < numCols; j++) {
            board[i][j] = {
                isMine: false,
                revealed: false,
                flagged: false,
                count: 0,
            };
        }
    }

  // Place mines randomly
    let minesPlaced = 0;
    while (minesPlaced < numMines) {
        const row = Math.floor(Math.random() * numRows);
        const col = Math.floor(Math.random() * numCols);
        if (!board[row][col].isMine) {
            board[row][col].isMine = true;
            minesPlaced++;
        }
    }

  // Calculate counts
    for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numCols; j++) {
            if (!board[i][j].isMine) {
                let count = 0;
                for (let dx = -1; dx <= 1; dx++) {
                    for (let dy = -1; dy <= 1; dy++) {
                        const ni = i + dx;
                        const nj = j + dy;
                        if (
                            ni >= 0 &&
                            ni < numRows &&
                            nj >= 0 &&
                            nj < numCols &&
                            board[ni][nj].isMine
                        ) {
                            count++;
                        }
                    }
                }
                board[i][j].count = count;
            }
        }
    }
}

function revealCell(row, col) {
    if (
        row < 0 ||
        row >= boardSetup.rows ||
        col < 0 ||
        col >= boardSetup.cols ||
        board[row][col].revealed
    ) {
        return;
    }

    const cell = board[row][col];

    if (cell.isMine) {
        gameOver = true;
        gameBoard.classList.add('lose');
        return;
    }

    cell.revealed = true;

    if (cell.flagged && !cell.isMine) {
        cell.flagged = false;
        boardSetup.availableFlags++;
    }

    if (cell.count === 0) {
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                revealCell(row + dx, col + dy);
            }
        }
    }
}

function renderBoard() {
    const {rows: numRows, cols: numCols, mines: numMines, availableFlags} = boardSetup;
    let revealedCells = 0;
    gameBoard.innerHTML = '';
    flagsCounter.textContent = availableFlags;

    for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numCols; j++) {
            const { revealed, flagged, count, isMine } = board[i][j];
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.x = i;
            cell.dataset.y = j;
            
            if (revealed) {
                cell.classList.add('revealed');
                revealedCells++;
                if (count > 0) {
                    cell.textContent = count;
                }
            } else if (flagged) {
                cell.classList.add('flag');
                cell.textContent = '🏳️‍🌈';
            }
            
            if (gameOver && isMine) {
                cell.classList.add('mine');
                if (!flagged) {
                    cell.textContent = '💩';
                }
            }
            
            gameBoard.appendChild(cell);
        }
    }

    if (numRows * numCols - revealedCells === numMines) {
        gameWin = true;
        gameBoard.classList.add('win');
        if (!completedLevels.includes(currentLevel)) {
            completedLevels.push(currentLevel);
            localStorage.setItem('levels', JSON.stringify(completedLevels));
        }
        
        if (currentLevel === 10) {
            newBtn.textContent = 'view rewards'
        }
    }
}

const checkCell = (el) => !gameOver && !gameWin && el.classList.contains('cell');

gameBoard.addEventListener('click', (event) => {
    if (checkCell(event.target)) {
        const { x, y } = event.target.dataset;
        revealCell(+x, +y);
        renderBoard();
    }
});

gameBoard.addEventListener('contextmenu', function (event) {
    event.preventDefault();
    if (checkCell(event.target)) {
        const { x, y } = event.target.dataset;
        if (!board[x][y].revealed) {
            board[x][y].flagged = !board[x][y].flagged;
            board[x][y].flagged ? boardSetup.availableFlags-- : boardSetup.availableFlags++;
        }

        renderBoard();
    }
});

againBtn.addEventListener('click', () => restartGame());

newBtn.addEventListener('click', () => nextGame());

levelSelector.addEventListener('change', (event) => changeLevel(+event.target.value));

function startGame() {
    initializeBoard();
    renderBoard();
}

function restartGame() {
    boardSetup.availableFlags = levelData.mines;
    gameOver = false;
    gameWin = false;
    gameBoard.classList.remove('lose');
    
    startGame();
}

function nextGame() {
    if (currentLevel === 10) {
        window.location.href = '../rewards/';
    } else {
        gameBoard.classList.remove('win');
        changeLevel(currentLevel + 1);
    }
}

function changeLevel(level) {
    currentLevel = level;
    levelData = data[currentLevel];
    boardSetup.rows = levelData.rows;
    boardSetup.cols = levelData.cols;
    boardSetup.mines = levelData.mines;
    boardSetup.availableFlags = levelData.mines;
    gameOver = false;
    gameWin = false;

    startGame();
}

startGame();