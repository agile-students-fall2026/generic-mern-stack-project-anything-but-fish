# Story content

## Illustrated reader

[ancient-gold-coin.js](./ancient-gold-coin.js) stores the ordered entries for [Game.jsx](../../components/Game.jsx). Each entry sets a `background` and a `dialogue` string. Put the speaker directly in the string when a character speaks, for example `"Miner: What's this?"`. Narration, scene actions, and archive text use the same field.

Click or tap the radio panel to advance. Its upper-left control goes back one entry. The URL identifies the entry by its position in the array, starting at `/game/1`. Refresh and browser history follow that number. Inserting or rearranging entries changes their numbered URLs.

The four illustrations in `src/assets/game/scenes` are placeholders. Set an entry's `background` to the illustration it should display. The image dimensions and SVG view box are stored alongside each illustration so the masked scene can scale without distortion.

## Legacy reader

[ancient-gold-coin.json](./ancient-gold-coin.json) contains the original chapter data for [GameOld.jsx](../../components/GameOld.jsx). Its import and `/game-old` routes are commented out in App.jsx. Uncomment them to see all pages with their ID-based URLs, such as `/game-old/pond-b-nervous`.

The file has four top-level fields:

- `id`: the chapter's stable identifier.
- `title`: the heading shown above the reader.
- `characters`: a map of character keys to `{ "name": "B", "portrait": null }` objects.
- `pages`: the ordered list of story pages.

Each legacy page has a unique, stable `id`.

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

Omit `speaker` when using this layout for unnamed narration. The character's `portrait` is the small image above the dialogue box. Set a character's name and portrait once in `characters`. [DialoguePage.jsx](../../components/story/DialoguePage.jsx) renders this legacy template.

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

[ArchivePage.jsx](../../components/story/ArchivePage.jsx) renders these blocks in GameOld. A page can contain only images, as `bridge-fall` currently does.

## Legacy artwork

Put artwork under `front-end/public`. For example, a file at `front-end/public/story/ancient-gold-coin/pond.png` uses `"src": "/story/ancient-gold-coin/pond.png"`. A portrait at `front-end/public/characters/b.png` uses `"portrait": "/characters/b.png"`.

Keep `src` or `portrait` as `null` while artwork is missing. Background and archive image placeholders display `description`; when an image is available, that description becomes its alternative text. The current descriptions come from the script's visual directions and are separate from spoken dialogue and narration.
