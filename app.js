// Get references to DOM elements
const testItem = document.getElementById("textDisplay");    // Container for displayed text
const inputItem = document.getElementById("textInput");     // Text input field
const timeName = document.getElementById("timeName");       // Label for timer
const time = document.getElementById("time");               // Timer display
const cwName = document.getElementById("cwName");           // Label for correct words
const cw = document.getElementById("cw");                   // Correct words counter
const restartBtn = document.getElementById("restartBtn");   // Restart button
const thirty = document.getElementById("thirty");           // 30 second timer option
const sixty = document.getElementById("sixty");             // 60 second timer option
const beg = document.getElementById("beg");                 // Beginner difficulty option
const pro = document.getElementById("pro");                 // Professional difficulty option

// Initialize game variables
var wordNo = 1;             // Current word index
var wordsSubmitted = 0;     // Total words typed
var wordsCorrect = 0;       // Correctly typed words
var timer = 30;             // Default timer duration in seconds
var flag = 0;               // Flag to check if timer has started
var factor = 2;             // Multiplier for WPM calculation (2 for 30s, 1 for 60s)
var seconds;                // Timer interval reference
var difficulty = 1;         // Default difficulty level (1 = beginner, 2 = professional)

// Initialize the test with default difficulty
displayTest(difficulty);

// Event listener for text input
inputItem.addEventListener('input', function(event){
  // Start timer on first keystroke
  if(flag === 0){
    flag = 1;
    timeStart();
  }
  
  var charEntered = event.data;
  // Check if user typed a space (word completion)
  if(/\s/g.test(charEntered)){  
    checkWord();
  }
  else{
    // Otherwise check current word progress
    currentWord();
  }
});

// Event listeners for timer options
thirty.addEventListener("click", function(){
  timer = 30;
  factor = 2;              // Multiplier for 30s test (converts to per-minute rate)
  limitColor(thirty, sixty);
  time.innerText = timer;
});

sixty.addEventListener("click", function(){
  timer = 60;
  factor = 1;              // No multiplier needed for 60s test
  limitColor(sixty, thirty);
  time.innerText = timer;
});

// Event listeners for difficulty options
beg.addEventListener("click", function(){
  difficulty = 1;          // Basic words list
  displayTest(difficulty);
  limitColor(beg, pro);
});

pro.addEventListener("click", function(){
  difficulty = 2;          // Advanced words list
  displayTest(difficulty);
  limitColor(pro, beg);
});

// Highlight the selected option and remove highlight from the other
function limitColor(itema, itemr){
  itema.classList.add('yellow');
  itemr.classList.remove('yellow');
}

// Restart the test
restartBtn.addEventListener("click", function(){
  // Reset counters and state
  wordsSubmitted = 0;
  wordsCorrect = 0;
  flag = 0;

  // Reset UI elements
  time.classList.remove("current");
  cw.classList.remove("current");
  time.innerText = timer;
  timeName.innerText = "Time";
  cw.innerText = wordsCorrect;
  cwName.innerText = "CW";
  inputItem.disabled = false;
  inputItem.value = '';
  inputItem.focus();

  // Generate new test and clear timer
  displayTest(difficulty);
  clearInterval(seconds);
  limitVisible();
});

// Start the countdown timer
function timeStart(){
  limitInvisible();  // Hide timer/difficulty options during test
  seconds = setInterval(function() {
    time.innerText--;
    if (time.innerText == "-1") {
        timeOver();
        clearInterval(seconds);
    }
  }, 1000);
}

// Handle test completion when time runs out
function timeOver(){
  inputItem.disabled = true;
  restartBtn.focus();
  displayScore();
}

// Show timer/difficulty options
function limitVisible(){
  thirty.style.visibility = 'visible';
  sixty.style.visibility = 'visible';
  beg.style.visibility = 'visible';
  pro.style.visibility = 'visible';
}

