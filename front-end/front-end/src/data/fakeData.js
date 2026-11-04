// FAKE DATA — later the back-end team will replace this with real API data.
// Shape: chapters -> each chapter has characters.
// All image paths point into the "public/art/" folder. To use your real artwork,
// just replace the placeholder files with your own files using the SAME file names
// (or change the path strings below).

// Same 6 characters are reused in every chapter for now, so every tile is clickable.
// If characters should look different per chapter, give each its own image path, e.g. "/art/ch2-char1.png".
const makeCharacters = () => [
  { id: 1, name: "Character 1", image: "/art/character1.png", scene: null, replies: ["Oh, hello there.", "I wasn't expecting company.", "Tell me more."] },
  { id: 2, name: "Character 2", image: "/art/character2.png", scene: null, replies: ["Keep your voice down.", "They might be listening."] },
  { id: 3, name: "Character 3", image: "/art/character3.png", scene: null, replies: ["Hah! Good one.", "Go on, I'm listening."] },
  { id: 4, name: "Character 4", image: "/art/character4.png", scene: null, replies: ["Hmm. Interesting.", "I'll think about it."] },
  { id: 5, name: "Character 5", image: "/art/character5.png", scene: null, replies: ["Not now.", "Maybe later."] },
  { id: 6, name: "Character 6", image: "/art/character6.png", scene: null, replies: ["Welcome back!", "What took you so long?"] },
];
// `scene` is the artwork shown at the top of the chat. null = grey "scene" box.
// Example: scene: "/art/scene-ch1-char1.png"

export const backgrounds = {
  chapters: "/art/chapters-bg.png",
  characters: "/art/characters-bg.png",
};

export const chapters = [1, 2, 3, 4, 5, 6].map((n) => ({
  id: n,
  title: `Chapter ${n}`,
  cover: `/art/chapter${n}.png`,
  characters: makeCharacters(),
}));