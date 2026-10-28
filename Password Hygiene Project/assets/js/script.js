"use strict";

const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector("#primary-nav");

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  primaryNav.classList.toggle("is-open", !isOpen);
});

primaryNav.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    primaryNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  }
});

// Educational heuristic only: the entered value stays in this page and is
// never written to storage, sent over the network, or logged.
if (document.querySelector("#password-demo")) {
const passwordInput = document.querySelector("#password-demo");
const strengthLabel = document.querySelector("#strength-label");
const strengthMeter = document.querySelector("#strength-meter");
const suggestions = document.querySelector("#password-suggestions");
const showPasswordButton = document.querySelector("#toggle-password");

function assessPassword(value) {
  if (!value) {
    return { level: 0, label: "Strength: not checked", tips: ["Enter a made-up example to see suggestions."] };
  }

  let score = 0;
  const tips = [];
  if (value.length >= 14) score += 1;
  else tips.push("Try a longer password or passphrase (14 or more characters is a useful target).");
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1;
  else tips.push("If it helps you make a memorable phrase, mix different letter cases.");
  if (/\d/.test(value) || /[^A-Za-z0-9]/.test(value)) score += 1;
  else tips.push("Consider adding variety, but length and uniqueness matter more than tricky substitutions.");
  if (!/(.)\1{2,}/.test(value) && !/1234|abcd|qwerty/i.test(value)) score += 1;
  else tips.push("Avoid repeated characters and predictable sequences.");
  if (/password|letmein|admin|welcome/i.test(value)) {
    score = Math.min(score, 1);
    tips.push("Avoid common words and well-known password patterns.");
  }

  const labels = ["Very weak", "Weak", "Fair", "Good", "Stronger example"];
  if (tips.length === 0) tips.push("Good demo result. Make sure every account has a different password.");
  return { level: Math.max(1, score), label: `Strength: ${labels[Math.max(1, score)]}`, tips };
}

function renderPasswordAssessment() {
  const result = assessPassword(passwordInput.value);
  strengthLabel.textContent = result.label;
  strengthMeter.dataset.level = String(result.level);
  suggestions.replaceChildren();
  result.tips.forEach((tip) => {
    const item = document.createElement("li");
    item.textContent = tip;
    suggestions.append(item);
  });
}

passwordInput.addEventListener("input", renderPasswordAssessment);
showPasswordButton.addEventListener("click", () => {
  const reveal = passwordInput.type === "password";
  passwordInput.type = reveal ? "text" : "password";
  showPasswordButton.textContent = reveal ? "Hide" : "Show";
  showPasswordButton.setAttribute("aria-pressed", String(reveal));
});
document.querySelector("#clear-password").addEventListener("click", () => {
  passwordInput.value = "";
  renderPasswordAssessment();
  passwordInput.focus();
});
}

if (document.querySelector("#quiz-form")) {
const quizForm = document.querySelector("#quiz-form");
const quizQuestions = [...document.querySelectorAll(".quiz-question")];
const quizResult = document.querySelector("#quiz-result");

quizForm.addEventListener("submit", (event) => {
  event.preventDefault();
  let score = 0;
  let unanswered = 0;

  quizQuestions.forEach((question) => {
    const answer = question.dataset.answer;
    const selected = question.querySelector("input:checked");
    const feedback = question.querySelector(".answer-feedback");
    feedback.className = "answer-feedback";
    if (!selected) {
      unanswered += 1;
      feedback.textContent = "Choose an answer to see feedback.";
      return;
    }
    const isCorrect = selected.value === answer;
    if (isCorrect) score += 1;
    feedback.classList.add(isCorrect ? "correct" : "incorrect");
    feedback.textContent = isCorrect
      ? "Correct. Nice work!"
      : "Not quite. Review the guidance above and try to remember the safer choice.";
  });

  quizResult.textContent = unanswered
    ? `You scored ${score} out of ${quizQuestions.length} so far. Answer all ${quizQuestions.length} questions to complete the quiz.`
    : `Your score: ${score} out of ${quizQuestions.length}. ${score === quizQuestions.length ? "Excellent work!" : "Review the sections above and try again."}`;
});

document.querySelector("#restart-quiz").addEventListener("click", () => {
  quizForm.reset();
  quizQuestions.forEach((question) => {
    const feedback = question.querySelector(".answer-feedback");
    feedback.textContent = "";
    feedback.className = "answer-feedback";
  });
  quizResult.textContent = "";
  quizQuestions[0].querySelector("input").focus();
});
}

