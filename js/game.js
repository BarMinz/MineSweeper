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
var gVictors = []
var gDiffculty = 'Easy'

function onInit() {
    gLevel.LIVES = gLevel.MAX_LIVES
    resetTimer()
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        firstClick: true,
        isClickHint: false,
    }
    closeModal()
    resetElements()
    gBoard = buildBoard()
    renderBoard(gBoard)
    setMinesNegsCount()
    loadLeaderboard()
}

function resetElements() {
    var elSpanShown = document.querySelector('.shownCounter')
    elSpanShown.innerText = ` ${gGame.shownCount}`
    var elSpanMarked = document.querySelector('.markedCounter')
    elSpanMarked.innerText = ` ${gGame.markedCount}`
    var elBtn = document.querySelector('.restart-btn')
    elBtn.innerText = '😀'
    const elLives = document.querySelector(`.lives`)
    elLives.innerText = ` ${gLevel.LIVES}`
    var elBtn = document.querySelector('.hint-container button')
    elBtn.style.visibility = 'visible'
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

    //board[0][3].isMine = true
    //board[1][1].isMine = true
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
        var name = prompt('Enter your name')
        loadLeaderboard(name)
    }
}

function loadLeaderboard(name) {
    var rank = 0
    var victor = {
        name: name,
        score: gGame.secsPassed,
        difficulty: gDiffculty,
    }
    var strHTML = ''
    if (name) gVictors.push(victor)
    gVictors.sort((a, b) => a.score - b.score)
    if (typeof (Storage) !== "undefined") {
        if (sessionStorage.secsPassed) {
            sessionStorage.secsPassed = gGame.secsPassed;
        } else {
            sessionStorage.secsPassed = gGame.secsPassed;
        }
        for (var i = 0; i < gVictors.length; i++) {
            if (gVictors[i].difficulty === gDiffculty) {
                rank++
                strHTML += '<tr class="leaderboardtr">'
                strHTML += `<th class="leaderboardth">${rank}</th><td class="leaderboardtd">${gVictors[i].name}</td><td class="leaderboardtd">${gVictors[i].score}</td><td class="leaderboardtd">${gVictors[i].difficulty}</td>`;
                strHTML += '</tr>'
            } else continue
        }
        document.querySelector('.leaderboardbody').innerHTML = strHTML
    } else {
        document.querySelector('.leaderboardbody').innerHTML = "Sorry, your browser does not support web storage...";
    }
}

function handleClick(elClick) {
    if (!gGame.isOn) return;
    var location = getCellLocationFromClick(elClick)
    if (gGame.firstClick) {
        gGame.firstClick = false
        gTimer = setInterval(renderTimer, 1000)
        gBoard[location.i][location.j].isShown = true
        const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
        elCell.classList.replace('hidden', 'revelead')
        setRandomMines()
        setMinesNegsCount()
        renderMineNegs(location)
        updateShownCounter()
        return
    }
    if (gGame.isClickHint) {
        gGame.isClickHint = false
        revealNegs(location.i, location.j)
        setTimeout(() => {
            hideNegs(location.i, location.j)
        }, 1000)
        return;
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
        if (gBoard[near[i].i][near[i].j].minesAroundCount) renderCell(loc, gBoard[near[i].i][near[i].j].minesAroundCount)
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
    gDiffculty = difficulty
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

// Handle Hints 

function handleHint(elBtn) {
    if (gGame.firstClick) return
    elBtn.style.visibility = 'hidden'
    // Implement change background color of button to yellow 
    gGame.isClickHint = true

}


function revealNegs(cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue
            var elCell = document.querySelector(`.cell-${i}-${j}`)
            if (elCell.classList[0] === 'revelead') continue
            elCell.classList.replace('hidden', 'revelead')
            if (gBoard[i][j].minesAroundCount) renderCell({
                i: i,
                j: j
            }, gBoard[i][j].minesAroundCount)
        }
    }
}

function hideNegs(cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue
            var elCell = document.querySelector(`.cell-${i}-${j}`)

            if (gBoard[i][j].minesAroundCount && !gBoard[i][j].isShown) {
                elCell.classList.replace('revelead', 'hidden')
                renderCell({
                    i: i,
                    j: j
                }, EMPTY)
            }
            if(!gBoard[i][j].isShown) {
                elCell.classList.replace('revelead', 'hidden')
                renderCell({
                    i: i,
                    j: j
                }, EMPTY)
            }
        }
    }
}