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
    dialogue: 'Ah, the "thrill" of being on the clock.',
  },
  {
    background: pond,
    dialogue: "Ivan (new investigator): Oh no... My first real investigation. I'm so nervous.",
  },
  {
    background: pond,
    dialogue: "Ona (senior investigator): It's okay, sweetie. Everyone gets nervous the first time. Our safety comes first. If anything feels wrong, we'll come straight back.",
  },
  {
    background: pond,
    dialogue: "Ivan: Okay... I feel better knowing you're here!",
  },
  {
    background: town,
    dialogue: "The same motions, over and over. About as thrilling as the little town itself.",
  },
  {
    background: mine,
    dialogue: "Miner: What's this?",
  },
  {
    background: town,
    dialogue: "At the market, a merchant offers the miner a fortune for the ore. Word spreads through town.",
  },
  {
    background: mine,
    dialogue: "More digging, more money. Rest, sadly, doesn't pay.",
  },
  {
    background: flood,
    dialogue: "Miner: Water's seeping through the rock. It's coming faster now.",
  },
  {
    background: flood,
    dialogue: "Miner: Just a little farther. There has to be more ore behind this wall—",
  },
  {
    background: flood,
    dialogue: "Miner: The wall's giving way! Run!",
  },
  {
    background: flood,
    dialogue: "Child: Mom? Where are you?",
  },
  {
    background: town,
    dialogue: "Ivan: The water got that high...? Did the people here get out?",
  },
  {
    background: town,
    dialogue: "Ona: We don't know yet. Feeling ready to take a look inside? I'll go first.",
  },
  {
    background: town,
    dialogue: "Ivan: Okay. I'm right behind you!",
  },
  {
    background: mine,
    dialogue: "Ona: They're mine!",
  },
  {
    background: mine,
    dialogue: "Ivan: Ona...?",
  },
  {
    background: flood,
    dialogue: "Ona trips over ore scattered on the bridge and falls.",
  },
  {
    background: pond,
    dialogue: "Item under investigation: Cursed gold coin.",
  },
  {
    background: pond,
    dialogue: "Description: Contact with the coin creates an intense desire for it. Those affected will do whatever it takes to get more.",
  },
  {
    background: pond,
    dialogue: "Investigation outcome: Failed. File sealed.",
  },
];
