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

// Happiness has no real maximum, so its stat bar counts as "full" at this value
var HAPPINESS_BAR_MAX = 20;

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
   jQuery Method #2: .fadeToggle(duration, complete)
   * The .fadeToggle() function determines whether an element is displayed and then animates it's opacity the other way. "Duration" is the time the fade effect takes in milliseconds. Being a toggle function, .fadeToggle() can be used to fade out as well as fade in the "Zzz" overlay. It is initially hidden (display: none in style.css). The 1st call -> the overlay fades in while Mr. Fluffy is falling asleep 2nd call -> the overlay fades out when he wakes up
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
    * .replaceWith() takes out all elements selected by the selectorand replaces it with "newContent" in the exact place of the old one. "newContent" may be either HTML string,DOM element, or jQuery object - in our case, a jQuery object created above. The method returns the replaced element, which we do not use in this case. This bubble has "pop-in" CSS animation effect, which works only when the element is added to the document for the first time. If I change the text of the element, the same animation effect would work only once.
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

  // Update the visual stat bars to match the numbers
  updateStatBar('.happiness-bar', pet_info['happiness'], HAPPINESS_BAR_MAX);
  updateStatBar('.energy-bar', pet_info['energy'], MAX_ENERGY);
}

// Sets a stat bar's fill width (as a percent of "max") and its color.
// Colors: green when high, yellow in the middle, red when low (classes in style.css).
function updateStatBar(barSelector, value, max) {
  // Convert the stat to a percent, capped at 100% so the bar never overflows
  var percent = Math.min(value / max, 1) * 100;
  var bar = $(barSelector);

  // The CSS "transition" on .stat-bar-fill makes this width change slide smoothly
  bar.css('width', percent + '%');

  // Remove the old color class, then add the one that matches the new level
  bar.removeClass('low medium high');
  if (percent <= 30) {
    bar.addClass('low');
  } else if (percent <= 60) {
    bar.addClass('medium');
  } else {
    bar.addClass('high');
  }
}
