# ⚽ World Cup 2026 Predictor

A full-featured FIFA World Cup 2026 predictor app with:

- **Predictor** — Group stage score predictions with live standings
- **Schedule** — All 48 group stage fixtures by date, filterable by group
- **Results** — Completed matches (updates as the tournament progresses)
- **Standings** — All 12 group tables, live-updating with your predictions
- **Bracket** — Click-through knockout bracket from R32 to the Final

All 48 teams, 12 groups, 104 group stage fixtures with real venues and dates.

---

## 🚀 GitHub Pages Auto-Deploy

This repo is configured to auto-deploy to GitHub Pages on every push to `main`.

### First-time setup

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "initial commit"
   gh repo create wc2026-predictor --public --source=. --push
   # or manually: git remote add origin https://github.com/YOU/wc2026-predictor.git && git push -u origin main
   ```

2. **Enable GitHub Pages:**
   - Go to your repo → **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**
   - Save

3. **That's it.** The workflow at `.github/workflows/deploy.yml` handles everything.
   Your app will be live at: `https://YOUR-USERNAME.github.io/wc2026-predictor/`

### Subsequent deploys

Just push to `main` — GitHub Actions builds and deploys automatically.

```bash
git add .
git commit -m "update predictions"
git push
```

---

## 🛠 Local development

```bash
npm install
npm run dev
```

Open [http://localhost:5173/wc2026-predictor/](http://localhost:5173/wc2026-predictor/)

## Build

```bash
npm run build
```

Output goes to `dist/`.

---

## Adding real results

As matches are played, update `src/data.js` — change `homeScore: null` to the actual score:

```js
// Before
{ id:'A1', ..., homeScore:null, awayScore:null },

// After (e.g. Mexico 2-0 South Africa)
{ id:'A1', ..., homeScore:2, awayScore:0 },
```

Push to `main` and the site auto-deploys with real results shown in the Results and Standings tabs.
