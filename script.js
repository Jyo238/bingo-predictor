const boardSize = 5;
let board = Array.from({ length: boardSize * boardSize }, (_, i) => i + 1);
let playerSelections = new Set();
let systemSelections = new Set();
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

function recommendMove() {
    if (chancesLeft <= 0) {
        document.getElementById('status').textContent = 'No chances left for recommendations.';
        return;
    }

    clearRecommendations(); // 清除先前的推薦步

    const availableNumbers = board.filter(num => 
        !playerSelections.has(num) && !systemSelections.has(num)
    );

    if (availableNumbers.length === 0) {
        document.getElementById('status').textContent = 'No moves available for recommendation.';
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

    if (bestMoves.length > 0) {
        document.getElementById('status').textContent = `Recommend flipping square(s) ${bestMoves.join(', ')}`;
        bestMoves.forEach(num => {
            document.getElementById(`square-${num}`).classList.add('yellow');
        });
    } else {
        document.getElementById('status').textContent = 'No moves available for recommendation.';
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

            // 進一步強化對中心點和對角線的加分
            if (line.includes(13)) {
                score += 5; // 中心點加分
            }
            if (line.includes(1) && line.includes(25)) {
                score += 10; // 對角線上的格子加分
            }
        }
    });

    // 根據可能完成的線數進行加權
    score += potentialLines * 100;

    return score;
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
        document.getElementById('status').textContent = 'You win!';
        disableButtons();
    } else if (chancesLeft === 0) {
        document.getElementById('status').textContent = `You connected ${lines} lines. Try again!`;
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
    document.getElementById('chance-count').textContent = `Chances Left: ${chancesLeft}`;
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
