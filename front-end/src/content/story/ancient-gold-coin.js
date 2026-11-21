import pondImage from "../../assets/game/scenes/ancient-gold-coin/coin-01-pond.png";
import coinMemoryImage from "../../assets/game/scenes/ancient-gold-coin/coin-02-coin-memory.png";
import miningRoutineImage from "../../assets/game/scenes/ancient-gold-coin/coin-03-mining-routine.png";
import oreDiscoveryImage from "../../assets/game/scenes/ancient-gold-coin/coin-04-ore-discovery.png";
import marketImage from "../../assets/game/scenes/ancient-gold-coin/coin-05-market.png";
import merchantImage from "../../assets/game/scenes/ancient-gold-coin/coin-06-merchant.png";
import oreAppraisalImage from "../../assets/game/scenes/ancient-gold-coin/coin-07-ore-appraisal.png";
import oreTradeImage from "../../assets/game/scenes/ancient-gold-coin/coin-08-ore-trade.png";
import deepMiningImage from "../../assets/game/scenes/ancient-gold-coin/coin-09-deep-mining.png";
import oreCartsImage from "../../assets/game/scenes/ancient-gold-coin/coin-10-ore-carts.png";
import floodImage from "../../assets/game/scenes/ancient-gold-coin/coin-11-flood.png";
import ruinedTownImage from "../../assets/game/scenes/ancient-gold-coin/coin-12-ruined-town.png";
import pedestalDetailImage from "../../assets/game/scenes/ancient-gold-coin/coin-14-coin-pedestal-detail.png";
import pedestalImage from "../../assets/game/scenes/ancient-gold-coin/coin-15-coin-pedestal.png";
import possessionImage from "../../assets/game/scenes/ancient-gold-coin/coin-16-possession.png";
import betrayalImage from "../../assets/game/scenes/ancient-gold-coin/coin-17-betrayal.png";
import bridgeFallImage from "../../assets/game/scenes/ancient-gold-coin/coin-18-bridge-fall.png";
import fallingCoinImage from "../../assets/game/scenes/ancient-gold-coin/coin-19-falling-coin.png";

export const chapterTitle = "An Ancient Gold Coin";

function scene(src, width = 2480, height = 3508) {
  return { src, width, height, viewBox: `0 0 ${width} ${height}` };
}

const backgrounds = {
  pond: scene(pondImage),
  coinMemory: scene(coinMemoryImage),
  miningRoutine: scene(miningRoutineImage),
  oreDiscovery: scene(oreDiscoveryImage),
  market: scene(marketImage),
  merchant: scene(merchantImage),
  oreAppraisal: scene(oreAppraisalImage),
  oreTrade: scene(oreTradeImage),
  deepMining: scene(deepMiningImage),
  oreCarts: scene(oreCartsImage),
  flood: scene(floodImage, 1824, 1286),
  ruinedTown: scene(ruinedTownImage, 1634, 1098),
  pedestalDetail: scene(pedestalDetailImage, 744, 1003),
  pedestal: scene(pedestalImage),
  possession: scene(possessionImage, 2342, 3310),
  betrayal: scene(betrayalImage),
  bridgeFall: scene(bridgeFallImage),
  fallingCoin: scene(fallingCoinImage),
};

