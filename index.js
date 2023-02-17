
// Global Variables
var winningWord = '';
var currentRow = 1;
var guess = '';
var gamesPlayed = [];
let words, totalGames, gamesWon, attempts;

// Query Selectors
var inputs = document.querySelectorAll('input');
var guessButton = document.querySelector('#guess-button');
var keyLetters = document.querySelectorAll('span');
var errorMessage = document.querySelector('#error-message');
var viewRulesButton = document.querySelector('#rules-button');
var viewGameButton = document.querySelector('#play-button');
var viewStatsButton = document.querySelector('#stats-button');
var gameBoard = document.querySelector('#game-section');
var letterKey = document.querySelector('#key-section');
var rules = document.querySelector('#rules-section');
var stats = document.querySelector('#stats-section');
var totalGamesStat = document.getElementById('stats-total-games');
var percentCorrectStat = document.getElementById('stats-percent-correct');
var averageGuessesStat = document.getElementById('stats-average-guesses');
var totalGamesGrammar = document.getElementById('stats-total-games-plural');
var averageGuessesGrammar = document.getElementById('stats-average-gesses-plural');
var gameOverBox = document.querySelector('#game-over-section');
var gameLostBox = document.getElementById('game-lost-section');
var gameOverGuessCount = document.querySelector('#game-over-guesses-count');
var gameOverGuessGrammar = document.querySelector('#game-over-guesses-plural');

const fetchApi = () => fetch('http://localhost:3001/api/v1/words')
  .then(response => response.json())
  .then(data => setGame(data))
  .catch(err => console.log(err))

// Event Listeners

window.addEventListener('load', fetchApi);

inputs.forEach(input => {
  input.addEventListener('keyup', function() { moveToNextInput(event) });
})

keyLetters.forEach(keyLetter => {
  keyLetter.addEventListener('click', function() { clickLetter(event) });
})

guessButton.addEventListener('click', submitGuess);

viewRulesButton.addEventListener('click', viewRules);

viewGameButton.addEventListener('click', viewGame);

viewStatsButton.addEventListener('click', () => {
  displayGameStats();
  changeStatsText();
  viewStats();
});

// Functions
function setGame(gameData) {
  currentRow = 1;
  words = gameData;
  winningWord = getRandomWord(words);
  console.log(winningWord)
  updateInputPermissions();
}

function getRandomWord(data) {
  var randomIndex = Math.floor(Math.random() * 2500);
  return data[randomIndex];
}

function updateInputPermissions() {
  inputs.forEach(input => {
    if(!input.id.includes(`-${currentRow}-`)) {
      input.disabled = true;
    } else {
      input.disabled = false;
    }
  })
    inputs[0].focus();
}

function moveToNextInput(e) {
  var key = e.keyCode || e.charCode;
  if( key !== 8 && key !== 46 ) {
    var indexOfNext = parseInt(e.target.id.split('-')[2]) + 1;
    inputs[indexOfNext].focus()
  }
}

function clickLetter(e) {
  var activeInput = null;
  var activeIndex = null;

  inputs.forEach(input => {
    if(input.id.includes(`-${currentRow}-`) && !inputs[i].value && !activeInput) {
      activeInput = input;
      activeIndex = index;
    }
  })

  activeInput.value = e.target.innerText;
  inputs[activeIndex + 1].focus();
}

function submitGuess() {
  if (checkIsWord()) {
    errorMessage.innerText = '';
    compareGuess();
    if (checkForWin()) {
      setTimeout(declareWinner, 1000);
    } else if (!checkForWin() && currentRow === 6) {
      declareLoss();
    } else {
      changeRow();
    }
  } else {
    errorMessage.innerText = 'Not a valid word. Try again!';
  }
}

function checkIsWord() {
  guess = '';

  inputs.forEach(input => {
    if(input.id.includes(`-${currentRow}-`)) {
      guess += input.value;
    }
  })

  return words.includes(guess);
}

function compareGuess() {
  var guessLetters = guess.split('');

  guessLetters.forEach(letter => {
    if (winningWord.includes(letter) && winningWord.split('')[guessLetters.indexOf(letter)] !== letter) {
      updateBoxColor(guessLetters.indexOf(letter), 'wrong-location');
      updateKeyColor(letter, 'wrong-location-key');
    } else if (winningWord.split('')[guessLetters.indexOf(letter)] === letter) {
      updateBoxColor(guessLetters.indexOf(letter), 'correct-location');
      updateKeyColor(letter, 'correct-location-key');
    } else {
      updateBoxColor(guessLetters.indexOf(letter), 'wrong');
      updateKeyColor(letter, 'wrong-key');
    }
  })
}

