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

- [UX Design](UX-DESIGN.md): app map, wireframes, and prototype link
- [Contributing](CONTRIBUTING.md): team norms and development workflow

## Setup and Testing

Setup and testing instructions will be added when the initial application is ready.


## Sprint 1 Plans

### Technology Stack

| Component | Technology | Purpose |
|---|---|---|
| Frontend | React + Vite | Build interactive game pages |
| Styling | CSS | Design responsive mobile interfaces |
| Backend | Python + FastAPI | Handle API requests and game logic |
| Database | MongoDB Atlas | Store user data and game progress |
| Database Driver | PyMongo | Connect Python to MongoDB |
| Authentication | Session / JWT | User login and registration |
| API | REST API + Fetch | Connect frontend and backend |
| Version Control | Git + GitHub | Team collaboration |

### Main Tasks

### Frontend
- Build login, home, fishing, and investigation pages.
- Convert the Sprint 0 prototype into React components.
- Connect frontend pages to backend APIs.
- Implement basic navigation and user interactions.

### Backend
- Set up the Python FastAPI server.
- Implement user registration and login.
- Create APIs for fishing and retrieving anomalous objects.
- Implement investigation choices and game logic.
- Create APIs for saving and loading player progress.

### Database (MongoDB)
- `users` — User accounts and character attributes.
- `objects` — Anomalous objects, descriptions, and ratings.
- `investigations` — Story scenes and player choices.
- `playerProgress` — Current investigation progress and decisions.
- `archives` — Completed investigations and collected trophies.

### Sprint Goal
Build a working version of *Anything but Fish* where users can log in, fish for an anomalous object, start an investigation, make story choices, and save their progress in MongoDB.
