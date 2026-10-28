"use strict";

const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector("#primary-nav");
const analysisSummary = document.querySelector("#live-analysis-summary");
const analysisStatus = document.querySelector("#live-analysis-status");
const analysisCharts = document.querySelector("#live-analysis-charts");
const analysisFindings = document.querySelector("#live-analysis-findings");
const analysisFindingsList = document.querySelector("#live-analysis-findings-list");
const analysisRefresh = document.querySelector("#refresh-analysis");

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

function createSummaryCard(value, label) {
  const card = document.createElement("div");
  card.className = "analysis-stat";
  const number = document.createElement("strong");
  number.textContent = value;
  const text = document.createElement("span");
  text.textContent = label;
  card.append(number, text);
  return card;
}

function createQuestionChart(question) {
  const card = document.createElement("figure");
  card.className = "analysis-question";
  const caption = document.createElement("figcaption");
  caption.textContent = question.title;
  const denominator = document.createElement("p");
  denominator.className = "analysis-source";
  denominator.textContent = `Valid answers to this question: ${question.validResponses}`;
  const bars = document.createElement("div");
  bars.className = "analysis-bars";

  question.options.forEach((option) => {
    const percentage = question.validResponses
      ? (option.count / question.validResponses) * 100
      : 0;
    const row = document.createElement("div");
    row.className = "analysis-bar-row";
    const label = document.createElement("span");
    label.textContent = option.label;
    const track = document.createElement("span");
    track.className = "analysis-bar-track";
    track.setAttribute("role", "img");
    track.setAttribute("aria-label", `${option.count} responses, ${percentage.toFixed(1)} percent`);
    const fill = document.createElement("i");
    fill.style.width = `${percentage}%`;
    track.append(fill);
    const value = document.createElement("b");
    value.textContent = `${option.count} · ${percentage.toFixed(1)}%`;
    row.append(label, track, value);
    bars.append(row);
  });
  card.append(caption, denominator, bars);
  return card;
}

function validateAnalysis(data) {
  if (!Number.isInteger(data.totalResponses) || data.totalResponses < 0 ||
      !Array.isArray(data.questions) || data.questions.length !== 20 ||
      !Number.isInteger(data.totalValidAnswers) || data.totalValidAnswers < 0) {
    throw new Error("The server returned incomplete analysis data.");
  }

  data.questions.forEach((question) => {
    if (typeof question.title !== "string" || !Array.isArray(question.options) ||
        question.options.length === 0 || !Number.isInteger(question.validResponses) ||
        question.validResponses < 0 || question.options.some((option) =>
          typeof option.label !== "string" || !Number.isInteger(option.count) || option.count < 0
        )) {
      throw new Error("The server returned an invalid question distribution.");
    }
    const optionTotal = question.options.reduce((sum, option) => sum + option.count, 0);
    if (optionTotal !== question.validResponses || question.validResponses > data.totalResponses) {
      throw new Error("A question's counts do not match its valid-response total.");
    }
  });

  const expectedAnswers = data.totalResponses * data.questions.length;
  if (data.totalValidAnswers > expectedAnswers) {
    throw new Error("The server returned an invalid total for valid answers.");
  }
}

function renderAnalysis(data) {
  validateAnalysis(data);
  const expectedAnswers = data.totalResponses * data.questions.length;
  analysisSummary.replaceChildren(
    createSummaryCard(String(data.totalResponses), "survey responses"),
    createSummaryCard(String(data.questions.length), "survey questions"),
    createSummaryCard(String(data.totalValidAnswers), "valid answers counted"),
    createSummaryCard(
      `${expectedAnswers ? ((data.totalValidAnswers / expectedAnswers) * 100).toFixed(1) : "0.0"}%`,
      "answer coverage"
    )
  );
  analysisFindingsList.replaceChildren();

  if (data.totalResponses === 0) {
    analysisCharts.replaceChildren();
    analysisFindings.hidden = true;
    analysisStatus.textContent = "No website survey responses have been submitted yet. Charts will appear after real responses are submitted.";
    return;
  }

  analysisCharts.replaceChildren(...data.questions.map(createQuestionChart));
  data.questions.forEach((question) => {
    if (question.validResponses === 0) return;
    const topCount = Math.max(...question.options.map((option) => option.count));
    const topOptions = question.options
      .filter((option) => option.count === topCount)
      .map((option) => option.label);
    const item = document.createElement("li");
    const title = document.createElement("strong");
    title.textContent = question.title;
    item.append(
      title,
      document.createTextNode(
        ` Most selected: ${topOptions.join(" / ")} — ${topCount} of ${question.validResponses} valid answers (${((topCount / question.validResponses) * 100).toFixed(1)}%).`
      )
    );
    analysisFindingsList.append(item);
  });
  analysisFindings.hidden = false;
  analysisStatus.textContent = "Analysis generated from saved website survey responses. Each percentage uses that question's valid-answer count.";
}

async function loadAnalysis() {
  analysisRefresh.disabled = true;
  analysisStatus.textContent = "Updating response analysis…";
  try {
    const response = await fetch("/api/survey/analysis", {
      headers: { Accept: "application/json" },
      cache: "no-store"
    });
    if (!response.ok) throw new Error(`Analysis request failed (${response.status}).`);
    renderAnalysis(await response.json());
  } catch (error) {
    analysisStatus.textContent = "Analysis could not be loaded. Check that the local survey server is running, then try again.";
    console.error(error);
  } finally {
    analysisRefresh.disabled = false;
  }
}

analysisRefresh.addEventListener("click", loadAnalysis);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") loadAnalysis();
});
loadAnalysis();
