# Project Report

## Safer Digital Habits Start with Awareness
### Password Hygiene and Personal Data Protection Campaign Website

**BSc IT Community Engagement Project — Semester 5**

| Student/report detail | Complete before submission |
|---|---|
| Student name | [Your full name] |
| Roll/enrolment number | [Your number] |
| College/institution | [College name] |
| Department | [Department name] |
| Project guide | [Guide name and designation] |
| Academic year | [Academic year] |
| Project submission date | [Date] |

> **Preparation note:** This report describes the implemented website and its code. Replace every square-bracketed field and add only campaign activities, survey results, references, and screenshots that you personally verify. No unverified survey finding or community impact is claimed here.

---

## Abstract

This project is a responsive educational website about password hygiene and personal data protection. It is intended for college students and community members who want clear, beginner-friendly advice about online safety. The site explains common risks, offers a password-strength learning demonstration that runs in the browser, includes a six-question awareness quiz, provides a twenty-question voluntary survey, and displays aggregate survey results on a separate analysis page.

The front end uses semantic HTML, CSS, and vanilla JavaScript. A Python Flask application serves the website, validates survey submissions, and stores selected answer choices in SQLite. An aggregate API supplies counts and question-level percentages to the analysis page. Password-demo input and quiz answers are not saved or sent to the server. Survey responses do not request direct identifiers. This report does not claim that the campaign has improved awareness or that the online deployment is live. Survey findings and completed campaign activities must be documented after they are verified.

---

## 1. Introduction

People use online accounts for communication, education, entertainment, shopping, and services. These accounts can contain personal details and important conversations. A reused password, a deceptive sign-in link, or unnecessary sharing of personal information can create avoidable risks.

The project, **Safer Digital Habits Start with Awareness**, presents the topic using short explanations, familiar examples, and practical actions. The website is both an awareness resource and a demonstration of a small multi-page web application. Its campaign subject is password hygiene and personal data protection.

### 1.1 Background

Basic safety recommendations are more useful when learners can understand and practise them. The website therefore combines information pages with small interactive features. The content is educational: using the website cannot guarantee that an account or device is secure.

### 1.2 Purpose

The purpose is to provide an accessible starting point for learning about unique passwords, phishing, OTP safety, multi-factor authentication, privacy settings, app permissions, and careful data sharing.

---

## 2. Problem Statement and Objectives

### 2.1 Problem statement

Online safety advice can be difficult for beginners to apply when it is presented with unfamiliar terminology or without practical examples. This project addresses the educational need for a simple, navigable website that explains common risks and offers safe opportunities to practise and reflect.

This statement describes the project’s educational motivation; it does not assert that a particular community has a measured level of unsafe behaviour. Add any local needs assessment only if it was actually conducted:

**Verified local needs assessment, if conducted:** [Describe the actual observation, date, and evidence, or write “Not conducted.”]

### 2.2 Objectives

1. Explain common online risks in plain English.
2. Teach visitors to use long, unique passwords and consider a reputable password manager.
3. Encourage multi-factor authentication and safe handling of passwords, OTPs, and recovery codes.
4. Explain ways to protect contact details, identity information, photos, location information, and social accounts.
5. Demonstrate a basic password-strength heuristic without transmitting or storing the entered text.
6. Provide an interactive quiz that gives answer feedback without collecting quiz answers.
7. Offer a voluntary survey and display aggregate statistics based on valid website responses.
8. Provide a checklist, FAQs, and shareable awareness messages.

### 2.3 Scope

The delivered site contains:

- A landing page with Home, About, and Common Risks.
- Separate pages for the password guide/checker, data protection, quiz, survey, analysis, and resources.
- A one-question-at-a-time survey form with a consent step.
- A Flask/SQLite survey API and question-wise aggregate analysis.
- A Render deployment configuration prepared for persistent response storage.

