'use strict'


function makeId(length = 6) {
    var txt = ''
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

    for (var i = 0; i < length; i++) {
        txt += possible.charAt(Math.floor(Math.random() * possible.length))
    }

    return txt
}

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('')
    var color = '#'
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)]
    }
    return color
}

function createMat(ROWS, COLS) {
    const mat = []
    for (var i = 0; i < ROWS; i++) {
        const row = []
        for (var j = 0; j < COLS; j++) {
            row.push('')
        }
        mat.push(row)
    }
    return mat
}


function getTime() {
    return new Date().toString().split(' ')[4];
}


function sumCol(mat, colIdx) {
    var sumColMat = 0
    for (var i = 0; i < mat.length; i++) {
        var currNum = mat[i][colIdx]
        sumColMat += currNum
    }
    return sumColMat
}

function sumRow(mat, rowIdx) {
    var sumRowMat = 0
    for (var i = 0; i < mat.length; i++) {
        var currNum = mat[rowIdx][i]
        sumRowMat += currNum
    }
    return sumRowMat
}


function sumPrimaryDiagonal(mat) {
    var sum = 0
    for (var d = 0; d < mat.length; d++) {
        var currNum = mat[d][d]
        sum += currNum
    }
    return sum
}

function sumSecondaryDiagonal(mat) {
    var sum = 0
    for (var d = 0; d < mat.length; d++) {
        var currNum = mat[d][mat.length - d - 1]
        sum += currNum
    }
    return sum
}


function getRandomIntInclusive(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // The maximum is inclusive and the minimum is inclusive
}

function getEmptyLocation(board) {
    const emptyLocations = []

    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            const currCell = board[i][j];
            if (currCell.isMine === false && currCell.isShown === false) {
                emptyLocations.push({
                    i,
                    j
                })
            }
        }
    }

    if (!emptyLocations.length) return null

    const randomIdx = getRandomIntInclusive(0, emptyLocations.length - 1)
    return emptyLocations[randomIdx]
}


function countNeighbors(cellI, cellJ) {
    var neighborsCount = 0
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue
            if (i === cellI && j === cellJ) continue
            if (gBoard[i][j].isMine) neighborsCount++
        }
    }
    return neighborsCount
}


function findNearBy(cellI, cellJ) {
    var neighborsArr = []
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue
            //if (i === cellI && j === cellJ) continue
            if (!gBoard[i][j].isMine && !gBoard[i][j].isShown) {
                neighborsArr.push({
                    i: i,
                    j: j
                })
            }
        }
    }
    return neighborsArr
}


function getCellLocationFromClick(elClick) {
    var location = {
        i: elClick.target.className.split('-')[1],
        j: elClick.target.className.split('-')[2]
    }
    return location
}

var gDarkMode = false

function darkModeEnable() {
    if (!gDarkMode) {
        var elBody = document.querySelector('body')
        var elTable = document.querySelector('table')
        var elDiv = document.querySelector('.hint-container')
        elBody.classList.add('dark-mode')
        elTable.classList.add('table-dark')
        elDiv.classList.add('darkhint-container')
        gDarkMode = !gDarkMode
    } else {
        var elBody = document.querySelector('body')
        var elTable = document.querySelector('.board')
        var elDiv = document.querySelector('.hint-container')
        elBody.classList.remove('dark-mode')
        elTable.classList.remove('table-dark')
        elDiv.classList.remove('darkhint-container')
        gDarkMode = !gDarkMode
    }
}