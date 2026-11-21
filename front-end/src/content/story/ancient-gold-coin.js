import callFromDeep from "../../assets/game/scenes/call-from-deep.png";
import sceneOne from "../../assets/game/scenes/img1.png";
import sceneThree from "../../assets/game/scenes/img3.png";
import legacy from "../../assets/game/scenes/legacy.png";

export const chapterTitle = "An Ancient Gold Coin";

// Placeholder illustrations are shared by entries until scene artwork is available.
const pond = { src: sceneOne, width: 1714, height: 2668, viewBox: "0 0 1714 2668" };
const mine = { src: callFromDeep, width: 2388, height: 1668, viewBox: "0 0 2388 1668" };
const flood = { src: sceneThree, width: 1714, height: 2668, viewBox: "0 0 1714 2668" };
// The viewBox excludes this export's transparent padding.
const town = { src: legacy, width: 1875, height: 3204, viewBox: "123 253 1664 1518" };

export default [
  {
    background: pond,
    speaker: null,
    dialogue: 'Ah, the "thrill" of being on the clock.',
  },
  {
    background: pond,
    speaker: "ivan",
    dialogue: "Ivan (new investigator): Oh no... My first real investigation. I'm so nervous.",
  },
  {
    background: pond,
    speaker: "ona",
    dialogue: "Ona (senior investigator): It's okay, sweetie. Everyone gets nervous the first time. Our safety comes first. If anything feels wrong, we'll come straight back.",
  },
  {
    background: pond,
    speaker: "ivan",
    dialogue: "Ivan: Okay... I feel better knowing you're here!",
  },
  {
    background: town,
    speaker: null,
    dialogue: "The same motions, over and over. About as thrilling as the little town itself.",
  },
  {
    background: mine,
    speaker: "miner",
    dialogue: "Miner: What's this?",
  },
  {
    background: town,
    speaker: null,
    dialogue: "At the market, a merchant offers the miner a fortune for the ore. Word spreads through town.",
  },
  {
    background: mine,
    speaker: null,
    dialogue: "More digging, more money. Rest, sadly, doesn't pay.",
  },
  {
    background: flood,
    speaker: "miner",
    dialogue: "Miner: Water's seeping through the rock. It's coming faster now.",
  },
  {
    background: flood,
    speaker: "miner",
    dialogue: "Miner: Just a little farther. There has to be more ore behind this wall—",
  },
  {
    background: flood,
    speaker: "miner",
    dialogue: "Miner: The wall's giving way! Run!",
  },
  {
    background: flood,
    speaker: "child",
    dialogue: "Child: Mom? Where are you?",
  },
  {
    background: town,
    speaker: "ivan",
    dialogue: "Ivan: The water got that high...? Did the people here get out?",
  },
  {
    background: town,
    speaker: "ona",
    dialogue: "Ona: We don't know yet. Feeling ready to take a look inside? I'll go first.",
  },
  {
    background: town,
    speaker: "ivan",
    dialogue: "Ivan: Okay. I'm right behind you!",
  },
  {
    background: mine,
    speaker: "ona",
    dialogue: "Ona: They're mine!",
  },
  {
    background: mine,
    speaker: "ivan",
    dialogue: "Ivan: Ona...?",
  },
  {
    background: flood,
    speaker: null,
    dialogue: "Ona trips over ore scattered on the bridge and falls.",
  },
  {
    background: pond,
    speaker: null,
    dialogue: "Item under investigation: Cursed gold coin.",
  },
  {
    background: pond,
    speaker: null,
    dialogue: "Description: Contact with the coin creates an intense desire for it. Those affected will do whatever it takes to get more.",
  },
  {
    background: pond,
    speaker: null,
    dialogue: "Investigation outcome: Failed. File sealed.",
  },
];
