/*
 * Giga Pet: Mr. Fluffy
 * COMP 484, Project 2
 *
 * Keeps track of the pet's stats, responds to the action buttons,
 * and shows a speech-bubble comment from the pet after every press.
 * Uses jQuery 2.2.1 (loaded in index.html).
 */

$(function() { // Runs once all the DOM elements on the page are ready to be used.

  // Show the pet's starting name, weight, happiness, and energy in the HTML
  checkAndUpdatePetInfoInHtml();

  // When each button is clicked, call the function for that button (functions are below)
  $('.treat-button').click(clickedTreatButton);
  $('.play-button').click(clickedPlayButton);
  $('.exercise-button').click(clickedExerciseButton);
  $('.nap-button').click(clickedNapButton);
});

// The pet's current stats. These are numbers (not strings) so we can do math with them.
var pet_info = {
  name: "Mr. Fluffy",
  weight: 12,     // pounds
  happiness: 10,  // purrs per minute
  energy: 10      // 0 = exhausted, MAX_ENERGY = fully rested
};

// Game settings, kept in one place so they are easy to tweak
var MAX_ENERGY = 10;
var PLAY_ENERGY_COST = 2;
var EXERCISE_ENERGY_COST = 3;
var NAP_ENERGY_GAIN = 5;
var NAP_LENGTH_MS = 2500;  // how long Mr. Fluffy sleeps, in milliseconds
var FADE_SPEED_MS = 600;   // how long the Zzz overlay takes to fade in or out

// Arrays of things Mr. Fluffy might say. After each button press,
// one comment is picked at random from the matching array.
var petComments = {
  treat: [
    "Nom nom nom! More please!",
    "A treat?! You're my favorite human.",
    "Purrrrr... that was delicious.",
    "I'd do anything for another one of those."
  ],
  play: [
    "Chase the string! Chase the string!",
    "Pounce! Did you see that? I'm a fierce hunter!",
    "This is the best day ever!",
    "Again! Again!"
  ],
  exercise: [
    "Ugh... cats were not made for cardio.",
    "Are we done yet? My paws hurt.",
    "Fine. But I'm judging you the whole time.",
    "*heavy panting* ...I demand a treat after this."
  ],
  tooTired: [
    "Too... sleepy... need a nap first.",
    "*yawns* I can't right now. Maybe after a nap?",
    "My energy is gone. Let me sleep!"
  ],
  napStart: [
    "*curls up in a sunbeam* Goodnight...",
    "Time for my 14th nap of the day.",
    "Do not disturb. Cat is sleeping."
  ],
  napEnd: [
    "*stretches* I feel brand new!",
    "That was a purr-fect nap.",
    "I'm awake! What did I miss?"
  ],
  notSleepy: [
    "Nap? I'm not even tired! Let's play!",
    "I'm already full of energy. No nap needed!"
  ]
};

// Treat: increases happiness and weight
function clickedTreatButton() {
  pet_info.happiness += 2;
  pet_info.weight += 1;

  showPetComment('treat');
  checkAndUpdatePetInfoInHtml();
}

// Play: increases happiness, decreases weight, and uses some energy
function clickedPlayButton() {
  // Mr. Fluffy refuses to play if he is too tired
  if (!hasEnoughEnergy(PLAY_ENERGY_COST)) {
    return;
  }

  pet_info.happiness += 3;
  pet_info.weight -= 1;
  pet_info.energy -= PLAY_ENERGY_COST;

  showPetComment('play');
  checkAndUpdatePetInfoInHtml();
}

// Exercise: decreases happiness and weight, and uses a lot of energy
function clickedExerciseButton() {
  // Mr. Fluffy refuses to exercise if he is too tired
  if (!hasEnoughEnergy(EXERCISE_ENERGY_COST)) {
    return;
  }

  pet_info.happiness -= 2;
  pet_info.weight -= 2;
  pet_info.energy -= EXERCISE_ENERGY_COST;

  showPetComment('exercise');
  checkAndUpdatePetInfoInHtml();
}

