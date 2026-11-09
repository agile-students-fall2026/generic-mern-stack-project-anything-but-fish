# Anything but Fish

Anything but Fish is a mobile web game for players who enjoy illustrated stories and conversations with fictional characters. Players meet NPCs in a graphic novel and continue talking to them in a separate chat interface. Items collected from the story and conversations are stored in an inventory and can be submitted during the story to unlock content or continue.

This semester, our MVP will include the graphic novel with dialogue choices and selected p5.js interactions, the inventory and item submission system, and basic NPC chat with memory across sessions.

## Background

Anything but Fish began as a [course proposal](https://github.com/liangchuxin/agile-project-proposal). We are developing it as a team project for Agile Software Development & DevOps.

## Team

- [Celia Liang](https://github.com/liangchuxin)
- [Jonas Chen](https://github.com/JonasChenJusFox)
- [Anthony Wang](https://github.com/aw4580)
- [Nigina Rashidova](https://github.com/monbbdzy)

## Documentation

- [Daily Standup Notes](DAILY-STANDUP-NOTES.md): attendance, progress, next steps, and blockers
- [UX Design](UX-DESIGN.md): app map, wireframes, and prototype link
- [Contributing](CONTRIBUTING.md): team norms and development workflow
- [Story content](front-end/src/content/story/README.md): JSON structure, page templates, and image/text blocks

## Setup and Testing

Requires Node.js 22.12 or newer and MongoDB Atlas. On a new checkout copy the
`.env.example` files in `front-end` and `back-end` to `.env` (ignored by Git).
In `back-end/.env`, configure the Atlas username/password and a random
`JWT_SECRET` of at least 32 characters. See [backend setup](back-end/readme.txt)
for secret generation and Atlas network access.

Run `npm install` and `npm run dev` in `back-end` to start the API on port 8000.
In a second terminal run the same commands in `front-end`, then open
`http://localhost:5173`. Vite forwards `/api` to the backend. Run `npm test` in
`back-end` for Atlas integration tests in an isolated, automatically cleaned test
database; run `npm run build` in `front-end` to verify its production build.

Authentication stores accounts and salted password hashes in MongoDB, with JWTs
in HttpOnly cookies and revocable sessions. The frontend uses native HTML forms
and fetch; database credentials stay on the backend. Password recovery is currently
unavailable; the application has no outgoing email integration or verification-code
step. See [frontend setup](front-end/readme.txt)
and [backend API contract](back-end/readme.txt). Game persistence is still planned.
The current Render configuration hosts only the static frontend; production also
needs a backend service and API routing.


## Sprint 1 Plans

### Sprint Goal

Deliver a mobile-friendly frontend prototype in which players can navigate the game, read an illustrated story, make dialogue choices, preview NPC conversations, and browse Inventory and Plots using mock data and browser state.

### Technology Stack

| Component | Technology | Purpose |
|---|---|---|
| Frontend | React + Vite | Build reusable function components with JSX |
| Routing | React Router | Navigate between screens and detail views |
| Styling | CSS | Design responsive mobile interfaces |
| Frontend State | React hooks + Context | Share mock session, story, and inventory state |
| Demo Data | Mock data behind a frontend data adapter | Preview game content and UI states |

### Main Tasks

- Convert the Sprint 0 prototype into reusable React components, layouts, and styles.
- Build welcome, login, registration, and password-recovery screens with frontend form validation and mock success/error states.
- Complete navigation between the main screen, story reader, character selection, NPC chat, Inventory, Collections, Plots, settings, and save/load screens.
- Implement fishing and investigation interactions, story page transitions, and dialogue choices with mock game state.
- Build the NPC chat interface with message input, a message list, and simulated replies.
- Display sample inventory items and support item details, selection, and simulated submission; show character, chapter, and object entries in Plots.
- Add responsive layouts, keyboard navigation, focus handling, and loading, empty, and error states where applicable.

### Acceptance Criteria

- All planned screens are reachable through frontend navigation and match the prototype or have documented design changes.
- A demo user can enter through a mock login, read a story, choose dialogue, preview a chat, and inspect or submit a sample item using frontend state.
- Inventory and Plots show mock content with working list/detail navigation.
- Main flows work at mobile and desktop widths with usable labels and keyboard focus.
- `npm run build` succeeds in `front-end`, and frontend setup and demo instructions are documented.

## Sprint 2 Plans

### Sprint Goal

Connect the frontend to a persistent game backend, introduce AI-powered NPC conversations with memory across sessions, optimize game logic, and expand Inventory and Plots into a connected gameplay loop: collect an item, discuss it with an NPC, submit it to unlock a story branch, and resume progress after signing in again.

### Technology Stack

| Component | Technology | Purpose |
|---|---|---|
| Backend | Node.js + Express | Serve game APIs and enforce gameplay rules |
| Database | MongoDB Atlas + Mongoose | Validate and persist game content and player state |
| Authentication | Existing JWT cookies + MongoDB sessions | Associate game data with authenticated players |
| AI Chatbot | Server-side AI API client | Generate NPC replies using character and story context |
| Frontend Integration | REST API + Fetch | Replace mock game data with API responses |
| Testing | Mocha + Chai + Supertest + c8 | Verify APIs, game rules, persistence, and coverage |

### Main Tasks

#### Backend and Database Integration

- Extend the existing Express server and account/session system with authenticated game APIs for story content, fishing rewards, inventory, item submission, chat, archives, and save/load.
- Define Mongoose models and seed data for the game collections below, reusing existing user accounts.
- Replace frontend mock data through the data adapter with API requests, including form submissions and loading, empty, and error states.
- Validate request data and player ownership on the server; make reward grants and item submissions atomic and safe to retry so items cannot be duplicated or consumed twice.

| Game Collection | Planned Data |
|---|---|
| `objects` | Item names, illustrations, descriptions, rarity, and acquisition/submission rules |
| `investigations` | Chapters, scenes, dialogue choices, prerequisites, and branch outcomes |
| `playerProgress` | Current scene, decisions, unlocked content, and save timestamps per player |
| `inventories` | Items owned by each player, quantities, acquisition sources, and submission history |
| `conversations` | Per-player NPC message history, context summaries, and memory |
| `archives` | Discovered character/object records, completed chapters, and collection progress |

#### AI Chatbot

- Add a backend chat endpoint that calls the AI service with API credentials stored in environment variables.
- Define NPC personalities and assemble context from the current chapter, relevant items, and prior conversations; limit responses to information the player has unlocked.
- Save messages and a bounded conversation summary so NPC memory survives refreshes and later sessions.
- Connect the chat UI to real replies with pending, timeout, and retry states; validate any suggested item reward or story unlock through backend game rules.

#### Backend Algorithm Optimization

- Centralize story branching, item eligibility, fishing reward selection, and plot unlock evaluation in reusable game-rule functions, with tests for prerequisite checks and invalid actions.
- Profile representative reward, unlock, save/load, and chat-context operations; record baseline latency, database query counts, and AI context size before making changes.
- Reduce repeated lookups with indexed player/content identifiers, batched reads, and paginated inventory and chat history queries; cache reusable story metadata where profiling shows a benefit.
- Bound AI context using recent messages, stored summaries, and relevant story facts; compare the same scenarios after optimization and verify that branching, reward, and memory behavior remain correct.

#### Inventory Content and Interactions

- Add at least three story-linked collectible items with illustrations, descriptions, acquisition sources, and submission conditions.
- Expand the Inventory screen with item details, quantity and acquisition status, and filtering or sorting.
- Connect fishing, story, and validated chat rewards to the saved inventory; support item submission with clear success or rejection feedback and updated quantities.

#### Plots and Story Content

- Add at least one playable chapter beyond **Ancient gold coin**, with two choice branches and an item-gated scene.
- Expand the Characters, Chapters, and Objects categories with biographies, scene summaries, illustrations, and links between related records.
- Derive collection counts and locked/unlocked states from saved player progress, reveal plot details as they are discovered, and let players start or resume available chapters from Plots.

### Acceptance Criteria

- An authenticated player can collect an item, receive an AI NPC reply informed by that item and the current chapter, submit the item to unlock a branch, and see Inventory and Plots update together.
- Story decisions, inventory, archive unlocks, and NPC conversation memory survive refreshes and signing out and back in; accounts cannot access each other's game data.
- The three new collectible items and additional branching chapter are playable, and collection counts reflect actual discoveries.
- Invalid submissions and duplicate requests do not duplicate rewards, consume items twice, or unlock unavailable content; AI failures offer a usable retry state.
- Representative before/after measurements document the effect of backend optimizations, with regression checks for game outcomes.
- Backend tests pass with the existing coverage checks, the frontend production build succeeds, and setup/API documentation includes database seeding and AI configuration.
