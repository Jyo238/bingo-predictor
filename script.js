const boardSize = 5;
let board = Array.from({ length: boardSize * boardSize }, (_, i) => i + 1);
let playerSelections = new Set();
let systemSelections = new Set();
let currentChoice = -1;
let chancesLeft = 8;
let turn = 1; // 奇數為玩家回合，偶數為系統回合

function createBoard() {
    const bingoBoard = document.getElementById('bingo-board');
    bingoBoard.innerHTML = '';
    board.forEach(num => {
        const square = document.createElement('div');
        square.textContent = num;
        square.id = `square-${num}`;
        square.addEventListener('click', () => selectSquare(num));
        bingoBoard.appendChild(square);
    });
    updateChanceCount();
}

function selectSquare(num) {
    if (!playerSelections.has(num) && !systemSelections.has(num) && chancesLeft > 0) {
        clearRecommendations(); // 清除先前的推薦步
        if (turn % 2 !== 0) {
            playerSelections.add(num);
            document.getElementById(`square-${num}`).classList.add('green');
        } else {
            systemSelections.add(num);
            currentChoice = num;
            document.getElementById(`square-${num}`).classList.add('blue');
        }
        turn++;
        if (turn % 2 === 1) {
            chancesLeft--;
            updateChanceCount();
        }
        checkForBingo();
        updateRecommendButtonState();
    }
}

function simulatePotential(num) {
    let tempPlayerSelections = new Set([...playerSelections, ...systemSelections]);

    // 假設玩家選擇了num
    tempPlayerSelections.add(num);

    // 模擬系統選擇剩餘的格子
    const availableNumbers = board.filter(n =>
        !tempPlayerSelections.has(n)
    );
    //console.log('num+availableNumbers',num,availableNumbers)
    let totalScore = 0;
    availableNumbers.forEach(systemNum => {
        let tempSelections = new Set(tempPlayerSelections);
        //console.log('systemNum',systemNum)
        tempSelections.add(systemNum);
        //console.log('tempSelections',tempSelections)
        totalScore += calculateFutureLines(tempSelections);
    });
    //console.log('totalScore',totalScore)
    return totalScore;
}

function calculateFutureLines(selections) {
    const winningLines = [
        [1, 2, 3, 4, 5],
        [6, 7, 8, 9, 10],
        [11, 12, 13, 14, 15],
        [16, 17, 18, 19, 20],
        [21, 22, 23, 24, 25],
        [1, 6, 11, 16, 21],
        [2, 7, 12, 17, 22],
        [3, 8, 13, 18, 23],
        [4, 9, 14, 19, 24],
        [5, 10, 15, 20, 25],
        [1, 7, 13, 19, 25],
        [5, 9, 13, 17, 21]
    ];

    let potentialLines = 0;

    winningLines.forEach(line => {
        const p = line.filter(index => selections.has(index))
        //console.log('p',p)
        const playerCount = p.length;
        const emptyCount = line.length - playerCount;
        //console.log('playerCount',playerCount)
        if (playerCount > 0 && emptyCount > 0) {
            potentialLines+=playerCount;
        }
    });

    //console.log('potentialLines',potentialLines)
    return potentialLines;
}


function calculateScoreForSim(selections) {
    //console.log('selections',selections)
    const winningLines = [
        [1, 2, 3, 4, 5],
        [6, 7, 8, 9, 10],
        [11, 12, 13, 14, 15],
        [16, 17, 18, 19, 20],
        [21, 22, 23, 24, 25],
        [1, 6, 11, 16, 21],
        [2, 7, 12, 17, 22],
        [3, 8, 13, 18, 23],
        [4, 9, 14, 19, 24],
        [5, 10, 15, 20, 25],
        [1, 7, 13, 19, 25],
        [5, 9, 13, 17, 21]
    ];

    let score = 0;

    winningLines.forEach(line => {
        //console.log('line',line)
        const playerCount = line.filter(index => selections.has(index)).length;
        //console.log('playerCount',playerCount)
        if (playerCount === 5) {
            score += 100; // 已經完成的線給予最高分
        } else if (playerCount === 4) {
            score += 50; // 如果這條線只剩一個空位，給予較高分
        } else if (playerCount === 3) {
            score += 20; // 當這條線剩兩個空位時，給予中等分數
        } else {
            score += playerCount; // 其他情況下的得分
        }

         // 進一步強化對中心點和斜線的加分
         if (line.includes(13)) {
            score += 5;
        }
        if ((line.includes(7) && line.includes(19)) || (line.includes(5) && line.includes(17))) {
            score += 10; 
        }
        if ((line.includes(1) && line.includes(25)) || (line.includes(5) && line.includes(21))) {
            score += 10; 
        }

        //console.log('score',score)
    });

    return score;
}


function compareFuturePotential(bestMoves) {
    if (bestMoves.length <= 1) {
        return bestMoves;
    }

    let potentialScores = bestMoves.map(num => {
        return { num: num, score: simulatePotential(num) };
    });

    //console.log('potentialScores',potentialScores)

    potentialScores.sort((a, b) => b.score - a.score);

    const highestScore = potentialScores[0].score;
    const bestMovesFiltered = potentialScores.filter(p => p.score === highestScore).map(p => p.num);

    return bestMovesFiltered;
}


