# RW-61: Create branch and merge to main

Repo: **https://github.com/QuantumBits-CSUS-25-26/RoyalWebsite.git**

---

## Option A: Your folder is not a Git repo yet (e.g. you downloaded a ZIP)

### 1. Clone the repo (fresh copy with Git history)

```powershell
cd c:\dev
# Remove or rename existing folder if you want a clean clone
git clone https://github.com/QuantumBits-CSUS-25-26/RoyalWebsite.git RoyalWebsite-repo
cd RoyalWebsite-repo
```

### 2. Create branch RW-61 from main

```powershell
git fetch origin
git checkout main
git pull origin main
git checkout -b RW-61
```

### 3. Do your work, then commit and push

```powershell
# After editing files...
git add .
git status
git commit -m "RW-61: your short description of changes"
git push -u origin RW-61
```

### 4. Merge to main (recommended: Pull Request on GitHub)

1. Go to: **https://github.com/QuantumBits-CSUS-25-26/RoyalWebsite**
2. You should see a banner: **“RW-61 had recent pushes”** → **Compare & pull request**
3. Or: **Branches** → select **RW-61** → **New pull request**
4. Set **base: main** and **compare: RW-61**
5. Add title/description, then **Create pull request**
6. After review (if required), click **Merge pull request** → **Confirm merge**
7. Optionally delete branch **RW-61** after merge

---

## Option B: You already have a Git repo (e.g. cloned before)

### 1. Point at QuantumBits repo and get latest main

```powershell
cd c:\dev\RoyalWebsite-main\RoyalWebsite-main   # or your repo path
git init
git remote add origin https://github.com/QuantumBits-CSUS-25-26/RoyalWebsite.git
git fetch origin
git checkout -b main origin/main
# Or if main already exists locally:
# git checkout main
# git pull origin main
```

### 2. Create RW-61 from main

```powershell
git checkout main
git pull origin main
git checkout -b RW-61
```

### 3. Commit and push RW-61

```powershell
git add .
git commit -m "RW-61: description of changes"
git push -u origin RW-61
```

### 4. Merge to main

Same as Option A step 4: open a **Pull Request** on GitHub from **RW-61** into **main**, then merge there.

---

## Option C: Merge RW-61 into main locally (no PR)

Use only if your team allows direct pushes to main and you don’t need a PR.

```powershell
git checkout main
git pull origin main
git merge RW-61 -m "Merge branch RW-61 into main"
git push origin main
```

---

## Quick reference

| Step              | Command |
|-------------------|--------|
| Create branch     | `git checkout -b RW-61` |
| Push branch first time | `git push -u origin RW-61` |
| Push later        | `git push` |
| Update main then merge | `git checkout main` → `git pull` → `git merge RW-61` → `git push` |

**Best practice for team repos:** Use **Option A step 4** (Pull Request) so others can review before merging to main.