// Camera rectangles use original-image pixels; the reader fits and clamps the viewport.
// Repeated camera coordinates keep split dialogue pages on the same framing.
export default [
  // Image 01: pages 1–5.
  {
    id: "pond-opening",
    background: backgrounds.pond,
    speaker: null,
    dialogue: 'Ah, the "thrill" of being on the clock.',
  },
  {
    id: "pond-ivan-nervous",
    background: backgrounds.pond,
    speaker: "ivan",
    dialogue:
      "Ivan (new investigator): Oh no... My first real investigation. I'm so nervous.",
  },
  {
    id: "pond-ona-reassures",
    background: backgrounds.pond,
    speaker: "ona",
    dialogue:
      "Ona (senior investigator): It's okay, sweetie. Everyone gets nervous the first time.",
  },
  {
    id: "pond-ona-safety",
    background: backgrounds.pond,
    speaker: "ona",
    dialogue:
      "Ona: Our safety comes first. If anything feels wrong, we'll come straight back.",
  },
  {
    id: "pond-ivan-relieved",
    background: backgrounds.pond,
    speaker: "ivan",
    dialogue: "Ivan: Okay... I feel better knowing you're here!",
  },

  // Image 02: page 6.
  {
    id: "coin-memory",
    background: backgrounds.coinMemory,
    speaker: null,
    dialogue: "",
  },

  // Image 03: pages 7–8.
  {
    id: "mining-establishing",
    background: backgrounds.miningRoutine,
    camera: { x: 0, y: 0, width: 2480, height: 2600 },
    speaker: null,
    dialogue: "",
  },
  {
    id: "mining-routine",
    background: backgrounds.miningRoutine,
    camera: { x: 0, y: 908, width: 2480, height: 2600 },
    speaker: null,
    dialogue:
      "The same motions, over and over. About as thrilling as the little town itself.",
  },

  // Image 04: page 9.
  {
    id: "ore-discovery",
    background: backgrounds.oreDiscovery,
    speaker: "miner",
    dialogue: "Miner: What's this?",
  },

  // Image 05: page 10.
  {
    id: "market-arrival",
    background: backgrounds.market,
    speaker: null,
    dialogue: "", // TODO: Market narration.
  },

  // Image 06: page 11.
  {
    id: "merchant-introduction",
    background: backgrounds.merchant,
    speaker: null,
    dialogue:
      "Behind the heavy curtain, an ore merchant waits for his next customer.",
  },

  // Image 07: pages 12–13.
  {
    id: "ore-appraisal",
    background: backgrounds.oreAppraisal,
    speaker: null,
    dialogue:
      "An ore merchant examines the ore and finds that it is worth a fortune.",
  },
  {
    id: "merchant-offer",
    background: backgrounds.oreAppraisal,
    speaker: "merchant",
    dialogue:
      "Merchant: My God... I've never seen ore this beautiful! I'd give everything I own for it.",
  },

  // Image 08: page 14.
  {
    id: "ore-trade",
    background: backgrounds.oreTrade,
    speaker: null,
    dialogue: "", // TODO: Trade narration.
  },

  // Image 09: pages 15–17.
  {
    id: "mining-day-and-night",
    background: backgrounds.deepMining,
    speaker: null,
    dialogue:
      "The townspeople mine day and night, hoping to sell more ore for more money.",
  },
  {
    id: "mining-deeper",
    background: backgrounds.deepMining,
    camera: { x: 207, y: 180, width: 2066, height: 2923 },
    speaker: null,
    dialogue: "They follow the ore deeper into the mountain.",
  },
  {
    id: "mining-water-seeps",
    background: backgrounds.deepMining,
    camera: { x: 207, y: 180, width: 2066, height: 2923 },
    speaker: null,
    dialogue: "Water starts to seep through the rock, but they keep digging.",
  },

  // Image 10: page 18.
  {
    id: "ore-carts",
    background: backgrounds.oreCarts,
    speaker: null,
    dialogue: "More digging, more money. Rest, sadly, doesn't pay.",
  },

  // Image 11: pages 19–27.
  {
    id: "flood-rock-breaks",
    background: backgrounds.flood,
    camera: { x: 650, y: 0, width: 1500, height: 1100 },
    speaker: null,
    dialogue:
      "A pickaxe breaks through the last layer of rock, opening a path to an underground river higher inside the mountain.",
  },
  {
    id: "flood-tunnel-bursts",
    background: backgrounds.flood,
    camera: { x: 650, y: 0, width: 1500, height: 1100 },
    speaker: null,
    dialogue:
      "The crack widens. Water bursts into the tunnel. The miners drop their tools and run.",
  },
  {
    id: "flood-miner-notices",
    background: backgrounds.flood,
    camera: { x: -400, y: 0, width: 1500, height: 1100 },
    speaker: "miner-1",
    dialogue: "Miner 1: Wait. Why is so much water leaking through?",
  },
  {
    id: "flood-miner-keeps-digging",
    background: backgrounds.flood,
    camera: { x: -400, y: 0, width: 1500, height: 1100 },
    speaker: "miner-2",
    dialogue: "Miner 2: Just a little more. There's got to be more ore behind—",
  },
  {
    id: "flood-miner-run",
    background: backgrounds.flood,
    camera: { x: -400, y: 0, width: 1500, height: 1100 },
    speaker: "miner-1",
    dialogue: "Miner 1: Run!",
  },
  {
    id: "flood-reaches-town",
    background: backgrounds.flood,
    speaker: null,
    dialogue:
      "Water rushes through the tunnels, out of the hillside mine entrance, and down toward the town.",
  },
  {
    id: "flood-basin-fills",
    background: backgrounds.flood,
    speaker: null,
    dialogue:
      "The basin's narrow outlet cannot drain the water fast enough. The water rises until the whole town is flooded.",
  },
  {
    id: "flood-people-flee",
    background: backgrounds.flood,
    speaker: null,
    dialogue: "People flee. Some do not escape the flood.",
  },
  {
    id: "flood-child",
    background: backgrounds.flood,
    camera: { x: -400, y: 350, width: 1500, height: 1100 },
    speaker: "child",
    dialogue: "Child: Mom? Where are you?",
  },

  // Image 12: pages 28–35. Image 13 is a framing reference only.
  {
    id: "ruined-town-arrival",
    background: backgrounds.ruinedTown,
    camera: { x: -300, y: 200, width: 1400, height: 840 },
    speaker: null,
    dialogue: "By the present day, the floodwater is long gone.",
  },
  {
    id: "ruined-town-wall-stains",
    background: backgrounds.ruinedTown,
    camera: { x: -300, y: 200, width: 1400, height: 840 },
    speaker: null,
    dialogue: "High water marks stain the town walls.",
  },
  {
    id: "ruined-town-streets",
    background: backgrounds.ruinedTown,
    camera: { x: -300, y: 200, width: 1400, height: 840 },
    speaker: null,
    dialogue: "Mud and broken buildings fill the streets.",
  },
  {
    id: "ruined-town-water-marks",
    background: backgrounds.ruinedTown,
    camera: { x: -200, y: -120, width: 1400, height: 840 },
    speaker: "ivan",
    dialogue: "Ivan: The water got that high...? Did the people here get out?",
  },
  {
    id: "ruined-town-exploration",
    background: backgrounds.ruinedTown,
    camera: { x: -120, y: 420, width: 1400, height: 840 },
    speaker: null,
    dialogue:
      "Ona and Ivan look around in shock. They move forward, exploring the town. Ona grips the coin tightly.",
  },
  {
    id: "ruined-town-ona-leads",
    background: backgrounds.ruinedTown,
    camera: { x: 410, y: 150, width: 1400, height: 840 },
    speaker: "ona",
    dialogue:
      "Ona: We don't know yet. Feeling ready to take a look inside? I'll go first.",
  },
  {
    id: "ruined-town-ivan-follows",
    background: backgrounds.ruinedTown,
    camera: { x: 410, y: 150, width: 1400, height: 840 },
    speaker: "ivan",
    dialogue: "Ivan: Okay. I'm right behind you!",
  },
  {
    id: "ruined-town-influence",
    background: backgrounds.ruinedTown,
    camera: { x: 300, y: 430, width: 1400, height: 840 },
    speaker: null,
    dialogue: "", // TODO: The coin's influence on Ona.
  },

  // Image 14: page 36.
  {
    id: "coin-pedestal-detail",
    background: backgrounds.pedestalDetail,
    camera: { x: 20, y: 170, width: 700, height: 700 },
    speaker: null,
    dialogue: "", // TODO: Pedestal narration.
  },

  // Image 15: page 37.
  {
    id: "coin-pedestal",
    background: backgrounds.pedestal,
    speaker: null,
    dialogue: "",
  },

  // Image 16: pages 38–39.
  {
    id: "possession-ona",
    background: backgrounds.possession,
    speaker: "ona",
    dialogue: "Ona: They're mine!",
  },
  {
    id: "possession-ivan",
    background: backgrounds.possession,
    speaker: "ivan",
    dialogue: "Ivan: Ona...?",
  },

  // Image 17: pages 40–41.
  {
    id: "betrayal-attack",
    background: backgrounds.betrayal,
    speaker: null,
    dialogue: "Ona picks up a broken sword from the ground and stabs Ivan.",
  },
  {
    id: "betrayal-ivan-dies",
    background: backgrounds.betrayal,
    speaker: null,
    dialogue: "Ivan falls to the ground, dead.",
  },

  // Image 18: pages 42–43.
  {
    id: "bridge-approach",
    background: backgrounds.bridgeFall,
    speaker: null,
    dialogue: "Ona walks toward the pile of gold coins.",
  },
  {
    id: "bridge-trip",
    background: backgrounds.bridgeFall,
    speaker: null,
    dialogue: "Ona trips over ore scattered on the bridge",
  },

  // Image 19: pages 44–47.
  {
    id: "fall-top",
    background: backgrounds.fallingCoin,
    camera: { x: 0, y: -120, width: 2480, height: 2400 },
    speaker: null,
    dialogue: "",
  },
  {
    id: "fall-middle",
    background: backgrounds.fallingCoin,
    camera: { x: 0, y: 520, width: 2480, height: 2400 },
    speaker: null,
    dialogue: "",
  },
  {
    id: "fall-lower",
    background: backgrounds.fallingCoin,
    camera: { x: 0, y: 1060, width: 2480, height: 2400 },
    speaker: null,
    dialogue: "",
  },
  {
    id: "fall-coin",
    background: backgrounds.fallingCoin,
    camera: { x: 200, y: 2050, width: 2080, height: 1800 },
    speaker: null,
    dialogue: "",
  },
];
