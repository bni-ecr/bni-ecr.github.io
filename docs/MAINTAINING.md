# Maintaining the BNI-ECR Network website

A static website (plain HTML, CSS and a little JavaScript). No build step, no database, no cost.

## Publish it free on GitHub Pages
1. Create a free GitHub **organisation** (e.g. `bni-ecr`) so the site is not tied to one person's account.
2. Create a repository (e.g. `bni-ecr.github.io` or `website`), upload everything in this folder (including the hidden `.nojekyll` file).
3. Repository → **Settings → Pages** → Source: *Deploy from a branch* → `main` / `/ (root)` → Save.
4. After a minute the site is live at `https://<org>.github.io/<repo>/` (or `https://<org>.github.io/` if the repo is named `<org>.github.io`).
5. Optional: add a custom domain in the same Pages settings.

Colleagues can be added as collaborators and can edit files directly in the GitHub web interface.

## Preview on your computer
Browsers block data loading from `file://`, so run a local server in this folder:
`python3 -m http.server 8000` and open http://localhost:8000

## Editing content (no HTML needed)
| What | File |
|---|---|
| Contact email, menu, **membership form link** | `data/site.json` |
| Featured event, upcoming and past events | `data/events.json` (copy a block, edit it) |
| Member profiles | `data/members.json` (only add people who consented; put photos in `assets/img/` and set `"photo"`) |
| Resources | `data/resources.json` (add `{ "title": "...", "url": "..." }` to a category's `items`) |
| News items on the home page | `data/news.json` |

Page text (About, Activities, etc.) is in the `.html` files and can be edited directly. Items marked `[PLACEHOLDER]` need replacing.

## Join form
1. Create a Google Form with the questions in `docs/FORM_QUESTIONS.md`.
2. Send → link: paste it into `joinFormUrl` in `data/site.json`.
3. Send → `<>` embed: copy the `src` URL into `joinFormEmbedUrl` to show the form inside the Join page.
Until then, the Join button opens a pre-filled email.
