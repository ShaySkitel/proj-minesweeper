'use strict'

const MINE = '💣'
const FLAG = '🚩'

var gTimerIntervalId
var gStartTime
// var gBoardState
var gMegaHintPositions
var gMinesExterminated

var gBoard
var gLevel = {
    SIZE: 4,
    MINES: 2
}
var gGame = {
    isOn: false,
    isOver: false,
    hint: false,
    safeClicks: 3,
    shownCount: 0,
    markedCount: 0,
    isFirstClick: true,
    isMegahint: false,
    megahintUsed: false,
    usedExterminator: false,
    secsPassed: 0,
    lives: 3,
    hints: 3,
    lifeSavedCount: 0
}

function onInit() {
    // gBoardState = []
    gMinesExterminated = 0
    resetElements()
    if (gTimerIntervalId) clearInterval(gTimerIntervalId)
    resetTimerText()
    gMegaHintPositions = []
    gGame = {
        isOn: false,
        isOver: false,
        hint: false,
        safeClicks: 3,
        shownCount: 0,
        markedCount: 0,
        isFirstClick: true,
        isMegahint: false,
        megahintUsed: false,
        usedExterminator: false,
        secsPassed: 0,
        lives: 3,
        hints: 3,
        lifeSavedCount: 0
    }
    document.querySelector('.safe-click').querySelector('span').innerText = `${gGame.safeClicks} clicks available`
    updateLivesText()
    updateHintsText()
    updateStatusEmoji()
    gBoard = buildBoard(gLevel.SIZE)
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
                isMarked: false,
                pos: { i, j }
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
    if (gGame.isOver) return
    if (!gGame.isOn) {
        startTimer()
        gGame.isOn = true
    }
    const cell = gBoard[i][j]

    if (gGame.isMegahint) {
        if (!(gMegaHintPositions.length >= 2)) {
            gMegaHintPositions.push({ i, j })
            for(var i = 0; i < gMegaHintPositions.length; i++){
                const cell = gMegaHintPositions[i]
                const elCell = document.querySelector(`.cell-${cell.i}-${cell.j}`)
                elCell.style.backgroundColor = 'blue'
            }
        }
        if (gMegaHintPositions.length >= 2) {
            gGame.isMegahint = false
            gGame.megahintUsed = true
            setTimeout(() => {
                showMegahintArea()
            }, 200);

        }
        return
    }
    if (cell.isShown) return
    if (cell.isMarked) return


    if (gGame.hint) {
        getHint({ i, j })
        return
    }

    if (cell.isMine) {
        // gBoardState.push(createBoardCopy(gBoard))
        if (gGame.lives !== 0) {
            gGame.lives--
            gGame.lifeSavedCount++
            updateLivesText()
            if (gGame.lives === 0) {
                gameOver()
                return
            }
            cell.isShown = true
            renderBoard(gBoard, '.game-container')
            return
        } else {
            gameOver()
            return
        }
    }

    if (gGame.isFirstClick) {
        placeMines()
        setMinesNegsCount(gBoard)
        // gBoardState.push(createBoardCopy(gBoard))
    } else {
        // gBoardState.push(createBoardCopy(gBoard))
    }

    if (cell.minesAroundCount) {
        if (gGame.isFirstClick) {
            if (cell.isMine) {
                cell.isMine = false
                placeMines(1)
            }
            gGame.isFirstClick = false
        }
        cell.isShown = true
        gGame.shownCount++
    } else {
        if (gGame.isFirstClick) {
            if (cell.isMine) {
                cell.isMine = false
                placeMines(1)
            }
            gGame.isFirstClick = false
        }
        cell.isShown = true
        gGame.shownCount++
        showNegs(gBoard, { i, j })
    }

    renderBoard(gBoard, '.game-container')
    if (checkGameWon()) gameWon()
}

function cellRightClicked(elCell, i, j) {


    if (gGame.isOver) return
    const cell = gBoard[i][j]
    // gBoardState.push(createBoardCopy(gBoard))
    if (!gGame.isOn) {
        startTimer()
        placeMines()
        setMinesNegsCount(gBoard)
        gGame.isOn = true
        gGame.isFirstClick = false
    }
    cell.isMarked = !cell.isMarked
    if (cell.isMarked) gGame.markedCount++
    else gGame.markedCount--


    renderBoard(gBoard, '.game-container')
    if (checkGameWon()) gameWon()
}

