# Kobra Password — Password Manager (static frontend)

Simple client-side password manager UI (static HTML/CSS/JS). This repository contains the front-end part of a small password manager demo called "Kobra Password". It is intended for local use and experimentation. The app stores data in the browser's localStorage and provides export/import of data as JSON.

## What is included

- `index.html` — the main static HTML page (now in English).
- `style.css` — styles extracted from the original HTML.
- `script.js` — JavaScript logic: password generation, localStorage-backed saving, import/export, UI interactions.
- `.gitignore` — minimal rules to avoid committing password backups and temporary files.

## Quick start (open locally)

You can open the app directly in your browser by double-clicking `index.html`. For a more robust local test (recommended), run a simple HTTP server and open the page from `http://localhost`:

Windows PowerShell (from the `password-manager` folder):

```powershell
cd "password-manager"        # or navigate to the folder that contains the files
python -m http.server 8000

# Then open http://localhost:8000 in your browser
```

Notes:
- The app is purely client-side. No backend or database is required. Data is stored in your browser's `localStorage`.

## Security notice (important)

- Do NOT commit exported JSON backups that contain real passwords. The repository's `.gitignore` already ignores files named like `kobra-passwords-backup*.json` and `*.backup.json`.
- This demo uses plaintext storage in the browser for simplicity. Do NOT use it to store real, sensitive credentials for production use.


## Contributing

This is a small single-developer demo. If you plan to accept contributions, consider adding contribution guidelines or tests. For now, changes can be made by editing the three main files.

---
_Generated README — tailored to the `password-manager` folder contents._
