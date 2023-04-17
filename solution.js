const solutionsLocalStorageKey = "solutions"

// Local Storage ---------------------------------------------------------------

// Return all solutions from the local storage.
function getAllSolutions() {
  return JSON.parse(window.localStorage.getItem(solutionsLocalStorageKey))
}

// Set the full list of solutions in the local storage.
function setAllSolutions(solutions) {
  window.localStorage.setItem(solutionsLocalStorageKey, JSON.stringify(solutions))
}

// Returns the solution corresponding to the problem with the specified index,
// from the browser's local storage. Note that this function should not be
// called before the local storage has been initialised.
function getSolution(index) {
  return getAllSolutions()[window.problems[index].start]
}

// Sets the solution of the specified index in the local storage.
function setSolution(index, solution) {
  const solutions = getAllSolutions()
  solutions[window.problems[index].start] = solution
  setAllSolutions(solutions)
}

// DOM -------------------------------------------------------------------------

// Returns the DOM element representing the current solution proposal.
function solutionProposalDOM() {
  return document.getElementById("terminal-staging")
}

// Return the DOM element representing the current solution score.
function solutionScoreDOM() {
  return document.getElementById("scoreline-value")
}

// Return the DOM element representing the current solution score percentage.
function solutionScorePercentDOM() {
  return document.getElementById("scoreline-ratio-percent-value")
}

// Return the DOM element representing the current solution score ratio.
function solutionScoreRatioDOM() {
  return document.getElementById("scoreline-ratio")
}

// Returns the DOM element representing the list of solved words.
function solutionWordListDOM() {
  return document.getElementById("solved-expandable-columns")
}

// Returns the DOM element representing the list of solved words.
function solutionWordListCountDOM() {
  return document.getElementById("solved-expandable-count")
}

// Returns the DOM element representing the summary of solved words.
function solutionWordSummaryDOM() {
  return document.getElementById("solved-summary-list")
}

// Returns a new solution word list item with the specified word.
function newSolutionWordDOM(word) {
  const node = document.createElement("div");
  node.setAttribute("class", "solved-expandable-column-item");
  node.textContent = word;
  return node;
}

// Return the DOM element representing the alert message box.
function getAlertMessageDOM() {
  return document.getElementById("alert-message")
}

// Return the DOM element representing the terminal box.
function getTerminalDOM() {
  return document.getElementById("terminal")
}

// Logic -----------------------------------------------------------------------

// Adds a character to the current soliution proposal. The character
// is sourced from the target node of the passed event.
function appendSolutionProposal(e) {
  solutionProposalDOM().textContent += e.target.textContent.toLowerCase();
}

// Remove the last character from the current solution propsal.
function popSolutionProposal() {
  solutionProposalDOM().textContent = solutionProposalDOM().textContent.slice(0, -1);
}

// Returns a promise that is fulfilled after the specified amount of ms.
function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

// Remove the entire proposed solution.
function clearSolutionProposal(shake) {
  if (shake) {
    getTerminalDOM().classList.add("terminal-error")
    sleep(750).then(() => {
      solutionProposalDOM().textContent = ""
      getTerminalDOM().classList.remove("terminal-error")
    });
  } else {
    solutionProposalDOM().textContent = ""
  }
}

// Write the passed error message in the alert box.
function writeError(text) {
  const node = document.createElement("span");
  node.textContent = text;
  node.classList.add("alert-error-message");
  getAlertMessageDOM().replaceChildren(node)
}

// Write the passed score in the alert box.
function writeScore(word) {
  let text = ""
  if (word.panagram) {
    text = "Panagram!"
  } else if (word.points >= 25) {
    text = "Fantastiskt!"
  } else if (word.points >= 20) {
    text = "Otroligt!"
  } else if (word.points >= 15) {
    text = "Utmärkt!"
  } else if (word.points >= 9) {
    text = "Läckert!"
  } else if (word.points >= 4) {
    text = "Snyggt!"
  } else {
    text = "Bra!"
  }
  const greeting = document.createElement("span");
  greeting.textContent = text;
  greeting.classList.add("alert-message-greeting")
  if (word.panagram) {
    greeting.classList.add("gold")
  }
  const points = document.createElement("span");
  points.textContent = " +" + word.points + " poäng";
  points.classList.add("alert-message-points")

  getAlertMessageDOM().replaceChildren(greeting, points)
}

// Updates the solved score in the DOM, using the contents of the local storage.
// This means the storage must be updated before this operation is performed.
function updateSolvedScoreDOM() {
  const solution = getSolution(selected())
  const problem = window.problems[selected()]
  const percentage = Math.floor((solution.total_score / problem.total_score)*100)
  if (percentage < 33) {
    if (percentage == 0 && solution.words_order.length == 0) {
      solutionScoreRatioDOM().className = "gray"
    } else {
      solutionScoreRatioDOM().className = "bronze"
    }
  } else if (percentage >= 33 && percentage < 66) {
    solutionScoreRatioDOM().className = "silver"
  } else if (percentage >= 66) {
    solutionScoreRatioDOM().className = "gold"
  }
  solutionScoreRatioDOM().style.width = percentage + "%"
  solutionScorePercentDOM().textContent = percentage
  solutionScoreDOM().textContent = solution.total_score 
}

// Updates the list of solved words in the DOM, using the contents of the local
// storage. This means the storage must be updated before this operation is
// performed.
function updateSolvedWordDOM() {
  const solution = getSolution(selected())
  if (solution.words_order.length == 0) {
    solutionWordSummaryDOM().textContent = "Inga ord hittade ännu"
  } else {
    solutionWordSummaryDOM().textContent = solution.words_order.reverse().join(", ")
    solutionWordListDOM().replaceChildren(...solution.words_order.sort().map((word) => {
      return newSolutionWordDOM(word)
    }));
  }
  solutionWordListCountDOM().textContent = solution.words_order.length
}

// Submit the current solution proposal for review.
function submitSolutionProposal() {
  // See if the word exists in the problem's list of solutions.
  let failed = true
  const proposedWord = solutionProposalDOM().textContent
  if (proposedWord.length < 4) {
    writeError("För kort");
  } else if (!proposedWord.includes(window.problems[selected()].characters.fixed)){
    writeError("Saknar bokstaven i mitten");
  } else {
    const problemWord = window.problems[selected()].words[proposedWord];
    if (problemWord) {
      // The proposed word is a match! However, we must determine whether or
      // not it has already been found by the player.
      const solution = getSolution(selected());
      const found = solution.words[proposedWord];
      if (found) {
        writeError("Redan hittad!");
      } else {
        failed = false
        writeScore(problemWord)

        // Update the local cache for persistency.
        solution.words[proposedWord] = problemWord;
        solution.total_score += problemWord.points;
        solution.words_order.push(proposedWord);
        setSolution(selected(), solution);

        // Update the DOM.
        solutionScoreDOM().textContent = solution.total_score.toString()
        updateSolvedScoreDOM();
        updateSolvedWordDOM();
      }
    } else {
      // The proposed word was not a match.
      writeError("Okänt ord")
    }
  }
  // Reset the proposed word ahead of the next attempt.
  clearSolutionProposal(failed)
}