'use strict'

const MINE = '💣'
const FLAG = '🚩'

var gTimerIntervalId
var gStartTime

var gBoard
var gLevel = {
    SIZE: 4,
    MINES: 2
}
var gGame = {
    isOn: false,
    isOver: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

function onInit() {
    if (gTimerIntervalId) clearInterval(gTimerIntervalId)
    resetTimerText()
    gGame = {
        isOn: false,
        isOver: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
    gBoard = buildBoard(gLevel.SIZE)
    placeMines()
    setMinesNegsCount(gBoard)
    renderBoard(gBoard, '.game-container')
}

function buildBoard(size = 4) {
    const board = []

    for (var i = 0; i < size; i++) {
        board[i] = []
        for (var j = 0; j < size; j++) {
            const randomNum = getRandomInt(0, 100)
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
        }
    }

    return board
}

function renderBoard(board, selector) {
    const elContainer = document.querySelector(selector)
    var strHtml = '<table><tbody>'

    for (var i = 0; i < board.length; i++) {
        strHtml += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            const cell = board[i][j]
            const cellClass = `cell-${i}-${j}`
            var value
            if (cell.isMine) {
                value = MINE
            } else if (cell.minesAroundCount) {
                value = cell.minesAroundCount
            } else {
                value = ''
            }

            if (cell.isMarked) {
                value = FLAG
            }

            if (cell.isShown) {
                strHtml += `<td oncontextmenu="return false;" onclick="cellClicked(this, ${i}, ${j})" class="${cellClass} shown">${value}</td>`
            } else if (cell.isMarked) {
                strHtml += `<td oncontextmenu="cellRightClicked(this, ${i}, ${j}); return false;" onclick="cellClicked(this, ${i}, ${j})" class="${cellClass}">${value}</td>`
            } else {
                strHtml += `<td oncontextmenu="cellRightClicked(this, ${i}, ${j}); return false;" onclick="cellClicked(this, ${i}, ${j})" class="${cellClass}"></td>`
            }
        }
        strHtml += '</tr>'
    }

    strHtml += '</tbody></table>'
    elContainer.innerHTML = strHtml
}

function setMinesNegsCount(board) {
    // const minesNegsCount = countNegsInMat(board, pos)
    // board[pos.i][pos.j].minesAroundCount = minesNegsCount

    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            const cell = board[i][j]
            cell.minesAroundCount = countNegsInMat(board, { i, j })
        }
    }
}

function cellClicked(elCell, i, j) {
    if (!gGame.isOn) {
        startTimer()
        gGame.isOn = true
    }

    if (gGame.isOver) return
    const cell = gBoard[i][j]

    if (cell.isShown) return
    if (cell.isMarked) return
    if (cell.isMine) {
        gameOver()
        return
    }
    
    if (cell.minesAroundCount) {
        cell.isShown = true
        gGame.shownCount++
    } else {
        cell.isShown = true
        gGame.shownCount++
        showNegs(gBoard, { i, j })
    }

    renderBoard(gBoard, '.game-container')
    if (checkGameWon()) gameWon()
}

function cellRightClicked(elCell, i, j) {
    if (!gGame.isOn) {
        startTimer()
        gGame.isOn = true
    }

    if (gGame.isOver) return
    const cell = gBoard[i][j]
    cell.isMarked = !cell.isMarked
    if (cell.isMarked) gGame.markedCount++
    else gGame.markedCount--
    renderBoard(gBoard, '.game-container')
    if (checkGameWon()) gameWon()
}

function placeMines() {
    for (var i = 0; i < gLevel.MINES; i++) {
        const randRowIdx = getRandomInt(0, gBoard.length)
        const randColIdx = getRandomInt(0, gBoard[randRowIdx].length)
        const randCell = gBoard[randRowIdx][randColIdx]
        if (randCell.isMine) i--
        if (!randCell.isMine) {
            randCell.isMine = true
        }
    }
}

function gameOver() {
    gGame.isOver = true
    if (gTimerIntervalId) clearInterval(gTimerIntervalId)
    revealAllMines(gBoard)
}

function revealAllMines(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            const cell = board[i][j]
            if (!cell.isMine) continue
            cell.isShown = true
        }
    }
    renderBoard(gBoard, '.game-container')
}

function checkGameWon() {
    return gGame.markedCount === gLevel.MINES && gGame.shownCount === gLevel.SIZE ** 2 - gLevel.MINES
}

function gameWon() {
    gGame.isOver = true
    if (gTimerIntervalId) clearInterval(gTimerIntervalId)
    alert('WOHO')
}

function onDiffClicked(diffStr) {
    switch (diffStr) {
        case 'easy':
            gLevel = { SIZE: 4, MINES: 2 }
            break
        case 'medium':
            gLevel = { SIZE: 8, MINES: 14 }
            break
        case 'hard':
            gLevel = { SIZE: 12, MINES: 32 }
            break
    }
    onInit()
}

function showNegs(mat, pos) {
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i > mat.length - 1) continue
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j > mat[0].length - 1) continue
            if (pos.i === i && pos.j === j) continue
            const cell = mat[i][j]
            if(cell.isMine) continue
            if(cell.isMarked) continue
            if(cell.isShown) continue
            cell.isShown = true
            gGame.shownCount++
        }
    }
}