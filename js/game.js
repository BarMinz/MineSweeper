'use strict'

const MINE = '💣'
const EMPTY = ' '
const FLAG = '🚩'

var gGame

var gLevel = {
    SIZE: 4,
    MINES: 2,
    LIVES: 2,
}

var gTimer = null
var gBoard

function onInit() {
    resetTimer()
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        firstClick: false,
    }
    closeModal()
    const elLives = document.querySelector(`.lives`)
    elLives.innerText = gLevel.LIVES
    gBoard = buildBoard()
    renderBoard(gBoard)
    setMinesNegsCount()
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

    // board[0][3].isMine = true
    // board[1][1].isMine = true
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
            else gBoard[i][j].minesAroundCount++
        }
    }
}

function checkGameOver() {
    if (gLevel.LIVES === 0) {
        clearInterval(gTimer)
        gTimer = null
        gGame.isOn = false
        var msg = 'Game Over'
        openModal(msg)
        var elBtn = document.querySelector('.start-btn')
        elBtn.innerText = '🤯'
    } else if (checkVictory) {
        clearInterval(gTimer)
        gTimer = null
        gGame.isOn = false
        var msg = 'Victrious!'
        //openModal(msg)
        var elBtn = document.querySelector('.start-btn')
        elBtn.innerText = '😎'
    }
}

function handleClick(elClick) {
    checkGameOver()
    var location = getCellLocationFromClick(elClick)
    if (!gGame.firstClick) {
        gGame.firstClick = true
        gTimer = setInterval(renderTimer, 1000)
        setRandomMines()
        setMinesNegsCount()
        renderMineNegs(location)
    }
    const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
    gBoard[location.i][location.j].isShown = true
    if (gBoard[location.i][location.j].isFlagged) return;
    if (gBoard[location.i][location.j].isMine) {

        handleMines(elCell)
        renderCell(location, MINE)
        return;
    }
    elCell.classList.replace('hidden', 'revelead')
    if (!gBoard[location.i][location.j].minesAroundCount) {
        renderMineNegs(location)
    } else renderCell(location, gBoard[location.i][location.j].minesAroundCount)
}


function handleMines(elCell) {
    const elLives = document.querySelector(`.lives`)
    var elBtn = document.querySelector('.start-btn')
    elBtn.innerText = '🤯'
    gLevel.LIVES--
    elLives.innerText = gLevel.LIVES
    elCell.classList.replace('hidden', 'revelead')
    checkGameOver()
}

function renderMineNegs(location) {
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
    var location = getCellLocationFromClick(elClick)
    var isFlagged = gBoard[location.i][location.j].isFlagged
    const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
    if (isFlagged) {
        gBoard[location.i][location.j].isFlagged = false
        elCell.classList.replace('flagged', 'hidden')
        renderCell(location, EMPTY)
    } else {
        gBoard[location.i][location.j].isFlagged = true
        elCell.classList.replace('hidden', 'flagged')
        renderCell(location, FLAG)
    }
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
    switch (difficulty) {
        case 'Easy':
            gLevel = {
                SIZE: 4,
                MINES: 2,
                LIVES: 2,
            }
            break;
        case 'Medium':
            gLevel = {
                SIZE: 8,
                MINES: 14,
                LIVES: 3,
            }
            break;
        case 'Hard':
            gLevel = {
                SIZE: 12,
                MINES: 32,
                LIVES: 3,
            }
            break;
    }
}



// Check Victory?

function checkVictory(){
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if(!gBoard[i][j].isShown && !gBoard.isMine) {
                console.log('False')
                return false  
            }
        }
    }
    console.log('true')
    return true;
}