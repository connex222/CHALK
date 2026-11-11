# CLAUDE.md - CHALK

Instructions for AI assistants working in this repository.

## What this is

CHALK is an interactive football tactics board by Shaun Ellison (FA-qualified grassroots coach). It has animated set pieces, squad management and a 32-play library across 96 phases. It is distributed free within Shaun's two clubs and is not sold publicly. A EULA is shown on first use.

## Architecture

- **One self-contained file: `index.html`.** All CSS, JavaScript, fonts and artwork are inside it.
- Saves to the browser's `localStorage` (boards, plays, library, profile, UI settings, EULA acceptance). Changing a storage key will lose users' saved work, so keep existing keys and migrate old data if the format changes.
- `APP_VERSION` in `index.html` is the app version.

## Hard rules

- **Fully offline.** No network requests of any kind: no CDNs, no web fonts from the internet, no analytics, no `fetch`.
- **No external dependencies.** Everything stays inside `index.html`.
- Must be readable both in direct sunlight on a touchline and in the dark.
- Must work on a phone held in one hand, and be safe to interrupt at any moment without losing work.
- Keep the EULA and Shaun Ellison's name.

## Working with Shaun (the owner)

- Shaun is not a programmer. Explain every step in plain English, in order, and assume no prior knowledge.
- Always return the complete `index.html`, never partial snippets.
- Use UK English and correct UK football terms (pitch, kit, boots, set piece, corner, free kick).
- Never force-push, rewrite history or rename the repository.
