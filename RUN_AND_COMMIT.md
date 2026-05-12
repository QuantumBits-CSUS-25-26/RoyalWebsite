# Run the project and commit changes (Windows PowerShell)

Use this guide to run the Royal Website frontend and to commit only the **RW-146** and **RW-151** code changes on GitHub using Windows PowerShell.

---

## What was changed (where to see it)

| Task   | Files changed | What to check |
|--------|----------------|---------------|
| **RW-146** (View Messages) | `frontend/src/Pages/AdminPages/Messages.js` (rewritten), `frontend/src/Pages/AdminPages/Messages.css` (new) | In the app: go to **Admin → Messages** (`/admin/messages`). You should see a messages table (desktop) or cards (mobile), newest first, with sample Contact Us–style messages. No database—sample data only. |
| **RW-151** (Account update mobile) | `frontend/src/Pages/CustomerUpdate.js`, `frontend/src/App.css` | In the app: go to **Account update** (`/account-update`). Resize the window to mobile width or use DevTools device toolbar. The form should stay on screen, stack in one column, and **not** scroll horizontally. |

**Exact paths in your repo:**

- `frontend/src/Pages/AdminPages/Messages.js`
- `frontend/src/Pages/AdminPages/Messages.css`
- `frontend/src/Pages/CustomerUpdate.js`
- `frontend/src/App.css` (only the “begin customer update” block and the new mobile media query)

---

## 1. Run the project

Open PowerShell and go to the project root (where `frontend` and `backend` are):

```powershell
cd "c:\dev\recent-Repo\RoyalWebsite-main\RoyalWebsite-main"
```

Install dependencies (if you haven’t already) and start the frontend:

```powershell
cd frontend
npm install
npm start
```

When it compiles, open **http://localhost:3000** in your browser.

- **RW-146:** Sign in to admin (or go to `/admin/login` if applicable), then open **Messages** in the admin menu, or go directly to **http://localhost:3000/admin/messages**.
- **RW-151:** Go to **http://localhost:3000/account-update** and shrink the window or use a mobile device size to confirm the form is usable and doesn’t scroll horizontally.

---

## 2. Commit only these changes on GitHub

Do this from the **repository root** (same folder as `frontend` and `backend`).

### Option A: Two branches (RW-146 and RW-151)

```powershell
# From repo root: c:\dev\recent-Repo\RoyalWebsite-main\RoyalWebsite-main
cd "c:\dev\recent-Repo\RoyalWebsite-main\RoyalWebsite-main"

# Create and switch to branch RW-146 (messages page)
git checkout -b RW-146

# Stage only the messages files
git add frontend/src/Pages/AdminPages/Messages.js frontend/src/Pages/AdminPages/Messages.css

# Commit
git commit -m "RW-146: Admin view messages page with sample data, reverse chronological"

# Push (use your remote name if different, e.g. origin)
git push -u origin RW-146
```

Then do RW-151 on its own branch:

```powershell
# Switch back to main (or your default branch)
git checkout main

# Create and switch to branch RW-151 (mobile account update)
git checkout -b RW-151

# Stage only the account-update and related CSS changes
git add frontend/src/Pages/CustomerUpdate.js frontend/src/App.css

# Commit
git commit -m "RW-151: Update account information mobile – form visible, no horizontal scroll"

# Push
git push -u origin RW-151
```

### Option B: Single branch with both tasks

If you prefer one branch for both:

```powershell
cd "c:\dev\recent-Repo\RoyalWebsite-main\RoyalWebsite-main"

git checkout -b RW-146-RW-151

git add frontend/src/Pages/AdminPages/Messages.js frontend/src/Pages/AdminPages/Messages.css frontend/src/Pages/CustomerUpdate.js frontend/src/App.css

git commit -m "RW-146: View messages admin page; RW-151: Account update mobile layout"

git push -u origin RW-146-RW-151
```

---

## 3. See the changes before committing

From the repo root:

```powershell
# See which files were modified/added
git status

# See the exact line changes (diff)
git diff frontend/src/Pages/AdminPages/Messages.js
git diff frontend/src/Pages/CustomerUpdate.js
git diff frontend/src/App.css
```

New file (no diff until staged):

```powershell
git status frontend/src/Pages/AdminPages/Messages.css
```

After staging (`git add ...`), use `git diff --staged` to see what will be committed.

---

## 4. Quick reference

| Step            | Command (from repo root) |
|-----------------|--------------------------|
| Run frontend    | `cd frontend; npm start` |
| Check changes   | `git status` and `git diff <file>` |
| Branch RW-146  | `git checkout -b RW-146` |
| Branch RW-151  | `git checkout -b RW-151` |
| Stage files     | `git add <path1> <path2>` |
| Commit          | `git commit -m "message"` |
| Push            | `git push -u origin <branch>` |

Use **Option A** if you need separate branches for RW-146 and RW-151; use **Option B** if one combined branch is enough.