function updateBoxColor(letterLocation, className) {
  var row = [];

  inputs.forEach(input => {
    if(input.id.includes(`-${currentRow}-`)) {
      row.push(input)
    }
  })

  row[letterLocation].classList.add(className);
  return 'hello'
}

function updateKeyColor(letter, className) {
  var keyLetter = null;
  
  keyLetters.forEach(key => {
    if (key.innerText === letter) {
      keyLetter = key;
    }
  })

  keyLetter.classList.add(className);
}

function checkForWin() {
  return guess === winningWord;
}

function changeRow() {
  currentRow++;
  updateInputPermissions();
}

function declareWinner() {
  recordGameStats();
  changeGameOverText();
  viewGameOverMessage(gameOverBox);
  setTimeout(startNewGame, 4000);
}

function declareLoss() {
  recordGameStats();
  viewGameOverMessage(gameLostBox);
  setTimeout(startNewGame, 4000);
}

function recordGameStats() {
  if (checkForWin()) {
    gamesPlayed.push({ solved: true, guesses: currentRow });
  } else if (!checkForWin()) {
    gamesPlayed.push({ solved: false, guesses: currentRow });
  }
}


function displayGameStats() {
  totalGames = gamesPlayed.length;
  gamesWon = gamesPlayed.filter(game => game.solved === true).length;
  attempts = gamesPlayed.reduce((accumulator, currentGame) => {
    accumulator += currentGame.guesses
    return accumulator;
  }, 0)

  totalGamesStat.innerText = totalGames;
  percentCorrectStat.innerText = (gamesWon / totalGames) * 100;
  averageGuessesStat.innerText = attempts / totalGames;
}

function changeStatsText() {
  if (totalGames === 1) {
    totalGamesGrammar.classList.add('collapsed');
  } else {
    totalGamesGrammar.classList.remove('collapsed');
  }

  if(attempts / totalGames === 1) {
    averageGuessesGrammar.classList.add('collapsed');
  } else {
    averageGuessesGrammar.classList.remove('collapsed');
  }
}

function changeGameOverText() {
  gameOverGuessCount.innerText = currentRow;
  if (currentRow < 2) {
    gameOverGuessGrammar.classList.add('collapsed');
  } else {
    gameOverGuessGrammar.classList.remove('collapsed');
  }
}

function startNewGame() {
  clearGameBoard();
  clearKey();
  setGame(words);
  viewGame();
  inputs[0].focus();
}

function clearGameBoard() {
  inputs.forEach(input => {
    input.value = '';
    input.classList.remove('correct-location', 'wrong-location', 'wrong');
  })
}

function clearKey() {
  keyLetters.forEach(key => {
    key.classList.remove('correct-location-key', 'wrong-location-key', 'wrong-key');
  })
}

// Change Page View Functions

function viewRules() {
  letterKey.classList.add('hidden');
  gameBoard.classList.add('collapsed');
  rules.classList.remove('collapsed');
  stats.classList.add('collapsed');
  viewGameButton.classList.remove('active');
  viewRulesButton.classList.add('active');
  viewStatsButton.classList.remove('active');
}

function viewGame() {
  letterKey.classList.remove('hidden');
  gameBoard.classList.remove('collapsed');
  rules.classList.add('collapsed');
  stats.classList.add('collapsed');
  gameOverBox.classList.add('collapsed')
  gameLostBox.classList.add('collapsed')
  viewGameButton.classList.add('active');
  viewRulesButton.classList.remove('active');
  viewStatsButton.classList.remove('active');
}

function viewStats() {
  letterKey.classList.add('hidden');
  gameBoard.classList.add('collapsed');
  rules.classList.add('collapsed');
  stats.classList.remove('collapsed');
  viewGameButton.classList.remove('active');
  viewRulesButton.classList.remove('active');
  viewStatsButton.classList.add('active');
}

function viewGameOverMessage(outcome) {
  outcome.classList.remove('collapsed')
  letterKey.classList.add('hidden');
  gameBoard.classList.add('collapsed');
}

