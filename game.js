const SIZE = 8;
const FRUITS = ['🍒', '🍋', '🍇', '🍊', '🥝', '🍓'];
const boardElement = document.querySelector('#board');
const scoreElement = document.querySelector('#score');
const messageElement = document.querySelector('#message');
let board = [];
let selected = null;
let score = 0;

const randomFruit = () => Math.floor(Math.random() * FRUITS.length);
const adjacent = (a, b) => Math.abs(Math.floor(a / SIZE) - Math.floor(b / SIZE))
  + Math.abs(a % SIZE - b % SIZE) === 1;

function swap(a, b) {
  [board[a], board[b]] = [board[b], board[a]];
}

// A Set counts intersecting horizontal and vertical matches only once.
function findMatches() {
  const matches = new Set();
  for (let i = 0; i < board.length; i++) {
    for (const step of [1, SIZE]) {
      const line = [i];
      for (let j = i + step; j < board.length; j += step) {
        if (step === 1 && Math.floor(j / SIZE) !== Math.floor(i / SIZE)) break;
        if (board[j] !== board[i]) break;
        line.push(j);
      }
      if (line.length >= 3) line.forEach(index => matches.add(index));
    }
  }
  return matches;
}

function hasMove() {
  for (let a = 0; a < board.length; a++) {
    for (const b of [a + 1, a + SIZE]) {
      if (b >= board.length || !adjacent(a, b)) continue;
      swap(a, b);
      const possible = findMatches().size > 0;
      swap(a, b);
      if (possible) return true;
    }
  }
  return false;
}

function createBoard() {
  do {
    board = [];
    for (let i = 0; i < SIZE * SIZE; i++) {
      let fruit;
      do {
        fruit = randomFruit();
      } while ((i % SIZE >= 2 && board[i - 1] === fruit && board[i - 2] === fruit)
        || (i >= SIZE * 2 && board[i - SIZE] === fruit && board[i - SIZE * 2] === fruit));
      board.push(fruit);
    }
  } while (!hasMove());
}

function render() {
  boardElement.replaceChildren();
  board.forEach((fruit, index) => {
    const cell = document.createElement('button');
    cell.type = 'button';
    cell.className = 'cell' + (selected === index ? ' selected' : '');
    cell.textContent = FRUITS[fruit];
    cell.setAttribute('aria-label', `${FRUITS[fruit]}, строка ${Math.floor(index / SIZE) + 1}, столбец ${index % SIZE + 1}`);
    cell.setAttribute('aria-pressed', String(selected === index));
    cell.addEventListener('click', () => {
      choose(index);
      boardElement.children[index].focus({ preventScroll: true });
    });
    boardElement.append(cell);
  });
  scoreElement.textContent = score;
}

function choose(index) {
  if (selected === index) {
    selected = null;
  } else if (selected === null || !adjacent(selected, index)) {
    selected = index;
    messageElement.textContent = 'Теперь выбери соседний фрукт.';
  } else {
    const previous = selected;
    selected = null;
    swap(previous, index);
    let matches = findMatches();
    if (!matches.size) {
      swap(previous, index);
      messageElement.textContent = 'Нет трёх в ряд. Попробуй другую пару!';
    } else {
      let earned = 0;
      while (matches.size) {
        earned += matches.size * 10;
        // Keep remaining fruit in each column, then fill empty spaces at the top.
        for (let col = 0; col < SIZE; col++) {
          const remaining = [];
          for (let row = 0; row < SIZE; row++) {
            const i = row * SIZE + col;
            if (!matches.has(i)) remaining.push(board[i]);
          }
          while (remaining.length < SIZE) remaining.unshift(randomFruit());
          remaining.forEach((fruit, row) => { board[row * SIZE + col] = fruit; });
        }
        matches = findMatches();
      }
      score += earned;
      messageElement.textContent = `+${earned} очков! Продолжай собирать фрукты.`;
      if (!hasMove()) {
        createBoard();
        messageElement.textContent += ' Ходы закончились — поле обновлено.';
      }
    }
  }
  render();
}

function restart() {
  score = 0;
  selected = null;
  createBoard();
  messageElement.textContent = 'Выбери фрукт, затем соседний.';
  render();
}

document.querySelector('#restart').addEventListener('click', restart);
restart();
