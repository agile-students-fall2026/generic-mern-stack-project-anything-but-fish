# Daily Standup Notes

Responsibilities:

- **Celia Liang:** Game story and world setting, Plots, and Game Settings content design and implementation.
- **Jonas Chen:** Auth, AI chatbot, and database management.
- **Anthony Wang:** Collection design, collectible records, and Collection interactions.
- **Nigina Rashidova:** Overall frontend data mapping, state coordination, and visual/layout tuning.

## 2026-10-26

### Celia Liang

- **What did I do?** Reviewed the Game, Plots, and Settings wireframes and outlined the opening investigation, world setting, and character relationships.
- **What will I do next?** By October 28, define the scene and character fields, build the story reader layout, and draft the Characters, Chapters, and Objects categories for Plots.
- **Are there any blockers?** No blockers.

### Jonas Chen

- **What did I do?** Reviewed the Auth screens and separated the frontend demo needs from the later AI chatbot and database integration work.
- **What will I do next?** By October 28, build login and registration form interactions, validation, and mock success/error states; document the recovery screen's expected behavior.
- **Are there any blockers?** No blockers.

### Anthony Wang

- **What did I do?** Reviewed the Collection wireframe and identified the initial collectible photos, titles, descriptions, and detail-view requirements.
- **What will I do next?** By October 28, build the Collection board layout, image click targets, detail dialog, and return-to-home navigation using sample records.
- **Are there any blockers?** No blockers.

### Nigina Rashidova

- **What did I do?** Audited the frontend routes, image dimensions, shared layouts, and sample data needed across Game, Auth, Collection, and Plots.
- **What will I do next?** By October 28, establish consistent frontend data fields and mock fixtures, connect the main navigation, and set the common mobile scaling rules.
- **Are there any blockers?** No blockers.

## 2026-10-28

### Celia Liang

- **What did I do?** Drafted the scene/character data structure, story reader layout, and Plots categories, and shared the first scene and collectible IDs.
- **What will I do next?** By October 30, implement previous/next story navigation and mock dialogue choices, populate initial Plots entries, and design Game Settings controls for text size and dialogue speed.
- **Are there any blockers?** No blockers.

### Jonas Chen

- **What did I do?** Added frontend Auth validation and mock success/error feedback, including the unavailable password-recovery state.
- **What will I do next?** By October 30, simulate signed-in/signed-out navigation and build the chat message list, input, pending state, and mock NPC replies.
- **Are there any blockers?** No blockers.

### Anthony Wang

- **What did I do?** Built the Collection board and detail dialog with sample images, click targets, and home navigation; updated sample records to use Celia's IDs.
- **What will I do next?** By October 30, add collected/locked display states, item descriptions, dialog dismissal, and keyboard focus behavior.
- **Are there any blockers?** No blockers.

### Nigina Rashidova

- **What did I do?** Connected the main routes, established shared mock record fields, and aligned the initial mobile layout scaling across screens.
- **What will I do next?** By October 30, tune image alignment, text wrapping, and interactive hit areas on Auth, Collection, and Plots at narrow and wide viewport sizes.
- **Are there any blockers?** No blockers.

## 2026-10-30

### Celia Liang

- **What did I do?** Added story navigation, mock dialogue-choice states, initial Plots descriptions, and local Game Settings controls; supplied the NPC brief and Collection copy.
- **What will I do next?** By November 1, complete one opening-chapter demo, connect its character and object references to Plots, and ensure Settings changes visibly affect the reader.
- **Are there any blockers?** No blockers.

### Jonas Chen

- **What did I do?** Connected mock Auth navigation and built the chat UI with sample replies based on Celia's NPC brief.
- **What will I do next?** By November 1, check invalid-input and session UI states, add simulated chat failure/retry behavior, and draft Auth/chat request and response examples for Sprint 2.
- **Are there any blockers?** No blockers.

### Anthony Wang

- **What did I do?** Added collected/locked Collection states, reviewed descriptions, and implemented dialog close and focus behavior.
- **What will I do next?** By November 1, align record titles and descriptions with Game and Plots, calculate displayed totals from mock discovery data, and check locked-item text for spoilers.
- **Are there any blockers?** No blockers.

### Nigina Rashidova

- **What did I do?** Tuned page scaling, text wrapping, image positions, and click targets using short and long content fixtures.
- **What will I do next?** By November 1, normalize empty/error states and shared frontend state, then walk through Auth → Game → Collection → Plots to find inconsistent data or navigation.
- **Are there any blockers?** No blockers.

## 2026-11-01

### Celia Liang

- **What did I do?** Assembled the opening-chapter frontend demo, connected its Plots references, and checked the visible effects of Game Settings.
- **What will I do next?** By November 3, enrich character/object descriptions and outline an additional chapter with two choice branches and an item-gated scene for Sprint 2.
- **Are there any blockers?** No blockers.

### Jonas Chen

- **What did I do?** Reviewed the mock Auth flows, added chat retry behavior, and drafted Auth/chat payload examples for the frontend handoff.
- **What will I do next?** By November 3, review the existing account/session implementation and draft database models for progress, inventory, conversations, and archives; share the player and content ID conventions.
- **Are there any blockers?** No blockers.