function recommendMove() {
    if (chancesLeft <= 0) {
        document.getElementById('status').textContent = '沒有推薦的格子';
        return;
    }

    clearRecommendations(); // 清除先前的推薦步

    const availableNumbers = board.filter(num =>
        !playerSelections.has(num) && !systemSelections.has(num)
    );

    if (availableNumbers.length === 0) {
        document.getElementById('status').textContent = '沒有推薦的格子';
        return;
    }

    let bestMoves = [];
    let maxScore = -1;

    availableNumbers.forEach(num => {
        const score = calculateScore(num);

        if (score > maxScore) {
            maxScore = score;
            bestMoves = [num];
        } else if (score === maxScore) {
            bestMoves.push(num);
        }
    });

    // 比較多個候選格子的未來潛力
    bestMoves = compareFuturePotential(bestMoves);

    if (bestMoves.length > 0) {
        document.getElementById('status').textContent = `推薦的格子為： ${bestMoves.join(', ')}`;
        bestMoves.forEach(num => {
            document.getElementById(`square-${num}`).classList.add('yellow');
        });
    } else {
        document.getElementById('status').textContent = '沒有推薦的格子';
    }
}


function calculateScore(num) {
    const winningLines = [
        [1, 2, 3, 4, 5],
        [6, 7, 8, 9, 10],
        [11, 12, 13, 14, 15],
        [16, 17, 18, 19, 20],
        [21, 22, 23, 24, 25],
        [1, 6, 11, 16, 21],
        [2, 7, 12, 17, 22],
        [3, 8, 13, 18, 23],
        [4, 9, 14, 19, 24],
        [5, 10, 15, 20, 25],
        [1, 7, 13, 19, 25],
        [5, 9, 13, 17, 21]
    ];

    let score = 0;
    let potentialLines = 0;

    winningLines.forEach(line => {
        if (line.includes(num)) {
            const playerCount = line.filter(index => playerSelections.has(index) || systemSelections.has(index)).length;
            const emptyCount = line.length - playerCount;

            if (playerCount === 4 && emptyCount === 1) {
                score += 100; // 如果這條線只剩一個空位，給予最高分
                potentialLines++; // 確保這條線會完成
            } else if (playerCount === 3 && emptyCount === 2) {
                score += 50; // 如果這條線只剩兩個空位，給予較高分
            } else if (playerCount === 2 && emptyCount === 3) {
                score += 20; // 當這條線剩三個空位時，給予中等分數
            } else {
                score += playerCount; // 其他情況下的得分
            }

            // 進一步強化對中心點和斜線的加分
            if (line.includes(13)) {
                score += 5;
            }
            if ((line.includes(7) && line.includes(19)) || (line.includes(5) && line.includes(17))) {
                score += 10; 
            }
            if ((line.includes(1) && line.includes(25)) || (line.includes(5) && line.includes(21))) {
                score += 10; 
            }
        }
    });

    // 根據可能完成的線數進行加權
    score += potentialLines * 100;

    return score;
}

function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false;
    }
    return true;
}

function clearRecommendations() {
    // 清除所有黃色推薦步
    document.querySelectorAll('.yellow').forEach(square => {
        square.classList.remove('yellow');
    });
}

function checkForBingo() {
    const selections = new Set([...playerSelections, ...systemSelections]);
    const lines = calculateLines(selections);

    if (lines >= 4) {
        document.getElementById('status').textContent = '連成四條了!';
        disableButtons();
    } else if (chancesLeft === 0) {
        document.getElementById('status').textContent = `連了${lines}條`;
        disableButtons();
    }
}

function calculateLines(selections) {
    const winningLines = [
        [1, 2, 3, 4, 5],
        [6, 7, 8, 9, 10],
        [11, 12, 13, 14, 15],
        [16, 17, 18, 19, 20],
        [21, 22, 23, 24, 25],
        [1, 6, 11, 16, 21],
        [2, 7, 12, 17, 22],
        [3, 8, 13, 18, 23],
        [4, 9, 14, 19, 24],
        [5, 10, 15, 20, 25],
        [1, 7, 13, 19, 25],
        [5, 9, 13, 17, 21]
    ];

    let lines = 0;

    for (const line of winningLines) {
        if (line.every(index => selections.has(index))) {
            lines++;
        }
    }

    return lines;
}

function updateChanceCount() {
    document.getElementById('chance-count').textContent = `還有${chancesLeft}次機會`;
}

function resetBoard() {
    playerSelections = new Set();
    systemSelections = new Set();
    createBoard();
    document.getElementById('status').textContent = '';
    chancesLeft = 8;
    turn = 1;
    updateChanceCount();
    document.getElementById('recommend-btn').disabled = false;
    clearRecommendations();
}

function disableButtons() {
    document.getElementById('bingo-board').querySelectorAll('div').forEach(div => {
        div.removeEventListener('click', () => selectSquare(num));
    });
    document.getElementById('recommend-btn').disabled = true;
}

function updateRecommendButtonState() {
    const recommendBtn = document.getElementById('recommend-btn');
    recommendBtn.disabled = !(turn % 2 !== 0 && chancesLeft > 0);
}

document.getElementById('recommend-btn').addEventListener('click', recommendMove);
document.getElementById('reset-btn').addEventListener('click', resetBoard);

createBoard();
updateRecommendButtonState();
