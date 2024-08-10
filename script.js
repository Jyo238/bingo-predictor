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


    bestMoves=removeBlock(bestMoves,11,12,14)
    bestMoves=removeBlock(bestMoves,3,8,18)
    bestMoves=removeBlock(bestMoves,12,14,15)
    bestMoves=removeBlock(bestMoves,8,18,23)

    if(bestMoves.includes(1) || bestMoves.includes(7) || bestMoves.includes(5) || bestMoves.includes(9) || bestMoves.includes(17) || bestMoves.includes(21) || bestMoves.includes(19) || bestMoves.includes(25))
    {
        bestMoves = selectBestBlock(bestMoves)
    }



    if (bestMoves.length > 0) {
        document.getElementById('status').textContent = `推薦的格子為： ${bestMoves.join(', ')}`;
        bestMoves.forEach(num => {
            document.getElementById(`square-${num}`).classList.add('yellow');
        });
    } else {
        document.getElementById('status').textContent = '沒有推薦的格子';
    }
}

function countSelections(group) {
    let count = 0;
    group.forEach(num => {
        if (hasSelected(num)) {
            count++;
        }
    });
    
    return count;
}

function hasSelected(num) {
    return playerSelections.has(num) || systemSelections.has(num);
}

function selectBestBlock(bestMoves) {
    console.log('bestMoves',bestMoves)
    if(currentChoice < 0)
        return bestMoves;

    const groupA = [1, 2, 6, 7];
    const groupB = [4, 5, 9, 10];
    const groupC = [16, 17, 21, 22];
    const groupD = [19, 20, 24, 25];
    const lineA = [3,8];
    const lineB = [11,12];
    const lineC = [14,15];
    const lineD = [18,23];
    if(groupA.includes(currentChoice))
    {
        if(bestMoves.includes(7) && !hasSelected(7))
        {
            return [7]
        }
        else if(hasSelected(7) && bestMoves.includes(19))
        {
            return [19]
        }
        else
        {
            return bestMoves
        }
    }
    else if(groupB.includes(currentChoice))
    {
        if(bestMoves.includes(9) && !hasSelected(9))
        {
            return [9]
        }
        else if(hasSelected(9) && bestMoves.includes(17))
        {
            return [17]
        }
        else
        {
            return bestMoves
        }
    }
    else if(groupC.includes(currentChoice))
    {
        if(bestMoves.includes(17) && !hasSelected(17))
        {
            return [17]
        }
        else if(hasSelected(17) && bestMoves.includes(21))
        {
            return [9]
        }
        else
        {
            return bestMoves
        }
    }
    else if(groupD.includes(currentChoice))
    {
        if(bestMoves.includes(19) && !hasSelected(19))
        {
            return [19]
        }
        else if(hasSelected(19) && bestMoves.includes(25))
        {
            return [7]
        }
        else
            return bestMoves
    }
    else if(lineA.includes(currentChoice))
    {
        if(bestMoves.includes(7) && !hasSelected(7))
            return [7]
        else
            return bestMoves 
    }
    else if(lineB.includes(currentChoice))
    {
        if(bestMoves.includes(12) && !hasSelected(12))
            return [12]
        else
            return bestMoves 
    }
    else if(lineC.includes(currentChoice))
    {
        if(bestMoves.includes(14) && !hasSelected(14))
            return [14]
        else
            return bestMoves 
    }
    else if(lineD.includes(currentChoice))
    {
        if(bestMoves.includes(18) && !hasSelected(18))
            return [18]
        else
            return bestMoves 
    }
    else
    {
        return bestMoves
    }

    
}




function removeBlock(bestMoves, a, b, c) {
    if (bestMoves.includes(a) && bestMoves.includes(b)) {
        bestMoves = bestMoves.filter(item => item !== b);
    } else if (bestMoves.includes(a) && bestMoves.includes(c)) {
        bestMoves = bestMoves.filter(item => item !== c);
    }
    return bestMoves;
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