function placeMines(amount = gLevel.MINES) {
    for (var i = 0; i < amount; i++) {
        const randRowIdx = getRandomInt(0, gBoard.length)
        const randColIdx = getRandomInt(0, gBoard[randRowIdx].length)
        const randCell = gBoard[randRowIdx][randColIdx]
        if (randCell.isMine || randCell.isShown || randCell.isMarked) i--
        if (!randCell.isMine && randCell.isMarked === false && randCell.isShown === false) {
            randCell.isMine = true
        }
    }
}

function gameOver() {
    gGame.isOver = true
    if (gTimerIntervalId) clearInterval(gTimerIntervalId)
    revealAllMines(gBoard)
    updateStatusEmoji('😭')
    document.body.classList.add('lose')
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
    return gGame.markedCount === gLevel.MINES - gGame.lifeSavedCount - gMinesExterminated && gGame.shownCount === gLevel.SIZE ** 2 - gLevel.MINES + gMinesExterminated
}

function gameWon() {
    gGame.isOver = true
    if (gTimerIntervalId) clearInterval(gTimerIntervalId)
    updateStatusEmoji('😎')
    document.body.classList.add('win')
    console.log('won')
}

function onDiffClicked(diffStr, elBtn) {
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
    resetDiffBtnsClasses()
    elBtn.classList.add('active')
    onInit()
}

function resetDiffBtnsClasses() {
    const elBtns = document.querySelectorAll('button')

    for (var i = 0; i < elBtns.length; i++) {
        const elBtn = elBtns[i]
        elBtn.classList = ''
    }
}

function showNegs(mat, pos) {
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i > mat.length - 1) continue
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j > mat[0].length - 1) continue
            if (pos.i === i && pos.j === j) continue
            const cell = mat[i][j]
            if (cell.isMine) continue
            if (cell.isMarked) continue
            if (cell.isShown) continue
            cell.isShown = true
            gGame.shownCount++
            if (cell.minesAroundCount === 0) showNegs(gBoard, { i, j })
        }
    }
}

function updateLivesText() {
    const elH2Span = document.querySelector('.lives span')
    var livesStr = ''
    for (var i = 0; i < gGame.lives; i++) {
        livesStr += '❤️'
    }
    elH2Span.innerText = livesStr
}

function updateHintsText() {
    const elH2Span = document.querySelector('.hints span')
    var hintsStr = ''
    for (var i = 0; i < gGame.hints; i++) {
        hintsStr += '💡'
    }
    elH2Span.innerText = hintsStr
}

function updateStatusEmoji(emoji = '😊') {
    const elH2 = document.querySelector('.game-status')
    elH2.innerText = emoji
}

function onHintClicked() {
    if (gGame.isFirstClick) return
    if (!gGame.hints || gGame.hint || !gGame.isOn || gGame.isOver) return
    gGame.hints--
    updateHintsText()
    gGame.hint = true
}

function getHint(pos) {
    const shownCells = []
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j > gBoard[0].length - 1) continue
            const cell = gBoard[i][j]
            if (cell.isMarked || cell.isShown) continue
            cell.isShown = true
            shownCells.push(cell)
        }
    }
    renderBoard(gBoard, '.game-container')
    gGame.hint = false

    setTimeout(() => {
        for (var i = 0; i < shownCells.length; i++) {
            const cell = shownCells[i]
            cell.isShown = false
        }
        renderBoard(gBoard, '.game-container')
    }, 1000);
}


// function for testing :)

function getMinesCount() {
    var count = 0
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            const cell = gBoard[i][j]
            if (cell.isMine) count++
        }
    }
    return count
}

function onSafeClick(elBtn) {
    if (!gGame.safeClicks) return
    if (!gGame.isOn) return
    if (gGame.isFirstClick) return
    const safeCellPos = getRandomSafeCellPos()
    if (!safeCellPos) return
    gGame.safeClicks--
    if (!gGame.safeClicks) {
        if (!elBtn.classList.contains('not-allowed')) {
            elBtn.classList.add('not-allowed')
        }
    }
    highlightSafeCell(safeCellPos)
    elBtn.querySelector('span').innerText = `${gGame.safeClicks} clicks available`
}

function getRandomSafeCellPos() {
    var cellFound = false
    var cellPos
    if (gLevel.SIZE ** 2 - gGame.shownCount === gLevel.MINES) return null
    while (!cellFound) {
        const randRowIdx = getRandomInt(0, gBoard.length)
        const randColIdx = getRandomInt(0, gBoard[randRowIdx].length)
        const randCell = gBoard[randRowIdx][randColIdx]
        if (randCell.isMine || randCell.isShown || randCell.isMarked) continue
        cellPos = { randRowIdx, randColIdx }
        cellFound = true
    }

    return cellPos
}

