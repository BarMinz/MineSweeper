'use strict'

const MINE = '💣'
const EMPTY = ' '
const FLAG = '🚩'

var gGame
var gLevel = {
    SIZE: 4,
    MINES: 2,
    LIVES: 1,
    MAX_LIVES: 1,
}
var gTimer = null
var gBoard

function onInit() {
    gLevel.LIVES = gLevel.MAX_LIVES
    resetTimer()
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        firstClick: true,
    }
    closeModal()
    resetText()
    gBoard = buildBoard()
    renderBoard(gBoard)
    setMinesNegsCount()
}

function resetText() {
    var elSpanShown = document.querySelector('.shownCounter')
    elSpanShown.innerText = gGame.shownCount
    var elSpanMarked = document.querySelector('.markedCounter')
    elSpanMarked.innerText = gGame.markedCount
    var elBtn = document.querySelector('.restart-btn')
    elBtn.innerText = '😀'
    const elLives = document.querySelector(`.lives`)
    elLives.innerText = gLevel.LIVES
}

function buildBoard() {
    const board = []
    // Build an Empty Board, As the tip suggests
    for (var i = 0; i < gLevel.SIZE; i++) {
        board.push([])

        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = createCell()
        }
    }

    board[0][3].isMine = true
    board[1][1].isMine = true
    console.log('board:', board)
    return board
}

function createCell() {
    var cell = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isFlagged: false,
        isMine: false,
    }
    return cell
}

function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {

            const cell = board[i][j]
            const className = `hidden cell-${i}-${j}`
            if (cell.minesAroundCount === 0) {
                strHTML += `<td class="${className}" onclick="handleClick(event)" oncontextmenu="handleFlag(event)"></td>`
            } else if (cell.isMine) {
                strHTML += `<td class="${className}" onclick="handleClick(event)" oncontextmenu="handleFlag(event)">${MINE}</td>`
            } else {
                strHTML += `<td class="${className}" onclick="handleClick(event)" oncontextmenu="handleFlag(event)">${cell}</td>`
            }
        }
        strHTML += '</tr>'
    }
    const elContainer = document.querySelector('.board')
    elContainer.innerHTML = strHTML
}


function setRandomMines() {
    for (var i = 0; i < gLevel.MINES; i++) {
        var emptyLocations = getEmptyLocation(gBoard)
        if (emptyLocations === null) return
        gBoard[emptyLocations.i][emptyLocations.j].isMine = true
    }
}

function setMinesNegsCount() {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            var counter = countNeighbors(i, j)
            if (counter === 0) continue
            else gBoard[i][j].minesAroundCount = counter
        }
    }
}

function checkGameOver() {
    if (gLevel.LIVES === 0) {
        showMines()
        clearInterval(gTimer)
        gTimer = null
        gGame.isOn = false
        var msg = 'Game Over'
        openModal(msg)
        var elBtn = document.querySelector('.restart-btn')
        elBtn.innerText = '🤯'
    } else if (checkVictory()) {
        clearInterval(gTimer)
        gTimer = null
        gGame.isOn = false
        var msg = 'Victrious!'
        openModal(msg)
        var elBtn = document.querySelector('.restart-btn')
        elBtn.innerText = '😎'
        if (typeof (Storage) !== "undefined") {
            if (sessionStorage.secsPassed) {
                sessionStorage.secsPassed = gGame.secsPassed;
            } else {
                sessionStorage.secsPassed = gGame.secsPassed;
            }
            document.querySelector('.leaderboard').innerHTML += `<tr class="leaderboardtr"><th class="leaderboardth">1</th><td class="leaderboardtd">Swiftwind</td><td class="leaderboardtd">${gGame.secsPassed}</td></tr>`;
        } else {
            document.querySelector('.leaderboard').innerHTML = "Sorry, your browser does not support web storage...";
        }
    }
}

function handleClick(elClick) {
    if (!gGame.isOn) return;
    var location = getCellLocationFromClick(elClick)
    if (gGame.firstClick) {
        gGame.firstClick = false
        gTimer = setInterval(renderTimer, 1000)
        //setRandomMines()
        setMinesNegsCount()
        renderMineNegs(location)
        updateShownCounter()
    }

    const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
    elCell.classList.replace('hidden', 'revelead')
    gBoard[location.i][location.j].isShown = true
    if (gBoard[location.i][location.j].isFlagged) return;

    if (gBoard[location.i][location.j].isMine) {
        handleMine(elCell)
        renderCell(location, MINE)
        updateShownCounter()
        return;
    }

    if (!gBoard[location.i][location.j].minesAroundCount) {
        renderMineNegs(location)
    } else {
        renderCell(location, gBoard[location.i][location.j].minesAroundCount)
        updateShownCounter()
    }
    checkGameOver()
    if (!gBoard[location.i][location.j].isShown) return;
    gBoard[location.i][location.j].isShown = true
    updateShownCounter()
}

