'use strict'

function countNegsInMat(mat, pos) {
    var count = 0

    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i > mat.length - 1) continue
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j > mat[0].length - 1) continue
            if (pos.i === i && pos.j === j) continue
            const cell = mat[i][j]
            if (cell.isMine) count++
        }
    }

    return count
}

function getRandomInt(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min) + min)
}

function startTimer() {
    gStartTime = Date.now() 
    gTimerIntervalId = setInterval(() => {
        gGame.secsPassed = (Date.now() - gStartTime) / 1000
        const elH2 = document.querySelector('.time')
        elH2.innerText = gGame.secsPassed.toFixed(3)
    }, 10);
}

function resetTimerText(){
    const elH2 = document.querySelector('.time')
    elH2.innerText = '0.000'
}