// Nap (new button): Mr. Fluffy falls asleep for a short time and wakes up
// with more energy and a little more happiness.
function clickedNapButton() {
  // No point napping if he is already fully rested
  if (pet_info.energy >= MAX_ENERGY) {
    showPetComment('notSleepy');
    return;
  }

  // Lock the buttons so nothing else can happen while he is asleep
  setButtonsEnabled(false);
  showPetComment('napStart');

  /*
   * jQuery method #2: .fadeToggle(duration, complete)
   *
   * .fadeToggle() checks whether the element is currently visible and then
   * animates its opacity the opposite way:
   *   - hidden  -> fades IN  (opacity 0 to 1, then it stays displayed)
   *   - visible -> fades OUT (opacity 1 to 0, then it is set to display: none)
   * "duration" is how long the fade takes in milliseconds. "complete" is an
   * optional function jQuery calls once the fade has finished.
   *
   * Because it toggles, the same call is used both to show and to hide the
   * "Zzz" overlay. The overlay starts hidden (display: none in style.css), so:
   *   1st call -> the overlay fades in as Mr. Fluffy falls asleep
   *   2nd call -> the overlay fades out as he wakes up
   */
  $('.sleep-overlay').fadeToggle(FADE_SPEED_MS);

  // Wait for the nap to finish, then fade the overlay back out
  setTimeout(function() {
    $('.sleep-overlay').fadeToggle(FADE_SPEED_MS, function() {
      // This runs only after the fade-out is completely finished
      pet_info.energy += NAP_ENERGY_GAIN;
      pet_info.happiness += 1;

      showPetComment('napEnd');
      checkAndUpdatePetInfoInHtml();
      setButtonsEnabled(true);
    });
  }, NAP_LENGTH_MS);
}

// Returns true if the pet has at least "cost" energy.
// Otherwise the pet complains that it is tired, and the function returns false.
function hasEnoughEnergy(cost) {
  if (pet_info.energy < cost) {
    showPetComment('tooTired');
    return false;
  }
  return true;
}

// Turns all of the action buttons on (true) or off (false)
function setButtonsEnabled(enabled) {
  $('.button-container button').prop('disabled', !enabled);
}

// Shows a random comment from the pet for the given action (e.g. 'treat')
function showPetComment(action) {
  var options = petComments[action];
  var message = options[Math.floor(Math.random() * options.length)];

  // Build a brand-new speech bubble element containing the message
  var newBubble = $('<p class="pet-comment"></p>').text(message);

  /*
   * jQuery method #1: .replaceWith(newContent)
   *
   * .replaceWith() removes every element matched by the selector (here the
   * current ".pet-comment" bubble) from the page and puts "newContent" in its
   * exact spot. "newContent" can be an HTML string, a DOM element, or a
   * jQuery object; here it is the jQuery object built above. The method
   * returns the OLD element that was removed, which we don't need here.
   *
   * Why replace the bubble instead of just changing its text? The bubble has
   * a CSS "pop-in" animation that only plays when the element is first added
   * to the page. Changing the text with .text() would reuse the same element,
   * so the animation would play only once. Replacing it with a new element
   * makes the animation play again on every button press, so the user can
   * see that the pet has said something new.
   */
  $('.pet-comment').replaceWith(newBubble);
}

function checkAndUpdatePetInfoInHtml() {
  checkWeightAndHappinessBeforeUpdating();
  updatePetInfoInHtml();
}

// Bug fix: keeps the stats from going below zero (and energy from going above its max)
function checkWeightAndHappinessBeforeUpdating() {
  if (pet_info.weight < 0) {
    pet_info.weight = 0;
  }
  if (pet_info.happiness < 0) {
    pet_info.happiness = 0;
  }
  if (pet_info.energy < 0) {
    pet_info.energy = 0;
  }
  if (pet_info.energy > MAX_ENERGY) {
    pet_info.energy = MAX_ENERGY;
  }
}

// Updates the HTML with the current values in the pet_info object
function updatePetInfoInHtml() {
  $('.name').text(pet_info['name']);
  $('.weight').text(pet_info['weight']);
  $('.happiness').text(pet_info['happiness']);
  $('.energy').text(pet_info['energy']);
  $('.max-energy').text(MAX_ENERGY);
}