function updateShownCounter() {
    var counter = 0
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            // Find all mines first
            if (gBoard[i][j].isShown) {
                counter++
            }

        }
    }
    gGame.shownCount = counter
    var elSpanShown = document.querySelector('.shownCounter')
    elSpanShown.innerText = gGame.shownCount
}


function handleMine(elCell) {
    const elLives = document.querySelector(`.lives`)
    var elBtn = document.querySelector('.restart-btn')
    elBtn.innerText = '🤯'
    gLevel.LIVES--
    elLives.innerText = gLevel.LIVES
    elCell.classList.replace('hidden', 'revelead')
    checkGameOver()
}

function renderMineNegs(location) {
    if (location.i < 0 || location.i >= gBoard.length) return;
    if (location.j < 0 || location.j >= gBoard[0].length) return;
    var near = findNearBy(location.i, location.j)
    for (var i = 0; i < near.length; i++) {
        var loc = {
            i: near[i].i,
            j: near[i].j
        }
        var cell = document.querySelector(`.cell-${loc.i}-${loc.j}`)
        if (!gBoard[near[i].i][near[i].j].isMine) {
            gBoard[near[i].i][near[i].j].isShown = true
            cell.classList.replace('hidden', 'revelead')
            renderCell(loc, EMPTY)
        }
        if (gBoard[near[i].i][near[i].j].minesAroundCount) return renderCell(loc, gBoard[near[i].i][near[i].j].minesAroundCount)
    }
}

//Finished Flagged Logic(Handling Left click without having context menu inside the table)
function handleFlag(elClick) {
    if (!gGame.isOn) return;
    var location = getCellLocationFromClick(elClick)
    var isFlagged = gBoard[location.i][location.j].isFlagged
    const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
    if (isFlagged) {
        gGame.markedCount--
        gBoard[location.i][location.j].isFlagged = false
        elCell.classList.replace('flagged', 'hidden')
        renderCell(location, EMPTY)
    } else {
        gGame.markedCount++
        gBoard[location.i][location.j].isFlagged = true
        elCell.classList.replace('hidden', 'flagged')
        renderCell(location, FLAG)
    }
    var elSpanMarked = document.querySelector('.markedCounter')
    elSpanMarked.innerText = gGame.markedCount
}
//Finished Flagged Logic


function renderCell(location, value) {
    const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
    elCell.innerHTML = value
}

// Game Over Modal
function openModal(msg) {
    const elModal = document.querySelector('.modal')
    const elMsg = elModal.querySelector('.msg')
    elMsg.innerText = msg
    elModal.style.display = 'block'
}

function closeModal() {
    const elModal = document.querySelector('.modal')
    elModal.style.display = 'none'
}


//Timer
function renderTimer() {
    var elSpanSec = document.querySelector(".seconds");
    var elSpanMin = document.querySelector(".minutes");
    ++gGame.secsPassed;
    elSpanSec.innerHTML = gGame.secsPassed % 60
    elSpanMin.innerHTML = pad(parseInt(gGame.secsPassed / 60)) + ":";
}

function pad(val) {
    var valString = val + "";
    if (valString.length < 2) {
        return "0" + valString;
    } else {
        return valString;
    }
}

function resetTimer() {
    clearInterval(gTimer)
    gTimer = null
    var elSpanSec = document.querySelector(".seconds");
    var elSpanMin = document.querySelector(".minutes");
    elSpanSec.innerHTML = ''
    elSpanMin.innerHTML = ''
}
//Timer


// Difficulty Handling


function handleDiffculty(difficulty) {
    if (difficulty === 'Easy') {
        gLevel = {
            SIZE: 4,
            MINES: 2,
            LIVES: 1,
            MAX_LIVES: 1,
        }
    } else if (difficulty === 'Medium') {
        gLevel = {
            SIZE: 8,
            MINES: 14,
            LIVES: 3,
            MAX_LIVES: 3,
        }
    } else if (difficulty === 'Hard') {
        gLevel = {
            SIZE: 12,
            MINES: 32,
            LIVES: 3,
            MAX_LIVES: 3,
        }
    }
    onInit()
}

// Check Victory?

function checkVictory() {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (!gBoard[i][j].isMine && !gBoard[i][j].isShown) {
                return false
            }
        }
    }
    return true;

}


//Show the Mines on Death 

function showMines() {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            // Find all mines first
            if (gBoard[i][j].isMine) {
                var location = {
                    i: i,
                    j: j
                }
                // Update Their cell value
                gBoard[i][j].isShown = true
                renderCell(location, MINE)
                var cell = document.querySelector(`.cell-${location.i}-${location.j}`)
                cell.classList.replace('hidden', 'revelead')
            }

        }
    }
}