function highlightSafeCell(pos) {
    const elCell = getElCell(pos)
    elCell.classList.add('safe')
    setTimeout(() => {
        elCell.classList.remove('safe')
    }, 2000);

}

function getElCell(pos) {
    pos = { i: pos.randRowIdx, j: pos.randColIdx }
    const selector = `.cell-${pos.i}-${pos.j}`
    const elCell = document.querySelector(selector)
    return elCell
}

// function onUndo() {
//     if (gGame.isOver) return
//     // if (!gBoardState.length || !gGameState.length) return
//     if (gBoardState.length) {
//         gBoard = gBoardState.pop()
//         renderBoard(gBoard, '.game-container')
//     }
// }

function createBoardCopy(board) {
    const boardCopy = []
    for (var i = 0; i < board.length; i++) {
        boardCopy[i] = []
        for (var j = 0; j < board[0].length; j++) {
            const cell = board[i][j]
            const newCell = { minesAroundCount: cell.minesAroundCount, isShown: cell.isShown, isMine: cell.isMine, isMarked: cell.isMarked }
            boardCopy[i].push(newCell)
        }
    }
    return boardCopy
}

function onMegaHint(elBtn) {
    if (!gGame.isOn) return
    if (gGame.isOver || gGame.isFirstClick || gGame.megahintUsed) return
    elBtn.classList.add('not-allowed')
    gGame.isMegahint = true
}

function showMegahintArea() {
    const shownCells = []
    const cell1 = gMegaHintPositions[0]
    const cell2 = gMegaHintPositions[1]

    const rowStartPos = cell1.i > cell2.i ? cell2.i : cell1.i
    const colStartPos = cell1.j > cell2.j ? cell2.j : cell1.j

    const rowEndPos = cell1.i > cell2.i ? cell1.i : cell2.i
    const colEndPos = cell1.j > cell2.j ? cell1.j : cell2.j
    for (var i = rowStartPos; i <= rowEndPos; i++) {
        for (var j = colStartPos; j <= colEndPos; j++) {
            const cell = gBoard[i][j]
            if (cell.isMarked || cell.isShown) continue
            cell.isShown = true
            shownCells.push(cell)
        }
    }
    renderBoard(gBoard, '.game-container')
    gMegaHintPositions = []

    setTimeout(() => {
        for (var i = 0; i < shownCells.length; i++) {
            const cell = shownCells[i]
            cell.isShown = false
            renderBoard(gBoard, '.game-container')
        }
    }, 2000);
}

function resetElements() {
    const elSafeClick = document.querySelector('.safe-click')
    elSafeClick.classList.remove('not-allowed')
    document.body.classList = ''

    const elMegahint = document.querySelector('.megahint')
    elMegahint.classList.remove('not-allowed')

    const elExterminator = document.querySelector('.exterminator')
    elExterminator.classList.remove('not-allowed')
}

function onExterminator(elBtn) {
    if (gGame.usedExterminator || gGame.isFirstClick || gGame.isOver || !gGame.isOn) return
    const mines = getThreeRandomMines()
    for (var i = 0; i < mines.length; i++) {
        const mineCell = mines[i]
        mineCell.isShown = true
        renderBoard(gBoard, '.game-container')
        gMinesExterminated++
        setTimeout(() => {
            mineCell.isMine = false
            mineCell.isShown = false
            setMinesNegsCount(gBoard)
            renderBoard(gBoard, '.game-container')
        }, 500);

    }
    gGame.usedExterminator = true
    elBtn.classList.add('not-allowed')
}

function getHiddenMines() {
    const allMines = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            const cell = gBoard[i][j]
            if (cell.isMine && !cell.isShown && !cell.isMarked) {
                allMines.push(cell)
            }
        }
    }
    return allMines
}

function getThreeRandomMines() {
    const mines = getHiddenMines()
    const randMines = []
    while (randMines.length !== 3) {
        const randIdx = getRandomInt(0, mines.length)
        const mine = mines[randIdx]
        console.log(mine)
        if (randMines.includes(mine)) continue
        randMines.push(mine)
        if (randMines.length === gLevel.MINES - gGame.lifeSavedCount - gGame.markedCount) return randMines
    }
    return randMines
}