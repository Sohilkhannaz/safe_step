# Password Hygiene and Personal Data Protection Campaign

A responsive, beginner-friendly awareness website built with HTML5, CSS3, vanilla JavaScript, Flask, and SQLite.

The landing page keeps the Home, About, and Common Risks sections together. The navigation menu opens dedicated pages for the password guide and local checker, personal data protection, quiz, survey, response analysis, and campaign resources.

## Project structure

```text
.
├── index.html
├── password-guide.html
├── data-protection.html
├── quiz.html
├── survey.html
├── analysis.html
├── resources.html
├── assets/
│   ├── css/style.css
│   └── js/
│       ├── script.js
│       └── analysis.js
├── data/survey_questions.json
├── survey_data/              # Local response database; ignored by Git
├── server.py
├── export_survey.py
├── purge_survey.py
├── requirements.txt
├── render.yaml
├── README.md
└── .gitignore
```

Keep the `survey_data` folder private. It is generated on the computer running the project and should not be submitted or uploaded unless your college explicitly requires anonymised aggregate output.

## Run in VS Code

1. Open this project folder in VS Code and make sure Python 3 is installed.
2. In the VS Code terminal, create and activate a virtual environment:

   ```sh
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

3. Run `python3 server.py` and open `http://127.0.0.1:8000`.
4. Stop the server with Ctrl+C when finished.

On Windows PowerShell, activate with `.venv\Scripts\Activate.ps1`. The survey will not submit if you open `survey.html` directly or use a static-only server such as Python's `http.server`; run `server.py`.

## Native survey and response storage

The Google Forms link has been replaced by the same 20 questions in a form matching the website theme. The questionnaire is on `survey.html` and shows one question per step with Previous/Next controls and a progress indicator; it uses radio-button choices, not dropdowns. Question text and choices are in `data/survey_questions.json`. The page requires an answer on each step and asks the participant to confirm voluntary participation before submission.

On submission, `server.py` validates the answers and stores selected answer choices only. It does not store names, email addresses, phone numbers, connection addresses, or submission timestamps. A connection address is used temporarily in memory for submission limiting; HTTP access logging is disabled. The analysis API returns aggregate data only. Responses are not sent to Google or another third party.

The project team may access responses for analysis; only aggregate counts/charts are public. Responses will be removed within 90 days after the survey closes. The close date is not yet decided and must be announced to participants before collection begins. Participants under 18 may take part only with the approval required by their college and guardian.

Locally, responses are stored in `survey_data/responses.sqlite3`. This directory is Git-ignored; never upload it or its exports. On Render, responses are stored on the persistent disk mounted at `/var/data`. The existing local response is intentionally not imported; the hosted database starts empty.

After the survey closes, set `SURVEY_CLOSE_DATE` in Render to the actual date in `YYYY-MM-DD` format. At least 90 days later, open the service Shell and run `python purge_survey.py --confirm`. The script refuses to delete early or without explicit confirmation; it permanently removes all responses.

## Prepare the Render deployment