if (document.querySelector("#survey-form")) {
const surveyForm = document.querySelector("#survey-form");
const surveyQuestions = document.querySelector("#survey-questions");
const status = document.querySelector("#survey-status");
const surveySubmit = document.querySelector("#survey-submit");
const surveyNext = document.querySelector("#survey-next");
const surveyPrevious = document.querySelector("#survey-previous");
const surveyFinalStep = document.querySelector("#survey-final-step");
const surveyStepCount = document.querySelector("#survey-step-count");
const surveyProgress = document.querySelector("#survey-progress");
const surveyResponseCount = document.querySelector("#survey-response-count");
let currentSurveyStep = 0;
let renderedSurveyQuestions = [];

function setSurveyStatus(message, isError = false) {
  status.textContent = message;
  status.classList.toggle("survey-error", isError);
}

function renderSurveyQuestions(questions) {
  const fragment = document.createDocumentFragment();
  questions.forEach((question, index) => {
    const step = document.createElement("div");
    step.className = "survey-step";
    step.hidden = index !== 0;
    const fieldset = document.createElement("fieldset");
    fieldset.className = "survey-question";
    const legend = document.createElement("legend");
    const number = document.createElement("span");
    number.className = "question-count";
    number.textContent = String(index + 1).padStart(2, "0");
    legend.append(number, document.createTextNode(` ${question.question}`));
    fieldset.append(legend);

    question.options.forEach((option) => {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = question.id;
      input.value = option;
      input.required = true;
      const text = document.createElement("span");
      text.textContent = option;
      label.append(input, text);
      fieldset.append(label);
    });
    step.append(fieldset);
    fragment.append(step);
  });
  surveyQuestions.replaceChildren(fragment);
  renderedSurveyQuestions = [...surveyQuestions.querySelectorAll(".survey-step")];
  currentSurveyStep = 0;
  updateSurveyStep();
}

function updateSurveyStep() {
  const isFinalStep = currentSurveyStep === renderedSurveyQuestions.length;
  renderedSurveyQuestions.forEach((step, index) => {
    step.hidden = index !== currentSurveyStep;
  });
  surveyFinalStep.hidden = !isFinalStep;
  surveyPrevious.disabled = currentSurveyStep === 0;
  surveyNext.hidden = isFinalStep;
  surveyNext.disabled = !renderedSurveyQuestions.length;
  surveyStepCount.textContent = isFinalStep
    ? "Consent and submit"
    : `Question ${currentSurveyStep + 1} of ${renderedSurveyQuestions.length}`;
  surveyProgress.value = isFinalStep ? renderedSurveyQuestions.length + 1 : currentSurveyStep + 1;
}

function getUnansweredQuestion(stepIndex) {
  const radios = renderedSurveyQuestions[stepIndex]?.querySelectorAll("input[type='radio']");
  if (!radios || [...radios].some((radio) => radio.checked)) return null;
  return radios[0];
}

surveyNext.addEventListener("click", () => {
  const unanswered = getUnansweredQuestion(currentSurveyStep);
  if (unanswered) {
    setSurveyStatus("Please choose an answer before continuing.", true);
    unanswered.focus();
    return;
  }
  currentSurveyStep += 1;
  setSurveyStatus("");
  updateSurveyStep();
  if (currentSurveyStep < renderedSurveyQuestions.length) {
    renderedSurveyQuestions[currentSurveyStep].querySelector("input").focus();
  } else {
    document.querySelector("#survey-consent").focus();
  }
});

surveyPrevious.addEventListener("click", () => {
  if (currentSurveyStep === 0) return;
  currentSurveyStep -= 1;
  setSurveyStatus("");
  updateSurveyStep();
  const selected = renderedSurveyQuestions[currentSurveyStep].querySelector("input:checked");
  (selected || renderedSurveyQuestions[currentSurveyStep].querySelector("input")).focus();
});

surveyForm.addEventListener("submit", (event) => {
  if (currentSurveyStep !== renderedSurveyQuestions.length) {
    event.preventDefault();
    setSurveyStatus("Please complete each survey question before submitting.", true);
    return;
  }
  if (!document.querySelector("#survey-consent").checked) {
    event.preventDefault();
    setSurveyStatus("Please confirm that you choose to participate.", true);
    document.querySelector("#survey-consent").focus();
  }
});

surveyForm.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && event.target instanceof HTMLInputElement && event.target.type === "radio") {
    event.preventDefault();
    surveyNext.click();
  }
});

async function loadSurvey() {
  try {
    const response = await fetch("/api/survey/questions", { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`Question request failed (${response.status}).`);
    const data = await response.json();
    if (!Array.isArray(data.questions) || data.questions.length !== 20) {
      throw new Error("The survey question list is incomplete.");
    }
    renderSurveyQuestions(data.questions);
    surveyNext.disabled = false;
    surveySubmit.disabled = false;
    setSurveyStatus("Please answer all 20 questions. Your answers are stored on the project server for analysis.");
    const countResponse = await fetch("/api/survey/count", { headers: { Accept: "application/json" } });
    if (countResponse.ok) {
      const countData = await countResponse.json();
      surveyResponseCount.textContent = `Responses submitted through this survey: ${countData.responses}`;
    }
  } catch (error) {
    setSurveyStatus("The survey server is unavailable. Start it with python3 server.py, then reload this page.", true);
    console.error(error);
  }
}

surveyForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!surveyForm.reportValidity()) return;

  const formData = new FormData(surveyForm);
  const answers = Object.fromEntries(
    [...formData.entries()].filter(([key]) => key.startsWith("q"))
  );
  surveySubmit.disabled = true;
  surveyPrevious.disabled = true;
  setSurveyStatus("Submitting your response…");
  try {
    const response = await fetch("/api/survey", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ consent: document.querySelector("#survey-consent").checked, answers })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "The response could not be saved.");
    setSurveyStatus(result.message);
    surveyResponseCount.textContent = `Responses submitted through this survey: ${result.responses}`;
    surveyForm.reset();
    currentSurveyStep = 0;
    updateSurveyStep();
  } catch (error) {
    setSurveyStatus(`${error.message} Your answers were not confirmed as saved.`, true);
  } finally {
    surveySubmit.disabled = false;
    surveyPrevious.disabled = currentSurveyStep === 0;
  }
});

loadSurvey();
}