The project is not a security audit, incident-response service, identity-verification service, or guarantee of account safety. The Render configuration is preparation for deployment; deployment and public response collection must be completed and verified separately.

---

## 3. System Analysis

### 3.1 Intended users

The intended audience is college students and community members, subject to the participation and consent requirements set by the college. The writing is aimed at beginners and avoids requiring advanced technical knowledge.

### 3.2 Existing approach and proposed system

| Aspect | General information-only approach | Proposed website |
|---|---|---|
| Presentation | Advice may be spread across pages or use technical language | Dedicated pages with short explanations and familiar examples |
| Practice | Learners may only read advice | Local password-learning demo and interactive quiz |
| Survey | May require a separate service | The survey is part of the site and uses a consistent design |
| Analysis | Results may require manual counting | Aggregate API and charts calculate question-level counts and percentages |
| Privacy | Collection practices may not be obvious | The site explains the intended data use and does not request names or contact details |

### 3.3 Functional requirements

- The visitor can navigate between the home page and each topic page.
- The password demo displays an educational strength indicator and suggestions.
- The quiz accepts answer selections, gives feedback, calculates a score, and can restart.
- The survey loads its questions from a JSON file and shows one question per step.
- The survey requires an answer for each question and voluntary-participation confirmation.
- The server validates survey choices before saving them.
- The analysis page shows response totals and question-wise distributions based on saved valid answers.
- The visitor can refresh the analysis.

### 3.4 Non-functional requirements

- Responsive layout for phone, tablet, and desktop sizes.
- Keyboard-operable navigation and controls, visible focus, and semantic page structure.
- Plain English, readable text, consistent colours, and clear feedback.
- No third-party front-end library is required.
- Do not transmit or store password-demo input or quiz answers.
- Keep survey responses separate from Git and expose only aggregate analysis through the API.
- Use a persistent data volume for a hosted survey; an ephemeral deployment filesystem is unsuitable.

### 3.5 Feasibility

- **Technical:** The project uses HTML, CSS, JavaScript, Python, Flask, and SQLite. These technologies are suitable for a small educational web application.
- **Operational:** The site can be demonstrated locally in VS Code. Online response collection needs a deployed service, persistent storage, consent approval, and a published survey closing date.
- **Economic:** Local development uses a computer and free/open-source software. The configured Render persistent disk requires a paid service plan; check the current provider price before deployment.
- **Schedule:** [Add the actual project start date, work period, and submission date.]

---

## 4. Hardware and Software Requirements

### 4.1 Hardware

- Computer capable of running Python 3 and a modern browser.
- Internet access for installing Flask/Gunicorn or using a hosted instance.
- Phone, tablet, or browser responsive mode for layout checks.

### 4.2 Software

- Visual Studio Code or another code editor.
- Python 3.
- Flask for the website and survey API.
- Gunicorn as the hosted WSGI server.
- SQLite for response storage.
- Modern browser such as Chrome, Edge, Firefox, or Safari.
- Git for version control and connecting the source to a hosting provider.

### 4.3 Local setup

From the project directory:

```sh
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python3 server.py
```

Open `http://127.0.0.1:8000`. In Windows PowerShell, activate the environment with `.venv\Scripts\Activate.ps1`. The survey API is not available when opening an HTML file directly or serving it only through a static file server.

---

## 5. System Design and Website Structure

### 5.1 Design goals

The interface is intended to feel calm, trustworthy, and easy to scan. It uses a dark green/navy palette, white and pale-mint content areas, warm accent colours, readable system sans-serif fonts, rounded cards, and consistent buttons. The sticky header provides access to the site’s pages; on narrow screens, the navigation collapses behind a menu button.

The landing page keeps the introductory Home, About, and Common Risks content together. Detailed learning topics and interactive features have dedicated pages so the navigation does not lead to an excessively long single page.

### 5.2 Page map

