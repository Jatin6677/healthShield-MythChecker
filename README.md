# HealthShield AI — Stop Myths, Save Lives!

A Class 6 HCLTech Jigsaw project. Students type a health claim. The website checks it against a **verified Google Sheet**. If the claim is not in the sheet, the app says **NOT SURE**. It never invents medical facts.

This app uses:

- React + Vite for the website
- CSS for the look
- Google Sheets as the database
- Google Apps Script as a **read-only** JSON API
- Vercel to publish the website

There is **no** Node/Express server, **no** MongoDB, and **no** paid AI API.

## 1. Install and run

You need Node.js and npm on your computer.

```bash
cd "rakshit Project"
npm install
cp .env.example .env
```

On Windows Command Prompt you can copy the env file with:

```bash
copy .env.example .env
```

Open `.env` and paste your Apps Script URL:

```
VITE_SHEETS_API_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

Start the website:

```bash
npm run dev
```

Then open the local address Vite prints (usually `http://localhost:5173`).

Other commands:

```bash
npm test
npm run build
npm run preview
```

## 2. Create the Google Sheet

1. Open [Google Sheets](https://sheets.google.com) and make a new spreadsheet.
2. Name it `HealthShield AI Database`.
3. Put these **exact** headers in row 1:

`ID`, `Claim`, `Alternative_Claims`, `Category`, `Verdict`, `Explanation`, `Source_Name`, `Source_URL`, `Verified`, `Last_Reviewed`

4. You can copy the starter rows from `sheets/sample-health-claims.csv`.
5. `Verdict` must be `FACT` or `MYTH`.
6. `Verified` must be `YES` (or `TRUE` / `1`) before the website will use that row.
7. `Source_URL` must start with `https://`.
8. Extra phrases in `Alternative_Claims` can be split with `|` or `;`.

## 3. Deploy the Apps Script endpoint

1. In the spreadsheet, open **Extensions → Apps Script**.
2. Delete any starter code.
3. Copy everything from `apps-script/Code.gs` into the editor.
4. Save the project. A good name is `HealthShield API`.
5. Click **Deploy → New deployment**.
6. Choose type **Web app**.
7. Settings:
   - Description: `HealthShield read-only API`
   - Execute as: **Me**
   - Who has access: **Anyone**
8. Click **Deploy** and allow permission.
9. Copy the **Web app URL**. It should end with `/exec`.
10. Paste that URL into `.env` as `VITE_SHEETS_API_URL`.
11. Restart `npm run dev`.

This script only has `doGet`. It cannot write or delete rows.

If you change `Code.gs` later, use **Deploy → Manage deployments → Edit → New version**.

## 4. Where to configure the endpoint URL

- Local computer: `.env` (copy from `.env.example`)
- Code default: `src/config/api.js` reads `import.meta.env.VITE_SHEETS_API_URL`
- Vercel: Project **Settings → Environment Variables →** `VITE_SHEETS_API_URL`

Do not paste the URL into React components.

## 5. How matching works

1. The website downloads only verified rows.
2. It cleans capital letters, spaces, and punctuation.
3. It looks for an **exact** cleaned match of `Claim` or an approved alternative phrase.
4. Shared keywords are **not** enough. The word `water` will not match a long water fact.
5. FACT or MYTH appears only when one suitable verified row matches.
6. NOT SURE appears if nothing matches, or if two matching rows disagree.
7. If the API fails, the app shows an error and a retry button. It does **not** use fake backup facts.

## 6. Test the React application

```bash
npm test
npm run build
```

Also try these by hand after the sheet is connected:

- Exact claim: `Vaccines cause autism`
- Alternative: `Do vaccines cause autism?`
- Unmatched: `Eating moonlight makes you grow taller overnight`
- Tiny input: `water`
- Click example chips, source links, retry, and recent searches
- Turn off the URL in `.env` to see the API error screen

## 7. Deploy to Vercel

1. Push this folder to GitHub.
2. Open [Vercel](https://vercel.com) and import the repository.
3. Framework: **Vite**.
4. Add environment variable `VITE_SHEETS_API_URL` with your `/exec` URL.
5. Click **Deploy**.
6. After you change env variables, redeploy so Vite can bake in the new URL.

`vercel.json` is included so page refresh still opens the app.

## 8. Add more verified claims

1. Add a new row in Google Sheets.
2. Fill every important column.
3. Set `Verified` to `YES` only after a teacher checks the explanation and source.
4. Wait a few seconds, then refresh the website. No React code change is needed.

Leave `Verified` blank (or `NO`) for homework drafts. Those rows stay private.

## 9. Five likely judge questions

**1. How does the app know if something is a FACT or a MYTH?**  
A teacher stores the answer in Google Sheets. The website only matches the student’s sentence to that list.

**2. Why Google Sheets instead of a big database?**  
A spreadsheet is free, easy for a Class 6 team, and a teacher can update facts without writing code.

**3. What if a student types a claim that is not in the sheet?**  
The app says NOT SURE. Guessing would be unsafe.

**4. Why not use ChatGPT or a paid AI API?**  
Paid models can make mistakes and cost money. This project only repeats teacher-verified rows.

**5. Is this medical advice?**  
No. It is a school learning tool. A sick person should tell a trusted adult and see a real health worker.

## Project files

- `src/components/` website sections
- `src/utils/` cleaning, matching, and API helpers
- `src/config/api.js` endpoint setting
- `apps-script/Code.gs` read-only JSON API
- `sheets/sample-health-claims.csv` starter rows for the spreadsheet