The project includes a Render Blueprint in `render.yaml`. It runs Flask through Gunicorn and uses a persistent disk for survey responses. A paid Render web-service plan is required for persistent disks; review current [Render pricing](https://render.com/pricing) and [disk documentation](https://render.com/docs/disks) before creating the service. A free service has an ephemeral filesystem and is not suitable for retaining survey responses.

This workspace does not have a Git repository or a connected Render account, so the public service has **not** been created or deployed. To publish:

1. In VS Code Source Control, initialize a Git repository and publish it to a GitHub repository you control. Check that `survey_data/` is ignored before publishing; do not upload the local database or response export.
2. Sign in to Render, choose **New → Blueprint**, and connect the repository containing `render.yaml`.
3. Review the Blueprint plan and persistent-disk charge, then confirm deployment. Render provides the public HTTPS URL and persistent disk.
4. Test the home, survey, and analysis pages on the deployed HTTPS URL. Confirm the analysis shows zero responses initially.
5. Decide and announce the survey close date before inviting participants. Do not claim survey outcomes until actual hosted responses have been collected and reviewed.

Render's service URL is used for same-origin survey submission. If you later configure a custom domain, set `SITE_ORIGIN` in the Render environment to its exact HTTPS origin.

To count the responses saved on this computer, stop the server and run:

```sh
python3 -c "import sqlite3; c=sqlite3.connect('survey_data/responses.sqlite3'); print(c.execute('SELECT COUNT(*) FROM survey_responses').fetchone()[0]); c.close()"
```

To make a CSV with question-wise counts and percentages (not individual responses), run:

```sh
python3 export_survey.py
```

The summary is written to `survey_data/response_summary.csv`. Keep the database and export private and follow your college's retention rules.

## Survey response analysis

The analysis charts and summary are generated from saved responses to the website survey. `/api/survey/analysis` returns aggregate answer counts only; the browser renders a bar chart for each question and calculates percentages using that question's valid-answer count. It also shows total responses, answer coverage, and the most-selected response for each question. Analysis updates when the page loads, after a successful submission, or when **Refresh analysis** is selected.

Open `analysis.html` directly or use the **View survey analysis** button/navigation link. With no website submissions, the page clearly says that no responses have been submitted and does not display invented statistics. The main page's **Website survey responses** section links to this live analysis; no previous-survey counts are displayed.

## Privacy and learning features

- The password demonstration checks text in the browser only. It does not transmit, save, or log it. Tell visitors not to enter a real password; clear the field after demonstrating it.
- The quiz gives feedback and calculates a score in the browser. It does not save or collect answers.
- The checklist checkboxes are temporary and are not stored.
- The site does not ask for passwords, OTPs, identity documents, names, email addresses, or phone numbers.
- Native survey responses are stored locally in the SQLite database described above; do not collect responses without the consent required by your college.

## Manual test checklist

| Test | Steps | Expected result |
| --- | --- | --- |
| Page navigation | Click each menu link and home call-to-action | The matching standalone page opens |
| Mobile navigation | At a narrow viewport, activate the menu button and a menu link | Menu opens, `aria-expanded` updates, and selection closes the menu |
| Keyboard access | Tab through the page; activate links/buttons; use quiz radio buttons | Focus is visible and controls work without a mouse |
| Password demo | On `password-guide.html`, enter a made-up weak and stronger example, toggle Show/Hide, then Clear | Indicator and suggestions update; clear resets the demo; no persistent data |
| Quiz scoring | On `quiz.html`, submit with no selections, then answer all questions correctly and incorrectly | Missing questions are indicated; score is out of six and feedback matches answers |
| Quiz restart | Choose answers, submit, then select Restart | Selections, feedback, and score reset |
| Survey questions | Open `survey.html` | 20 questions load from the local Flask server and can be navigated with a keyboard |
| Survey pagination | Use Next and Previous through the survey | One question appears per step, selected answers remain selected, and progress updates |
| Survey step required answer | Press Next without choosing an answer | The form stays on that question and focuses the choices |
| Survey required answers | Submit without answering all questions | Browser prevents submission and indicates a required response |
| Survey consent | Answer questions but leave consent unchecked | Browser requires voluntary-participation confirmation |
| Survey save | Submit all valid answers and confirm consent | Success feedback appears and the local saved-response count increases |
| Survey server validation | Send an invalid or incomplete API request | Server rejects it without saving a response |
| Survey export | Run `python3 export_survey.py` after responses are saved | CSV contains per-question counts and percentages, not individual records |
| Survey privacy | Inspect the stored SQLite row | Only answer categories are stored; no direct identifiers or timestamps |
| Analysis page link | Select the View survey analysis button or navigation link | The separate analysis page opens |
| Empty analysis | Open analysis before any new website response is submitted | No-responses message appears and no sample results are shown |
| Automatic analysis | Submit a valid survey response | Response count, question charts, percentages, and most-selected responses update |
| Analysis refresh | Submit another response, then select Refresh analysis | Aggregates include the saved responses |
| Analysis denominator | Compare a question chart with its valid answer count | Percentages use that question's valid-response denominator |
| Website response section | Select View website response analysis | Opens the live analysis page for saved website survey responses |
| Responsive layout | Check at phone (~375px), tablet (~768px), and desktop widths | No horizontal page overflow; content reflows and remains usable |
| Privacy check | Inspect browser storage and network during password and quiz use | No password or quiz-answer storage or transmission |

## College report and viva support

Use your college-prescribed format if one is supplied. The notes below are a truthful structure to complete; replace bracketed prompts with your own project details and evidence.

1. **Introduction:** Introduce online account use and why password hygiene and personal data protection matter. State that the project is an educational awareness website.
2. **Problem statement and objectives:** Describe the awareness need you observed, without asserting unverified community behaviour. List the objectives shown in the website's About section.
3. **System analysis:** Explain the intended users, the website's learning needs, and functional requirements: read educational content, use local demonstrations, attempt the quiz, submit the native survey, and view automatically aggregated answer charts.
4. **Hardware and software requirements:** A computer with Python 3 and a modern browser; VS Code is optional. The site uses HTML5, CSS3, vanilla JavaScript, Flask, Gunicorn for hosted service, and SQLite. Hosting responses online requires a paid Render web service with persistent storage.
5. **System design and website structure:** Describe the multi-page layout: `index.html` has Home, About, and Common Risks; `password-guide.html` has password advice and the local checker; `data-protection.html` has personal-data guidance; `quiz.html` has the quiz; `survey.html` has the questionnaire; `analysis.html` has live response charts; and `resources.html` has the checklist, FAQs, awareness messages, and conclusion. `assets/css/style.css` provides shared responsive design, `assets/js/script.js` handles page interactions, `assets/js/analysis.js` renders aggregate charts, `data/survey_questions.json` defines the questionnaire, `server.py` validates/stores responses in SQLite, `render.yaml` defines hosted service and persistent storage, and `export_survey.py` creates a question-level aggregate CSV.
6. **Implementation:** Describe accessible semantic HTML, CSS grid/flex responsive layouts, browser JavaScript, a Flask JSON API, server-side choice validation, and SQLite storage. Password and quiz activity stays client-side and is not stored.
7. **Testing and test cases:** Adapt the manual test table above, record the date, device/browser, actual result, and pass/fail evidence for each test you perform. Do not claim a test passed before running it.
8. **Survey methodology and questionnaire:** The website form presents the 20 questions in `data/survey_questions.json`. Document the actual target group, sampling approach, dates, consent/privacy approach, distribution method, and actual question wording. Responses from the local or hosted form are stored in SQLite. Keep participation voluntary and avoid collecting unnecessary identifiers.
9. **Actual survey data analysis and findings:** The live charts summarize website survey responses in the local database. Record the valid response count and question-wise counts when writing findings. Use actual response data only and state the survey limitations.
10. **Awareness campaign activities:** List only activities you actually completed (for example, a presentation, poster, or group message), with date and evidence if available. Do not imply that an activity occurred merely because the website provides shareable messages.
11. **Results and discussion:** Discuss actual website tests, campaign evidence, and survey results if available. Separate measured results from expectations; do not claim awareness improved without evaluation evidence.
12. **Conclusion and future scope:** Summarise what was built and what was learned. Possible future work includes adding translations, screen-reader testing, or analysis of real anonymised responses.
13. **References:** Cite sources you personally consulted, such as official cyber-safety guidance, using the citation style required by your college. Verify each title, publisher, URL, and access date; do not copy unverified references.
14. **Annexures:** Attach the questionnaire actually used, anonymised survey summary, test records, campaign material, and screenshots you personally captured. Do not invent screenshots or respondent information.

### Suggested screenshots to capture

- Desktop home page showing the project title, About and Common Risks sections, and navigation.
- Password safety guide and local password demo.
- Personal data protection page.
- Password demo using a made-up example only.
- Quiz with answer feedback and a final score.
- Native survey page showing questions, consent, and local response-count status.
- Separate survey analysis page with live charts and an explicit empty-state before new responses are collected.
- The main-page Website survey responses section linking to live analysis.
- Checklist and FAQ section.
- Mobile menu and one or two representative sections at a phone viewport.

### Simple viva explanation

- **What is the project?** A small awareness website that teaches password and personal-data safety in beginner-friendly language.
- **What is the password demo?** A learning heuristic in JavaScript. It is not a security audit, and it does not send or store the entered text.
- **How does the quiz work?** The browser checks selected radio answers against the answer key, provides feedback, totals the score, and can reset the form.
- **How is the survey handled?** The native form sends selected answers to the Flask API, which validates and saves answer categories in SQLite. The analysis API returns aggregate counts, not individual records, and the analysis page displays charts based on the saved website responses.
- **What are the limitations?** The site cannot guarantee account security, the strength checker is deliberately basic, and survey findings depend on the real sample and response quality.