| Page | Main content |
|---|---|
| `index.html` | Home hero, project background/objectives/audience/community benefit, common risks |
| `password-guide.html` | Password tips and local password-strength learning demo |
| `data-protection.html` | Personal-data guidance, app permissions, privacy settings, public Wi-Fi, sharing |
| `quiz.html` | Six multiple-choice questions with feedback, score, and restart |
| `survey.html` | Voluntary twenty-question survey with progress and consent |
| `analysis.html` | Aggregate counts, question charts, generated summaries, refresh control |
| `resources.html` | Practical checklist, FAQs, shareable messages, project conclusion |

### 5.3 Architecture

```text
Visitor browser
  ├── HTML pages and shared CSS
  ├── Vanilla JavaScript
  │     ├── Password demo (browser only)
  │     ├── Quiz (browser only)
  │     └── Survey flow and API requests
  └── Flask application (server.py)
        ├── Serves allow-listed pages and assets
        ├── Loads questionnaire choices from data/survey_questions.json
        ├── Validates consent and answers
        ├── Stores answer categories in SQLite
        └── Returns aggregate counts to analysis.js
```

### 5.4 Visual and interaction design

- A consistent site header includes the Safe Step identity, responsive menu, and page links.
- The home hero uses a dark green gradient, large project heading, two learning calls to action, and a shield/account illustration.
- About and risk content use cards with short descriptions, examples, and practical tips.
- The password demo explains that it is only a learning heuristic and warns against entering a real password.
- The survey uses radio buttons, one question per step, Previous/Next controls, a progress indicator, and a separate consent step.
- The analysis uses summary cards and horizontal response bars. Each question shows its valid-response denominator.
- The resource page groups the checklist, FAQ, and shareable messages into cards.
- Responsive layouts reflow content for mobile and provide a collapsible navigation menu.

### 5.5 Data design

The questionnaire definition is stored in `data/survey_questions.json`. Each question has an identifier, prompt, and allowed options. SQLite contains a `survey_responses` table with a generated row identifier and serialized answer choices. It does not include participant names, contact information, a connection address, or a submission timestamp.

The analysis endpoint derives totals from the stored answers. The percentage for an option is:

```text
option percentage = (valid selections for option / valid answers to that question) × 100
```

Each question uses its own valid-answer count as the denominator. The JSON analysis response contains aggregates rather than individual response records.

---

## 6. Implementation

### 6.1 Front end

The HTML files use semantic elements such as `header`, `nav`, `main`, `section`, and `footer`. Labels are associated with interactive inputs. The pages share `assets/css/style.css`, which defines the colour variables, typography, spacing, cards, buttons, responsive breakpoints, and focus styles.

`assets/js/script.js` contains:

- The responsive menu open/close behaviour.
- A browser-only password heuristic that returns a simple strength level and suggestions.
- Quiz answer checking, per-question feedback, score calculation, and restart.
- Survey question rendering, one-step navigation, required-answer checks, consent handling, submission, and response-count feedback.

The password demonstration is not a complete password audit and does not measure compromise or predict resistance to every attack. Its input is not written to local storage, sent to the server, or logged by the application.

### 6.2 Survey server and database

`server.py` defines a Flask application. The questions endpoint returns the JSON questionnaire. The submission endpoint checks request size, content type, consent, question identifiers, and answers against the allowed choices before inserting the response into SQLite. A short in-memory rate limit uses the request connection address temporarily; the address is not written to the response database. Request access logs are disabled.

The count endpoint returns the total number of saved responses. The analysis endpoint validates stored answer shapes and calculates aggregate question distributions. The application adds security-related response headers, serves only allow-listed pages and assets, and blocks access to private response files by not exposing the data directory as a static route.

### 6.3 Analysis page

`assets/js/analysis.js` requests `/api/survey/analysis`, checks the returned data shape and count totals, and creates summary cards and bar charts using DOM elements. It updates on page load, on explicit refresh, and when the page becomes visible. Text from the API is inserted as text rather than interpreted as markup.