// Hide timer/difficulty options during test
function limitInvisible(){
  thirty.style.visibility = 'hidden';
  sixty.style.visibility = 'hidden';
  beg.style.visibility = 'hidden';
  pro.style.visibility = 'hidden';
}

// Calculate and display final score
function displayScore(){
  // Calculate percentage accuracy
  let percentageAcc = 0;
  if(wordsSubmitted !== 0){
    percentageAcc = Math.floor((wordsCorrect/wordsSubmitted)*100);
  }

  // Update UI to show results
  time.classList.add("current");
  cw.classList.add("current");

  time.innerText = percentageAcc + "%";
  timeName.innerText = "PA";  // Percentage Accuracy

  cw.innerText = factor * wordsCorrect;
  cwName.innerText = "WPM";   // Words Per Minute
}

// Check if current word is being typed correctly
function currentWord(){
  const wordEntered = inputItem.value;
  const currentID = "word " + wordNo;
  const currentSpan = document.getElementById(currentID);
  const curSpanWord = currentSpan.innerText;

  // Highlight word based on correct/incorrect typing
  if(wordEntered == curSpanWord.substring(0, wordEntered.length)){
    colorSpan(currentID, 2);  // Current and correct
  }
  else{
    colorSpan(currentID, 3);  // Current but incorrect
  }
}

// Verify completed word when space is pressed
function checkWord(){
  const wordEntered = inputItem.value;
  inputItem.value = '';

  const wordID = "word " + wordNo;
  const checkSpan = document.getElementById(wordID);
  wordNo++;
  wordsSubmitted++;

  // Check if the word was typed correctly
  if(checkSpan.innerText === wordEntered){
    colorSpan(wordID, 1);  // Mark as correct
    wordsCorrect++;
    cw.innerText = wordsCorrect;
  }
  else{
    colorSpan(wordID, 3);  // Mark as incorrect
  }

  // Generate new set of words if we've reached the end
  if(wordNo > 40){
    displayTest(difficulty);
  }
  else{
    // Highlight the next word
    const nextID = "word " + wordNo;
    colorSpan(nextID, 2);
  }
}

// Apply appropriate CSS class based on word state
function colorSpan(id, color){
  const span = document.getElementById(id);
  if(color === 1){
    span.classList.remove('wrong');
    span.classList.remove('current');
    span.classList.add('correct');  // Completed correctly
  }
  else if(color === 2){
    span.classList.remove('correct');
    span.classList.remove('wrong');
    span.classList.add('current');  // Current word
  }
  else{
    span.classList.remove('correct');
    span.classList.remove('current');
    span.classList.add('wrong');    // Incorrect word
  }
}

// Generate and display random words for testing
function displayTest(diff){
  wordNo = 1;
  testItem.innerHTML = '';

  // Get random words based on difficulty
  let newTest = randomWords(diff);
  newTest.forEach(function(word, i){
    let wordSpan = document.createElement('span');
    wordSpan.innerText = word;
    wordSpan.setAttribute("id", "word " + (i+1));
    testItem.appendChild(wordSpan);
  });

  // Highlight the first word
  const nextID = "word " + wordNo;
  colorSpan(nextID, 2);
}

// Generate an array of 40 random words based on difficulty level
function randomWords(diff){
  // Array of more advanced/common words
  var topWords = ["ability", "able", "about", "above", "accept", /* more words... */];

  // Array of simpler/basic words
  var basicWords = ["a", "about", "above", "across", "act", /* more words... */];
  
  // Select word list based on difficulty
  if(diff == 1){
    wordArray = basicWords;  // Beginner mode
  }
  else{
    wordArray = topWords;    // Professional mode
  }

  // Randomly select 40 words from the chosen array
  var selectedWords = [];
  for(var i = 0; i < 40; i++){
    var randomNumber = Math.floor(Math.random() * wordArray.length);
    selectedWords.push(wordArray[randomNumber] + " ");
  }
  return selectedWords;
}
