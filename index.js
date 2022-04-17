// Replace the local storage with a new object containing only valid problems,
// retaining existing solutions and initialising new ones for new problems.
function reloadSolutionsList() {
  // Find the current list of solutions from the local storage, or initialise
  // a new locally allocated version as a placeholder if it does not exist.
  let oldStorage = getAllSolutions();
  if (oldStorage === null) {
    oldStorage = {};
  }
  // Keep all solutions for existing problems and create zero-initialised
  // objects for the unknown ones. Solutions that are not part of the latest
  // list of problems are implicitly phased out by this operation.
  newStorage = {}
  Object.keys(window.problems).forEach(index => {
    const date = window.problems[index].date
    if (oldStorage[date] != undefined) {
      newStorage[date] = oldStorage[date];
    } else {
      newStorage[date] = {
        "total_score": 0,
        "words_order": [],
        "words": {},
      };
    }
  })
  // Put the patched solutions list in the local storage.
  setAllSolutions(newStorage);
}

// Replace the list items of the problem selector to only reflect the latest
// state of problems that the user can actually choose between.
function reloadProblemsDropdown() {
  document.getElementById("problem-selector").replaceChildren(...Object.keys(window.problems).map(index => {
    const node = document.createElement("option");
    node.appendChild(document.createTextNode(window.problems[index].date));
    node.setAttribute("value", index);
    return node
  }));
}

// Returns the index of the selected problem. Note that this function should
// not be called before the local storage has been initialised.
function selected() {
  return window["selected-problem-index"]
}

// selectProblem changes the "selected" problem, which causes a reload of the
// UI related to the solution state, like score and list of solved words.
function selectProblem(index) {
  // Update the selected index as stored in the local storage, so that later
  // invocations of other function knows which problem is selected.
  window["selected-problem-index"] = index;
  reloadSelection();
}

// Set the passed optional characters in a random order.
function setOptionalCharactersRandomOrder(optional) {
  for (let i = optional.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [optional[i], optional[j]] = [optional[j], optional[i]];
  }
  document.getElementById("char-optional-0").textContent = optional[0].toUpperCase()
  document.getElementById("char-optional-1").textContent = optional[1].toUpperCase()
  document.getElementById("char-optional-2").textContent = optional[2].toUpperCase()
  document.getElementById("char-optional-3").textContent = optional[3].toUpperCase()
  document.getElementById("char-optional-4").textContent = optional[4].toUpperCase()
  document.getElementById("char-optional-5").textContent = optional[5].toUpperCase()
}

// Return the DOM element for the fixed character.
function getFixedCharacterDOM() {
  return document.getElementById("char-fixed")
}

// Shuffles the order of the optional characters.
function shuffleCharacters() {
  const problem = window.problems[selected()]
  setOptionalCharactersRandomOrder(problem.characters.optional);
}

// Update the score counter and list of solved words with information from the
// solution corresponding to the selected problem index.
function reloadSelection() {
  const solution = getSolution(selected())
  const problem = window.problems[selected()]

  // Load the scoreboard.
  solutionScoreDOM().textContent = solution.total_score;

  // Load the list of words solved.
  updateSolvedScoreDOM()
  updateSolvedWordDOM()

  // Load the problem-characters.
  getFixedCharacterDOM().textContent = problem.characters.fixed.toUpperCase();
  setOptionalCharactersRandomOrder(problem.characters.optional);

  // Clear the solution proposal and start fresh.
  clearSolutionProposal(false)
}

window.onload = function() {
  // Patch the list of "solutions" entries by removing those dates that do not
  // exist in the list of "problems". This means dropping those "solutions"
  // entries forever.
  reloadSolutionsList();

  // Patch the dropdown of "problems" with the latest list.
  // TODO: implement this properly.
  // reloadProblemsDropdown();

  // Make the latest entry of the "problems" list the selected one.
  // This includes populating the characters, the list of words already found
  // in the corresponding solution entry, etc.
  selectProblem(0);
}