### 6.4 Export and retention

`export_survey.py` produces question-wise counts and percentages; it does not export individual response rows. Treat the exported summary as private project data unless the college specifically approves sharing an anonymised aggregate.

`purge_survey.py` provides a guarded deletion operation. It requires `SURVEY_CLOSE_DATE`, refuses to run before 90 days have elapsed, and requires `--confirm` before deleting the response rows. The deletion is an operator-run procedure; it is **not scheduled automatically**. Assign a responsible person and calendar reminder if collecting responses.

### 6.5 Hosted deployment preparation

`render.yaml` configures a Render Python web service using Gunicorn and a persistent disk at `/var/data`. `requirements.txt` lists Flask and Gunicorn. The existing local survey database is ignored by Git and is not included in the repository or deployment. The hosted database should begin empty.

The deployment configuration is prepared but a live Render deployment is not confirmed by this report. Before collecting online responses, verify the deployed URL, persistent disk, consent text, college approval, participant process, retention schedule, and closing-date notice.

---

## 7. Testing and Test Cases

Testing should be recorded with the actual browser/device, date, evidence, and result. The following records distinguish checks executed during development from checks that remain the submitter’s responsibility.

### 7.1 Development checks performed

| Check | Observed result |
|---|---|
| JavaScript syntax checks for the site and analysis scripts | Passed |
| Python syntax checks for the server, export, and purge scripts | Passed |
| Render Blueprint YAML structure and configured health check/disk path | Passed |
| Flask test-client health route, page and asset serving | Passed |
| Survey API question list and aggregate shape | Passed with temporary test database |
| Consent and origin validation | Invalid-consent and invalid-origin requests were rejected in tests |
| Survey write and aggregate count calculation | Passed with temporary test database; test data was isolated from the real survey database |
| Private survey-data URL access | Returned not found in test |
| Retention purge safeguards | Refused early deletion and deletion without `--confirm`; deleted only temporary test data |
| Responsive layout in browser | No horizontal overflow observed at 375, 768, 1024, 1280, and 1440 pixel widths in development checks |
| Quiz scoring and restart | Correct six-answer score and reset verified in browser |
| Survey pagination | Previous/Next navigation and answer retention verified in browser |
| Browser console | No page errors observed during checked flows |

These are development checks, not independent accessibility certification, a penetration test, or a public-hosting acceptance test.

### 7.2 Recommended submission test record

Fill in the last two columns after you personally repeat each test using the final deployment or the local server.

| ID | Test | Expected result | Actual result/date |
|---|---|---|---|
| T01 | Open every page from the menu | Each link opens the correct page | [Fill in] |
| T02 | Use the menu at a phone viewport | Menu opens, reports its state, and closes after navigation | [Fill in] |
| T03 | Use the password demo with a made-up value | Suggestions update; clear button empties it | [Fill in] |
| T04 | Complete quiz with correct and incorrect answers | Feedback and score match selections | [Fill in] |
| T05 | Restart the quiz | Answers, feedback, and score reset | [Fill in] |
| T06 | Move through survey steps and return | One question at a time; saved-in-page selections remain | [Fill in] |
| T07 | Try Next without an answer | Survey stays on the unanswered question | [Fill in] |
| T08 | Submit without consent | Submission is blocked with an explanation | [Fill in] |
| T09 | Submit a valid survey response | Confirmation appears and count changes | [Fill in] |
| T10 | Open analysis with no hosted submissions | Clearly labelled empty state; no fabricated chart results | [Fill in] |
| T11 | Open analysis after valid responses | Counts and percentages use each question’s valid-answer denominator | [Fill in] |
| T12 | Test on phone, tablet, and desktop | Content reflows without horizontal overflow | [Fill in] |
| T13 | Check private database path on hosted site | Database file is not served publicly | [Fill in] |
| T14 | Verify deployment survives restart | Saved responses remain on persistent storage | [Fill in] |

---

