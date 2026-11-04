# Story content

The current chapter is stored in [ancient-gold-coin.json](./ancient-gold-coin.json). This file is part of the frontend source and is committed with the code. [Game.jsx](../../components/Game.jsx) statically imports the whole chapter. Story text is not loaded from a database or saved in localStorage.

The file has four top-level fields:

- `id`: the chapter's stable identifier.
- `title`: the heading shown above the reader.
- `characters`: a map of character keys to `{ "name": "B", "portrait": null }` objects.
- `pages`: the ordered list of story pages.

Each page has a unique, stable `id`. The current Game filters this list to pages with a `speaker` and non-empty `content`, then numbers those dialogues from 1: `/game/1`, `/game/2`, and so on. `/game` and invalid page numbers redirect to `/game/1`. Previous, Next, refresh, and browser history follow that number. Rearranging or inserting dialogues changes their numbered URLs; keep the underlying IDs stable. There is no `goto` field in this version.

The original reader is retained in [GameOld.jsx](../../components/GameOld.jsx) and `GameOld.css`. Its import and `/game-old` routes are commented out in App.jsx. Uncomment them to see all pages, including archive pages, with the original ID-based URLs such as `/game-old/pond-b-nervous`.

## Dialogue pages

A dialogue page displays one speaker's turn. `background` describes the large scene image. `speaker` references a key in `characters`, and `content` is an array of paragraph strings for that speaker. Multiple paragraphs on a page appear together; they are not separate clicks.

This is a page object inside `pages`:

```json
{
  "id": "pond-b-nervous",
  "template": "dialogue",
  "background": {
    "src": null,
    "description": "A view of the fishing pond."
  },
  "speaker": "b",
  "content": [
    "Oh no... My first real investigation. I'm so nervous."
  ]
}
```

Omit `speaker` when using this layout for unnamed narration; the current Game skips those pages. It displays only the dialogue itself, without speaker names or scene descriptions. In the original reader, the character's `portrait` is the small image above the dialogue box. Set a character's name and portrait once in `characters`; [DialoguePage.jsx](../../components/story/DialoguePage.jsx) renders this legacy template.

## Archive pages

An archive page uses `blocks` instead of `speaker` and `content`. Blocks render in array order, so photos and paragraphs can alternate. An `image` block has `src` and `description`; a `text` block has `text`. Only these two block types are implemented.

```json
{
  "id": "old-town",
  "template": "archive",
  "blocks": [
    {
      "type": "image",
      "src": null,
      "description": "Wide view: The town sits in a low basin between the mountains. The mine is on the hillside above it."
    },
    {
      "type": "text",
      "text": "The same motions, over and over. About as thrilling as the little town itself."
    },
    {
      "type": "image",
      "src": null,
      "description": "Miners at work."
    }
  ]
}
```

[ArchivePage.jsx](../../components/story/ArchivePage.jsx) renders these blocks in GameOld. The current Game skips archive pages. A page can contain only images, as `bridge-fall` currently does.

## Artwork and current limits

The current illustrated Game uses the local layers and four temporary random scene images in `src/assets/game`. The following JSON artwork paths are used by GameOld.

Put artwork under `front-end/public`. For example, a file at `front-end/public/story/ancient-gold-coin/pond.png` uses `"src": "/story/ancient-gold-coin/pond.png"`. A portrait at `front-end/public/characters/b.png` uses `"portrait": "/characters/b.png"`.

Keep `src` or `portrait` as `null` while artwork is missing. Background and archive image placeholders display `description`; when an image is available, that description becomes its alternative text. The current descriptions come from the script's visual directions and are separate from spoken dialogue and narration.

The URL identifies the open page, but progress saving is not implemented. Inventory is still a placeholder, and p5 interactions are not implemented. Adding another JSON file does not automatically register a chapter: update the chapter import or selection logic in Game and connect the chapter selection screen when adding more chapters.