### Anthony Wang

- **What did I do?** Aligned Collection titles and descriptions with Game/Plots and made mock collection counts reflect discovered records.
- **What will I do next?** By November 3, document the Collection archive record shape, discovery conditions, and relationship to usable inventory items; prepare empty, partially collected, and complete datasets.
- **Are there any blockers?** No blockers.

### Nigina Rashidova

- **What did I do?** Walked through the frontend demo, normalized shared state and empty/error displays, and identified remaining navigation and narrow-screen issues.
- **What will I do next?** By November 3, fix those issues and organize frontend data adapters so mock records can later be replaced with API responses without rewriting page layouts.
- **Are there any blockers?** No blockers.

## 2026-11-03

### Celia Liang

- **What did I do?** Expanded character and object descriptions and drafted the next chapter's branches, required item, and discovery conditions.
- **What will I do next?** By November 5, map branch and unlock conditions to Jonas's proposed progress fields, add spoiler-aware Plots descriptions, and review Game Settings defaults and labels.
- **Are there any blockers?** No blockers.

### Jonas Chen

- **What did I do?** Reviewed account/session behavior and drafted the game-data models, ownership fields, and ID conventions for the team's API examples.
- **What will I do next?** By November 5, specify item-submission and archive-update payloads, database seed fixtures and indexes, and the NPC prompt/context format using chapter and item data.
- **Are there any blockers?** No blockers.

### Anthony Wang

- **What did I do?** Documented Collection record fields and prepared empty, partial, and complete discovery datasets, distinguishing archive records from usable inventory items.
- **What will I do next?** By November 5, map Collection records to the proposed archive response, improve locked/empty states, and provide examples of first discovery and repeated reward events to Jonas.
- **Are there any blockers?** No blockers.

### Nigina Rashidova

- **What did I do?** Fixed the first navigation/layout issues and separated frontend display data from the adapters that supply mock records.
- **What will I do next?** By November 5, map the proposed API response fields into those adapters and exercise loading, failure, long-chat, and larger-collection states with realistic fixtures.
- **Are there any blockers?** No blockers.

## 2026-11-05

### Celia Liang

- **What did I do?** Mapped the additional chapter's branch and item conditions to the proposed progress model, added spoiler-aware Plots copy, and reviewed Settings defaults.
- **What will I do next?** By November 7, proofread the story/Plots content, check that locked records hide undiscovered facts, and finalize the chapter and settings handoff data.
- **Are there any blockers?** No blockers.

### Jonas Chen

- **What did I do?** Specified item/archive payloads, seed fixtures, index candidates, and NPC context rules; shared pagination and error examples with Nigina.
- **What will I do next?** By November 7, prepare Sprint 2 implementation tasks for database persistence, live AI replies, and bounded conversation memory, including tests for duplicate rewards and baseline query/context measurements.
- **Are there any blockers?** No blockers.

### Anthony Wang

- **What did I do?** Mapped Collection records to the archive contract, improved locked/empty states, and supplied first-discovery and duplicate-event examples.
- **What will I do next?** By November 7, polish Collection image placement and dialog behavior, verify counts with all three datasets, and check that names and descriptions match Celia's final content.
- **Are there any blockers?** No blockers.

### Nigina Rashidova

- **What did I do?** Mapped the draft response fields into frontend adapters and exercised loading/error states, long NPC messages, and larger Collection datasets.
- **What will I do next?** By November 7, run a full frontend walkthrough at mobile and desktop widths, resolve state/count mismatches, and check that data refreshes preserve usable navigation and focus.
- **Are there any blockers?** No blockers.

## 2026-11-07

### Celia Liang

- **What did I do?** Reviewed the Game/Plots content, checked locked-record spoilers, and prepared the chapter, branch, and Game Settings handoff data.
- **What will I do next?** By November 8, finish the content review with the team and hand off the additional chapter outline, item-gate rules, and remaining implementation tasks for Sprint 2.
- **Are there any blockers?** No blockers.

### Jonas Chen

- **What did I do?** Prepared the persistence and chatbot task breakdown, conversation-memory examples, duplicate-reward checks, and backend measurement plan.
- **What will I do next?** By November 8, finalize Auth/chat/database setup notes, confirm development access, and document the implementation order: account ownership, game persistence, live AI chat, then measured optimization.
- **Are there any blockers?** No blockers.

### Anthony Wang

- **What did I do?** Reviewed Collection layouts and dialogs, checked counts against empty/partial/complete datasets, and aligned record text with the final content handoff.
- **What will I do next?** By November 8, finish the Collection demo checklist and hand off discovery rules, archive examples, and remaining content-enrichment tasks for Sprint 2.
- **Are there any blockers?** No blockers.

### Nigina Rashidova

- **What did I do?** Completed the proposed frontend walkthrough, reconciled shared IDs and displayed counts, and reviewed mobile/desktop layout, navigation, and focus behavior.
- **What will I do next?** By November 8, run the frontend production build, record any remaining demo issues, and hand off adapter mappings and API-integration checks for Sprint 2.
- **Are there any blockers?** No blockers.