## 8. Survey Methodology and Questionnaire

### 8.1 Methodology details to complete

Do not distribute the survey until the college approval and participant information requirements have been checked.

| Method item | Actual project information |
|---|---|
| Survey platform | Website survey; hosted status: [Not deployed / deployed URL] |
| Target participants | [Specify the actual approved target group] |
| Sampling approach | [Describe what you actually used] |
| Survey distribution | [Describe the real method and date] |
| Survey opening date | [Date] |
| Survey closing date | [Date; announce before collection] |
| Consent/ethics approval | [State actual approval and process; do not assume] |
| Under-18 participation | Only if the required college and guardian approvals are obtained |
| Retention | Responses are intended to be removed within 90 days after close; purge is manual and must be scheduled |
| Data collected | Selected answer choices; no names or contact details requested |

### 8.2 Questionnaire

The form contains twenty questions, defined in `data/survey_questions.json`. It covers:

1. Age group.
2. Frequency of internet use.
3. Awareness of password hygiene.
4. Use of different passwords across accounts.
5. Knowledge of strong passwords.
6. Password change practices.
7. Awareness/use of two-factor authentication.
8. Password storage habits.
9. Password sharing.
10. Checking website authenticity before sign-in.
11. Response to suspicious sign-in links.
12. Understanding of phishing.
13. Understanding of personal data.
14. App permission review.
15. Sensitive use on public Wi-Fi.
16. Social media privacy reviews.
17. Response to suspected account compromise.
18. Password and OTP support scams.
19. Confidence protecting personal data.
20. Interest in learning more.

Attach the exact questionnaire wording from the JSON file as **Annexure A**. Do not edit question wording in the report without checking it against the implemented survey.

---

## 9. Actual Survey Data Analysis and Findings

**Status: Findings pending verification of the final hosted survey dataset.**

The site can calculate live website survey totals and question-wise response counts/percentages. However, the local development database and the planned hosted database are separate. The local response is not automatically transferred, and the hosted survey has not been confirmed as deployed. Do not treat development/test data as community survey evidence.

After collecting approved real responses, complete this section using the live analysis page or a verified aggregate export:

- Survey period: [Opening date] to [Closing date].
- Valid response total: [Count from the relevant database].
- Valid answers by question: [Use each question’s denominator].
- Main descriptive observations: [State only what the verified counts support].
- Awareness gaps: [Describe only supported patterns].
- Limitations: [Sampling, response count, non-response, question design, and other real limitations].

No sample percentages or invented findings are included in this report.

---

## 10. Awareness Campaign Activities

The website provides shareable awareness messages and practical guidance. Those features do not prove that a campaign activity took place. Record only activities actually completed:

| Activity | Date/location or channel | Audience | Evidence/annexure |
|---|---|---|---|
| [Activity actually completed] | [Date and venue/channel] | [Actual audience] | [Photo/poster/link/attendance record, if permitted] |
| [Activity actually completed] | [Date and venue/channel] | [Actual audience] | [Evidence] |

If no activity has yet been conducted, state: **“Campaign activities are planned; no completed activity is reported at this stage.”**

---

## 11. Results and Discussion

The implemented result is a multi-page awareness website with a local password demonstration, client-side quiz, paginated survey, SQLite response service, aggregate-analysis page, and practical resources. Development checks exercised core routes and interactions, including response validation, aggregation, empty analysis, quiz scoring/reset, and responsive layout.

These technical checks do not prove a change in participant awareness. Any discussion of educational impact must be based on actual campaign delivery and suitable evidence, such as a documented pre/post evaluation. Survey responses alone should be interpreted in the context of their sample and methodology.

### 11.1 Limitations

- The password checker is a simple educational heuristic, not a complete security audit.
- Survey findings depend on the actual sample, response count, and honest completion.
- No names or contact details are collected, so responses cannot be followed up individually.
- The local and hosted databases are separate.
- The Render service has not been confirmed as live.
- Response deletion is a manual operation, not an automatic scheduled job.
- The site does not provide professional incident response or guarantee security.
- Accessibility checks performed during development are not a formal accessibility audit.

