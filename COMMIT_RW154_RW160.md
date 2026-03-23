# RW-154 & RW-160 — What changed + how to view + how to commit

## View in the browser (localhost)

| What | URL |
|------|-----|
| **Contact form (RW-154 layout + RW-160 when logged in)** | **http://localhost:3000/** — scroll to the footer and click **Contact Form** |
| **Customer login (sets user for auto-fill / vehicles)** | **http://localhost:3000/login** — use a valid email + password ≥ 8 chars, then go back to home and open **Contact Form** |

**RW-160 flow:** Log in → open homepage → **Contact Form**. Name, email, phone auto-fill; use **Vehicle** dropdown to pick a saved vehicle or **+ Add new vehicle**.

---

## Files changed (for commits)

### RW-154 — Front-end visual fixes (contact form)

- `frontend/src/Components/ContactForm.js` — realigned layout, labels, two-column grid; submit moved out of `<form>` (associated with `form="contact-us-main-form"`).
- `frontend/src/App.css` — contact form styles (`.contact-form-body`, `.contact-form-footer`, `.contact-form-submit-btn`, etc.).

### RW-160 — Logged-in context + vehicles

- `frontend/src/context/CustomerAuthContext.js` — **new** — user state + `localStorage` (`royalCustomerAuth`).
- `frontend/src/index.js` — wrap app with `CustomerAuthProvider`.
- `frontend/src/Components/ContactForm.js` — `useCustomerAuth()`, auto-fill when modal opens; vehicle `<select>` + optional year/make/model.
- `frontend/src/Pages/CustomerLogin.js` — on successful login, `setUser(...)` with sample vehicles, then navigate to dashboard.

---

## Commit on two branches (PowerShell)

From repo root (folder that contains `frontend`):

```powershell
cd "C:\dev\recent-Repo\RoyalWebsite-main\RoyalWebsite-main"

# --- RW-154 ---
git checkout main
git pull origin main
git checkout -b RW-154

git add frontend/src/Components/ContactForm.js frontend/src/App.css
git status
git commit -m "RW-154: Re-align contact form, submit outside form, spacing fixes"
git push -u origin RW-154

# --- RW-160 ---
git checkout main
git checkout -b RW-160

git add frontend/src/context/CustomerAuthContext.js frontend/src/index.js frontend/src/Components/ContactForm.js frontend/src/Pages/CustomerLogin.js
git status
git commit -m "RW-160: Customer auth context, contact form auto-fill and vehicle dropdown"
git push -u origin RW-160
```

**Note:** `ContactForm.js` is shared. If you already committed RW-154 first, on branch RW-160 you may need to **merge `RW-154` into `RW-160`** or cherry-pick, or commit **both tasks on one branch** with one commit message listing RW-154 + RW-160.

**Single branch (both tickets):**

```powershell
git checkout -b RW-154-RW-160
git add frontend/src/context/CustomerAuthContext.js frontend/src/index.js frontend/src/Components/ContactForm.js frontend/src/Pages/CustomerLogin.js frontend/src/App.css
git commit -m "RW-154: Contact form layout; RW-160: Auth context and vehicle dropdown"
git push -u origin RW-154-RW-160
```