---

## 12. Conclusion and Future Scope

The project implements a beginner-oriented educational website about passwords and personal data. It combines concise explanations with safe browser-side learning interactions and a survey/analysis workflow designed to limit direct personal data collection.

The project’s potential community value is to make basic digital safety practices easier to explore and discuss. Whether it improves awareness or changes behaviour cannot be concluded without evidence from the completed campaign and an appropriate evaluation.

Possible future improvements include:

- Add translations after checking them with fluent speakers.
- Carry out a formal accessibility review with assistive technology users.
- Automate retention deletion after defining a safe and reviewed operational process.
- Use a managed database and monitored backups if the project expands.
- Conduct and document an approved evaluation before making impact claims.

---

## 13. References

The implementation and project structure can be cited as primary project materials:

1. Project source code: `index.html`, `password-guide.html`, `data-protection.html`, `quiz.html`, `survey.html`, `analysis.html`, and `resources.html`.
2. Shared styles and browser interactions: `assets/css/style.css`, `assets/js/script.js`, and `assets/js/analysis.js`.
3. Survey API and data tools: `server.py`, `data/survey_questions.json`, `export_survey.py`, and `purge_survey.py`.
4. Hosting configuration: `render.yaml` and `requirements.txt`.

Add only external resources that you personally consulted and verify their publication details and access dates. Suggested sources to consult include official cyber-safety guidance from your national cyber-security authority and the official documentation for Python, Flask, SQLite, and Render. Enter their exact titles, publishers, URLs, and access dates according to the citation style required by your college:

- [Verified source title]. [Publisher]. [URL]. Accessed [date].
- [Verified source title]. [Publisher]. [URL]. Accessed [date].

---

## 14. Annexures and Screenshots

### Annexures

- **Annexure A:** Exact twenty-question survey from `data/survey_questions.json`.
- **Annexure B:** Verified, anonymised aggregate results after actual approved collection; omit if no results exist.
- **Annexure C:** Test record with dates, browser/device, results, and supporting evidence.
- **Annexure D:** Campaign materials and proof of activities actually completed.
- **Annexure E:** Screenshots personally captured from the final local or hosted website.

### Recommended screenshots

1. Desktop home page showing the campaign title and primary actions.
2. About and Common Risks sections.
3. Password guide and made-up password demo input.
4. Personal-data protection page.
5. Quiz answer feedback and final result.
6. Survey question step and consent step.
7. Survey analysis empty state before response collection, if applicable.
8. Analysis charts after real approved responses, if available.
9. Resources checklist and FAQs.
10. Mobile menu and a representative mobile layout.

Never include real passwords, OTPs, personal records, identifiable survey responses, or private database contents in screenshots.

---

## Simple Viva Explanation

**What does the project do?**  
It teaches everyday password and personal-data safety through a responsive website with guides, a quiz, survey, and aggregate analysis.

**Which technologies are used?**  
HTML, CSS, vanilla JavaScript, Flask, and SQLite. Gunicorn is used to run the Flask application as a hosted WSGI service.

**How does the survey work?**  
The browser loads the allowed question choices from the Flask API. The server validates consent and each answer, then stores only the selected options. A separate endpoint returns aggregate counts for charts.

**Does the password checker store the entered password?**  
No. It runs in the browser as a simple educational heuristic. It is not a complete password security test, and visitors are instructed to use a made-up example.

**Does the quiz collect answers?**  
No. Quiz scoring and feedback run in the browser and are not submitted to the survey API.

**Are there survey findings yet?**  
Use only the verified final dataset. This report intentionally leaves findings pending rather than inventing results.

**Has the website been deployed publicly?**  
The Render configuration is prepared. State that it is deployed only after a public URL has been created and verified.
