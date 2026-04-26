const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");

const ui = {
  gold: document.querySelector("#goldCounter"),
  cargo: document.querySelector("#cargoCounter"),
  dock: document.querySelector("#dockStatus"),
  discovery: document.querySelector("#discoveryCounter"),
  islandName: document.querySelector("#islandName"),
  islandDescription: document.querySelector("#islandDescription"),
  marketHint: document.querySelector("#marketHint"),
  marketList: document.querySelector("#marketList"),
  warehouseList: document.querySelector("#warehouseList"),
  cargoList: document.querySelector("#cargoList"),
  currentShipLabel: document.querySelector("#currentShipLabel"),
  shipyardHint: document.querySelector("#shipyardHint"),
  routeHint: document.querySelector("#routeHint"),
  homeHint: document.querySelector("#homeHint"),
  shipActionList: document.querySelector("#shipActionList"),
  routeActionList: document.querySelector("#routeActionList"),
  homeActionList: document.querySelector("#homeActionList"),
  compassArrow: document.querySelector("#homeCompassArrow"),
  compassText: document.querySelector("#homeCompassText"),
  toastStack: document.querySelector("#toastStack"),
  tradePostAction: document.querySelector("#tradePostAction"),
  modalVeil: document.querySelector("#modalVeil"),
  modalTitle: document.querySelector("#modalTitle"),
  modalBody: document.querySelector("#modalBody"),
  modalStats: document.querySelector("#modalStats"),
  modalActions: document.querySelector("#modalActions"),
};
const homeTabButtons = [...document.querySelectorAll("[data-home-tab]")];
const homeSections = [...document.querySelectorAll("[data-home-section]")];

const resources = [
  "Coconuts",
  "Fish",
  "Iron",
  "Wood",
  "Sugar",
  "Spices",
  "Silver",
  "Cloth",
  "Tea",
  "Glass",
];

const RESOURCE_BASE_PRICE = {
  Coconuts: 8,
  Fish: 12,
  Iron: 22,
  Wood: 14,
  Sugar: 16,
  Spices: 26,
  Silver: 44,
  Cloth: 20,
  Tea: 30,
  Glass: 36,
};
const world = {
  width: 5400,
  height: 4200,
  fogCell: 42,
};
const camera = { x: 0, y: 0 };
let activeHomeTab = "shipyard";
const mapScale = {
  amount: 1.72,
  oldHome: { x: 1200, y: 900 },
  newHome: { x: 2100, y: 1600 },
};

const shipTypes = {
  rowboat: {
    name: "Rowboat",
    cost: 0,
    capacity: 5,
    speed: 50,
    hull: "Weak",
    color: "#8b5d3d",
  },
  sloop: {
    name: "Sloop",
    cost: 500,
    capacity: 5,
    speed: 175,
    hull: "Medium",
    color: "#6f8fb8",
  },
  schooner: {
    name: "Schooner",
    cost: 2500,
    capacity: 15,
    speed: 250,
    hull: "Medium",
    color: "#4f9d7a",
  },
  galleon: {
    name: "Galleon",
    cost: 10000,
    capacity: 50,
    speed: 180,
    hull: "Strong",
    color: "#a26538",
  },
  steamship: {
    name: "Steamship",
    cost: 50000,
    capacity: 100,
    speed: 360,
    hull: "Strong",
    color: "#465161",
    requires: "navalAcademy",
  },
};

function createShip(type, id = type) {
  const template = shipTypes[type];
  return {
    id,
    type,
    name: template.name,
    x: mapScale.newHome.x,
    y: mapScale.newHome.y + 78,
    angle: -Math.PI / 2,
    baseSpeed: template.speed,
    speed: template.speed,
    baseCapacity: template.capacity,
    capacity: template.capacity,
    hull: template.hull,
    color: template.color,
    cargoTier: 0,
    sailTier: 0,
    hullTier: 0,
    cannonTier: 0,
    cargo: {},
  };
}

const islands = [
  {
    id: "home",
    name: "Home Harbor",
    x: 1200,
    y: 900,
    radius: 54,
    color: "#f6b84f",
    produces: "Coconuts",
    discovered: true,
    discoveryBonus: 0,
    description: "Your starting island buys every cargo at steady prices.",
    prices: {
      Coconuts: 8,
      Fish: 12,
      Iron: 22,
      Wood: 14,
      Sugar: 16,
      Spices: 26,
      Silver: 44,
      Cloth: 20,
    },
  },
  {
    id: "coral",
    name: "Coral Bay",
    x: 930,
    y: 760,
    radius: 40,
    color: "#ef715f",
    produces: "Fish",
    discovered: false,
    discoveryBonus: 70,
    description: "A fishing village that pays extra for wood and sugar.",
    prices: {
      Coconuts: 9,
      Fish: 6,
      Iron: 18,
      Wood: 24,
      Sugar: 25,
      Spices: 21,
      Silver: 36,
      Cloth: 19,
    },
  },
  {
    id: "ironhold",
    name: "Ironhold",
    x: 1510,
    y: 690,
    radius: 44,
    color: "#8d98a3",
    produces: "Iron",
    discovered: false,
    discoveryBonus: 90,
    description: "A rocky forge island hungry for fish and coconuts.",
    prices: {
      Coconuts: 22,
      Fish: 24,
      Iron: 9,
      Wood: 16,
      Sugar: 18,
      Spices: 30,
      Silver: 29,
      Cloth: 24,
    },
  },
  {
    id: "mango",
    name: "Mango Cove",
    x: 1505,
    y: 1120,
    radius: 42,
    color: "#f2c34c",
    produces: "Sugar",
    discovered: false,
    discoveryBonus: 80,
    description: "A sunny trade stop with cheap sugar and a taste for iron.",
    prices: {
      Coconuts: 10,
      Fish: 14,
      Iron: 34,
      Wood: 20,
      Sugar: 7,
      Spices: 28,
      Silver: 41,
      Cloth: 25,
    },
  },
  {
    id: "timber",
    name: "Timber Isle",
    x: 930,
    y: 1125,
    radius: 42,
    color: "#4b9b5e",
    produces: "Wood",
    discovered: false,
    discoveryBonus: 80,
    description: "A forest island selling wood and buying food for its crews.",
    prices: {
      Coconuts: 21,
      Fish: 22,
      Iron: 20,
      Wood: 8,
      Sugar: 17,
      Spices: 22,
      Silver: 38,
      Cloth: 19,
    },
  },
  {
    id: "sunset",
    name: "Sunset Key",
    x: 690,
    y: 890,
    radius: 38,
    color: "#f08c60",
    produces: "Cloth",
    discovered: false,
    discoveryBonus: 120,
    description: "A bright market island that weaves cloth and buys sugar.",
    prices: {
      Coconuts: 18,
      Fish: 16,
      Iron: 23,
      Wood: 15,
      Sugar: 31,
      Spices: 27,
      Silver: 40,
      Cloth: 9,
    },
  },
  {
    id: "pepper",
    name: "Pepper Point",
    x: 1705,
    y: 900,
    radius: 39,
    color: "#c84e4e",
    produces: "Spices",
    discovered: false,
    discoveryBonus: 130,
    description: "A fragrant spice island that pays well for cloth and fish.",
    prices: {
      Coconuts: 13,
      Fish: 29,
      Iron: 24,
      Wood: 18,
      Sugar: 15,
      Spices: 8,
      Silver: 42,
      Cloth: 33,
    },
  },
  {
    id: "northstar",
    name: "Northstar Dock",
    x: 1210,
    y: 430,
    radius: 42,
    color: "#9cc8d8",
    produces: "Fish",
    discovered: false,
    discoveryBonus: 160,
    description: "A cold-water dock with cheap fish and strong iron demand.",
    prices: {
      Coconuts: 16,
      Fish: 7,
      Iron: 36,
      Wood: 21,
      Sugar: 19,
      Spices: 31,
      Silver: 44,
      Cloth: 22,
    },
  },
  {
    id: "goldfin",
    name: "Goldfin Atoll",
    x: 1920,
    y: 1220,
    radius: 46,
    color: "#d7aa38",
    produces: "Silver",
    discovered: false,
    discoveryBonus: 260,
    description: "A far atoll with gold ore and expensive everyday goods.",
    prices: {
      Coconuts: 32,
      Fish: 34,
      Iron: 18,
      Wood: 30,
      Sugar: 29,
      Spices: 36,
      Silver: 14,
      Cloth: 31,
    },
  },
  {
    id: "marble",
    name: "Marble Shoal",
    x: 520,
    y: 1360,
    radius: 40,
    color: "#d8d4c8",
    produces: "Iron",
    discovered: false,
    discoveryBonus: 220,
    description: "A stony shoal that wants food and finished cloth.",
    prices: {
      Coconuts: 28,
      Fish: 31,
      Iron: 8,
      Wood: 22,
      Sugar: 20,
      Spices: 35,
      Silver: 34,
      Cloth: 30,
    },
  },
  {
    id: "orchid",
    name: "Orchid Bay",
    x: 1900,
    y: 520,
    radius: 41,
    color: "#d66f9f",
    produces: "Spices",
    discovered: false,
    discoveryBonus: 240,
    description: "A remote flower island that pays top coin for gold ore.",
    prices: {
      Coconuts: 17,
      Fish: 23,
      Iron: 27,
      Wood: 17,
      Sugar: 25,
      Spices: 9,
      Silver: 58,
      Cloth: 29,
    },
  },
  {
    id: "anchor",
    name: "Anchor Rest",
    x: 420,
    y: 560,
    radius: 43,
    color: "#6daed0",
    produces: "Fish",
    discovered: false,
    discoveryBonus: 210,
    description: "A western harbor with hungry sailors and cheap fish.",
    prices: {
      Coconuts: 25,
      Fish: 7,
      Iron: 22,
      Wood: 26,
      Sugar: 24,
      Spices: 30,
      Silver: 39,
      Cloth: 20,
    },
  },
  {
    id: "clothmere",
    name: "Clothmere",
    x: 1320,
    y: 1470,
    radius: 41,
    color: "#b8a0d8",
    produces: "Cloth",
    discovered: false,
    discoveryBonus: 230,
    description: "A textile island buying spice and gold ore for dyes.",
    prices: {
      Coconuts: 20,
      Fish: 17,
      Iron: 26,
      Wood: 21,
      Sugar: 18,
      Spices: 42,
      Silver: 51,
      Cloth: 8,
    },
  },
  {
    id: "palmwatch",
    name: "Palmwatch",
    x: 760,
    y: 320,
    radius: 39,
    color: "#7fbd59",
    produces: "Coconuts",
    discovered: false,
    discoveryBonus: 180,
    description: "A quiet coconut island with a steady need for lumber.",
    prices: {
      Coconuts: 6,
      Fish: 15,
      Iron: 24,
      Wood: 33,
      Sugar: 19,
      Spices: 26,
      Silver: 42,
      Cloth: 20,
    },
  },
  {
    id: "ember",
    name: "Ember Quay",
    x: 2130,
    y: 860,
    radius: 44,
    color: "#bc6541",
    produces: "Iron",
    discovered: false,
    discoveryBonus: 290,
    description: "A far forge port paying high prices for sugar and cloth.",
    prices: {
      Coconuts: 22,
      Fish: 28,
      Iron: 8,
      Wood: 24,
      Sugar: 39,
      Spices: 32,
      Silver: 31,
      Cloth: 37,
    },
  },
  {
    id: "reefgate",
    name: "Reefgate",
    x: 280,
    y: 1010,
    radius: 42,
    color: "#61c5b5",
    produces: "Sugar",
    discovered: false,
    discoveryBonus: 260,
    description: "A reef town that grows sugar and needs iron tools.",
    prices: {
      Coconuts: 18,
      Fish: 23,
      Iron: 41,
      Wood: 20,
      Sugar: 7,
      Spices: 29,
      Silver: 44,
      Cloth: 26,
    },
  },
  {
    id: "silverglen",
    name: "Silverglen",
    x: 1580,
    y: 1580,
    radius: 43,
    color: "#b6c5c8",
    produces: "Silver",
    discovered: false,
    discoveryBonus: 310,
    description: "A southern mining island with strong demand for food.",
    prices: {
      Coconuts: 35,
      Fish: 37,
      Iron: 16,
      Wood: 24,
      Sugar: 31,
      Spices: 34,
      Silver: 13,
      Cloth: 28,
    },
  },
  {
    id: "bluecap",
    name: "Bluecap Isle",
    x: 1060,
    y: 1650,
    radius: 38,
    color: "#5e9fd6",
    produces: "Wood",
    discovered: false,
    discoveryBonus: 260,
    description: "A small timber island that pays for coconuts and spices.",
    prices: {
      Coconuts: 34,
      Fish: 19,
      Iron: 23,
      Wood: 8,
      Sugar: 22,
      Spices: 44,
      Silver: 35,
      Cloth: 24,
    },
  },
  {
    id: "mistfall",
    name: "Mistfall",
    x: 360,
    y: 260,
    radius: 39,
    color: "#8fb7bd",
    produces: "Cloth",
    discovered: false,
    discoveryBonus: 330,
    description: "A far northwest island with woven sails and costly ore.",
    prices: {
      Coconuts: 24,
      Fish: 20,
      Iron: 29,
      Wood: 23,
      Sugar: 27,
      Spices: 34,
      Silver: 55,
      Cloth: 8,
    },
  },
  {
    id: "brightdock",
    name: "Brightdock",
    x: 2190,
    y: 310,
    radius: 42,
    color: "#e1c95c",
    produces: "Sugar",
    discovered: false,
    discoveryBonus: 350,
    description: "A distant sunny dock that pays high for fish and wood.",
    prices: {
      Coconuts: 21,
      Fish: 42,
      Iron: 25,
      Wood: 39,
      Sugar: 7,
      Spices: 32,
      Silver: 46,
      Cloth: 27,
    },
  },
  {
    id: "crabstone",
    name: "Crabstone",
    x: 220,
    y: 1580,
    radius: 40,
    color: "#caa078",
    produces: "Iron",
    discovered: false,
    discoveryBonus: 370,
    description: "A rugged southwest island that trades iron for food.",
    prices: {
      Coconuts: 38,
      Fish: 35,
      Iron: 8,
      Wood: 25,
      Sugar: 28,
      Spices: 31,
      Silver: 33,
      Cloth: 24,
    },
  },
  {
    id: "saltspire",
    name: "Saltspire",
    x: 2050,
    y: 1600,
    radius: 44,
    color: "#d6dedf",
    produces: "Fish",
    discovered: false,
    discoveryBonus: 390,
    description: "A remote southern port where miners pay for fresh goods.",
    prices: {
      Coconuts: 36,
      Fish: 7,
      Iron: 21,
      Wood: 28,
      Sugar: 35,
      Spices: 37,
      Silver: 48,
      Cloth: 30,
    },
  },
  {
    id: "redfern",
    name: "Redfern",
    x: 1450,
    y: 245,
    radius: 38,
    color: "#c7564f",
    produces: "Spices",
    discovered: false,
    discoveryBonus: 280,
    description: "A northern spice island looking for cloth and coconuts.",
    prices: {
      Coconuts: 40,
      Fish: 23,
      Iron: 25,
      Wood: 20,
      Sugar: 22,
      Spices: 8,
      Silver: 41,
      Cloth: 39,
    },
  },
  {
    id: "greenwharf",
    name: "Greenwharf",
    x: 605,
    y: 1705,
    radius: 41,
    color: "#66a85f",
    produces: "Wood",
    discovered: false,
    discoveryBonus: 320,
    description: "A lower-map lumber port that buys iron and sugar.",
    prices: {
      Coconuts: 25,
      Fish: 18,
      Iron: 43,
      Wood: 8,
      Sugar: 36,
      Spices: 30,
      Silver: 40,
      Cloth: 22,
    },
  },
  {
    id: "crownreef",
    name: "Crown Reef",
    x: 1785,
    y: 245,
    radius: 43,
    color: "#d4b35f",
    produces: "Silver",
    discovered: false,
    discoveryBonus: 360,
    description: "A northern reef mine with a taste for spices and cloth.",
    prices: {
      Coconuts: 30,
      Fish: 25,
      Iron: 17,
      Wood: 27,
      Sugar: 28,
      Spices: 46,
      Silver: 13,
      Cloth: 43,
    },
  },
];

islands.forEach((island) => {
  island.x = Math.round(
    mapScale.newHome.x + (island.x - mapScale.oldHome.x) * mapScale.amount,
  );
  island.y = Math.round(
    mapScale.newHome.y + (island.y - mapScale.oldHome.y) * mapScale.amount,
  );
  island.discoveryBonus = Math.round(island.discoveryBonus * 1.2);
});

function backfillIslandPrices() {
  islands.forEach((island) => {
    if (island.kind === "pirate") return;
    resources.forEach((resource) => {
      if (typeof island.prices[resource] === "number") return;
      const base = RESOURCE_BASE_PRICE[resource] || 20;
      const variation = 0.7 + Math.random() * 0.8;
      island.prices[resource] = Math.max(4, Math.round(base * variation));
    });
  });
}
backfillIslandPrices();

islands.push(
  {
    id: "skullrock",
    kind: "pirate",
    name: "Skullrock",
    x: 280,
    y: 300,
    radius: 46,
    color: "#3b2235",
    produces: "Trouble",
    discovered: false,
    discoveryBonus: 0,
    description: "A pirate stronghold. Dock to negotiate, fight, or destroy them.",
    prices: {},
  },
  {
    id: "blackcove",
    kind: "pirate",
    name: "Black Cove",
    x: 4900,
    y: 3700,
    radius: 48,
    color: "#2b1c2c",
    produces: "Trouble",
    discovered: false,
    discoveryBonus: 0,
    description: "A pirate haven. Dock to negotiate, fight, or destroy them.",
    prices: {},
  },
  {
    id: "teahills",
    name: "Tea Hills",
    x: 4900,
    y: 2400,
    radius: 44,
    color: "#7f9b66",
    produces: "Tea",
    discovered: false,
    discoveryBonus: 320,
    description: "Misty terraces of tea bushes. Pays well for Glass and Silver.",
    prices: {
      Tea: 14,
      Glass: 58,
      Silver: 56,
    },
  },
  {
    id: "glassgate",
    name: "Glassgate",
    x: 1900,
    y: 200,
    radius: 44,
    color: "#9bbac8",
    produces: "Glass",
    discovered: false,
    discoveryBonus: 320,
    description: "Furnace island that turns sand into bottles and panes. Wants spice and tea.",
    prices: {
      Glass: 16,
      Spices: 46,
      Tea: 52,
    },
  },
  {
    id: "spireside",
    name: "Spireside",
    x: 4600,
    y: 200,
    radius: 42,
    color: "#cf8a55",
    produces: "Spices",
    discovered: false,
    discoveryBonus: 280,
    description: "Sun-baked cliffs growing rare spices. Pays top coin for Cloth and Tea.",
    prices: {
      Spices: 11,
      Cloth: 44,
      Tea: 48,
    },
  },
  {
    id: "gullrock",
    name: "Gull Rock",
    x: 5100,
    y: 1100,
    radius: 40,
    color: "#7c8da3",
    produces: "Fish",
    discovered: false,
    discoveryBonus: 260,
    description: "Far-north cold-water rock with cheap fish and big appetite for sugar.",
    prices: {
      Fish: 6,
      Sugar: 38,
      Coconuts: 28,
    },
  },
  {
    id: "dawnsend",
    name: "Dawn's End",
    x: 350,
    y: 3800,
    radius: 44,
    color: "#5b8a6c",
    produces: "Wood",
    discovered: false,
    discoveryBonus: 280,
    description: "An ancient pine island at the edge of charted seas. Wants Iron and Glass.",
    prices: {
      Wood: 7,
      Iron: 42,
      Glass: 50,
    },
  },
);

const PIRATES = {
  detectionRadius: 380,
  loseInterestRadius: 560,
  patrolRadius: 440,
  pirateSpeed: 130,
  encounterRange: 60,
  spawnIntervalMs: 22000,
  maxPerIsland: 1,
  combatBaseWin: 0.32,
  combatCannonAdvantage: 0.16,
  combatBaseFlee: 0.42,
  combatSpeedAdvantage: 0.0008,
  payOffMin: 60,
  payOffCargoFraction: 0.55,
  bountyOnKill: 90,
  tributeBaseCost: 220,
  tributeVoyages: 10,
  hireCost: 600,
  hireDurationMs: 5 * 60 * 1000,
  destroyCost: 5000,
  destroyBounty: 1800,
  raidIntervalMs: 110000,
  raidGoldPctMin: 0.1,
  raidGoldPctMax: 0.25,
  cannonTowerProtection: 0.3,
  bankVaultProtection: 0.4,
  laneFightWinBonus: 0.05,
};

const storms = [
  { id: "north-gale", x: 900, y: 700, radius: 280 },
  { id: "east-squall", x: 3100, y: 1100, radius: 260 },
  { id: "south-tempest", x: 3200, y: 2400, radius: 320 },
  { id: "southwest-fury", x: 700, y: 2700, radius: 240 },
];

const game = {
  gold: 9150,
  messageUntil: 0,
  dockedIsland: null,
  keys: new Set(),
  warehouse: {
    Coconuts: 6,
    Fish: 0,
    Iron: 0,
    Wood: 0,
    Sugar: 0,
    Spices: 0,
    Silver: 0,
    Cloth: 0,
    Tea: 0,
    Glass: 0,
  },
  home: {
    shipyardTier: 0,
    warehouseTier: 0,
    marketTier: 0,
    lighthouseTier: 0,
    tradingHall: false,
    cannonTowerTier: 0,
    bankVaultTier: 0,
    navalAcademyTier: 0,
  },
  crew: {
    deckhand: false,
    navigator: false,
  },
  tradePosts: new Set(["home"]),
  activeShipId: "rowboat",
  ships: [createShip("rowboat")],
  fog: {
    revealed: new Set(),
    revealRadius: 210,
  },
  firstStormSeen: false,
  sunkShips: [],
  lanes: [],
  laneCreator: null,
  pirates: [],
  destroyedPirateIslands: new Set(),
  tributePeace: {},
  hireUntil: 0,
  pirateSpawn: {},
  combat: null,
  lastRaidTime: 0,
  firstPirateSeen: false,
};

Object.defineProperty(game, "ship", {
  get() {
    return (
      game.ships.find((ship) => ship.id === game.activeShipId) || game.ships[0]
    );
  },
});

const shipActions = [
  {
    id: "cargo",
    label: "Cargo Hold",
    detail: "Carry 3 more goods per trip, so each voyage can earn more gold.",
    cost: 120,
    maxTier: 3,
    apply: () => {
      game.ship.cargoTier += 1;
      game.ship.capacity += 3;
    },
    tier: () => game.ship.cargoTier,
  },
  {
    id: "sails",
    label: "Better Sails",
    detail:
      "Adds a big speed boost to the active ship for faster exploration and trade runs.",
    cost: 140,
    maxTier: 3,
    apply: () => {
      game.ship.sailTier += 1;
      game.ship.speed += 40;
    },
    tier: () => game.ship.sailTier,
  },
  {
    id: "hull",
    label: "Hull Plating",
    detail: "Toughens this ship for future storm and pirate dangers.",
    cost: 180,
    maxTier: 2,
    apply: () => {
      game.ship.hullTier += 1;
    },
    tier: () => game.ship.hullTier,
  },
  {
    id: "cannons",
    label: "Cannons",
    detail: "Each tier raises your odds of winning pirate fights.",
    cost: 220,
    maxTier: 3,
    apply: () => {
      game.ship.cannonTier = (game.ship.cannonTier || 0) + 1;
    },
    tier: () => game.ship.cannonTier || 0,
  },
];

const homeActions = [
  {
    id: "shipyard",
    label: "Shipyard",
    detail:
      "Unlocks buying ships. Each tier adds 2 fleet slots for future trade routes.",
    cost: 250,
    maxTier: 4,
    apply: () => {
      game.home.shipyardTier += 1;
    },
    tier: () => game.home.shipyardTier,
  },
  {
    id: "warehouse",
    label: "Warehouse",
    detail:
      "Stores more goods at home so you can stockpile cargo for bigger future routes.",
    cost: 200,
    maxTier: 3,
    apply: () => {
      game.home.warehouseTier += 1;
    },
    tier: () => game.home.warehouseTier,
  },
  {
    id: "market",
    label: "Market",
    detail: "Makes Home Harbor pay more when you sell goods there.",
    cost: 350,
    maxTier: 1,
    apply: () => {
      game.home.marketTier += 1;
      const home = islands.find((island) => island.id === "home");
      Object.keys(home.prices).forEach((resource) => {
        home.prices[resource] = Math.round(home.prices[resource] * 1.1);
      });
    },
    tier: () => game.home.marketTier,
  },
  {
    id: "lighthouse",
    label: "Lighthouse",
    detail: "Reveals a wider circle of fog around your ships while exploring.",
    cost: 500,
    maxTier: 1,
    apply: () => {
      game.home.lighthouseTier += 1;
      game.fog.revealRadius += 80;
      revealAt(game.ship.x, game.ship.y);
    },
    tier: () => game.home.lighthouseTier,
  },
  {
    id: "hall",
    label: "Trading Hall",
    detail: "Prepares Home Harbor for automated shipping lanes.",
    cost: 750,
    maxTier: 1,
    apply: () => {
      game.home.tradingHall = true;
    },
    tier: () => (game.home.tradingHall ? 1 : 0),
  },
  {
    id: "cannonTowers",
    label: "Cannon Towers",
    detail: "Each tier raises Home Harbor's defense roll against pirate raids.",
    cost: 600,
    maxTier: 3,
    apply: () => {
      game.home.cannonTowerTier += 1;
    },
    tier: () => game.home.cannonTowerTier,
  },
  {
    id: "bankVault",
    label: "Bank Vault",
    detail: "Reduces gold lost when raiders break through.",
    cost: 700,
    maxTier: 2,
    apply: () => {
      game.home.bankVaultTier += 1;
    },
    tier: () => game.home.bankVaultTier,
  },
  {
    id: "navalAcademy",
    label: "Naval Academy",
    detail: "Trains officers to crew Steamships and other endgame vessels.",
    cost: 4000,
    maxTier: 1,
    apply: () => {
      game.home.navalAcademyTier += 1;
    },
    tier: () => game.home.navalAcademyTier,
  },
];

function cargoCount() {
  return Object.values(game.ship.cargo).reduce(
    (sum, amount) => sum + amount,
    0,
  );
}

const TOAST_KIND_LABELS = {
  info: "Update",
  discovery: "Discovery",
  success: "Done",
  warning: "Heads up",
  danger: "Trouble",
};
const TOAST_MAX_VISIBLE = 4;
const TOAST_LIFETIME_MS = 4200;

function pushToast(text, kind = "info") {
  const stack = ui.toastStack;
  if (!stack) return;

  while (stack.children.length >= TOAST_MAX_VISIBLE) {
    stack.firstElementChild.remove();
  }

  const toast = document.createElement("div");
  toast.className = `toast ${kind}`;
  toast.setAttribute("role", kind === "danger" || kind === "warning" ? "alert" : "status");
  toast.innerHTML = `
    <div class="toast-accent" aria-hidden="true"></div>
    <div class="toast-body">
      <span class="toast-kind">${TOAST_KIND_LABELS[kind] || "Update"}</span>
      <span class="toast-text"></span>
    </div>
  `;
  toast.querySelector(".toast-text").textContent = text;
  stack.append(toast);

  const dismiss = () => {
    if (!toast.isConnected) return;
    toast.classList.add("fading");
    toast.addEventListener("animationend", () => toast.remove(), { once: true });
  };
  setTimeout(dismiss, TOAST_LIFETIME_MS);
  toast.addEventListener("click", dismiss);
}

function setMessage(text, kind = "info") {
  pushToast(text, kind);
}

function formatInventory(source) {
  return resources
    .map((resource) => [resource, source[resource] || 0])
    .filter(([, amount]) => amount > 0);
}

function discoveredCount() {
  return islands.filter((island) => island.discovered).length;
}

function homeIsland() {
  return islands[0];
}

function updateCompass() {
  const home = homeIsland();
  const dx = home.x - game.ship.x;
  const dy = home.y - game.ship.y;
  const distance = Math.hypot(dx, dy);
  const degrees = (Math.atan2(dx, -dy) * 180) / Math.PI;
  const seaMiles = Math.max(1, Math.round(distance / 100));
  const distanceLabel =
    distance < 90
      ? "Home Harbor nearby"
      : `${seaMiles} sea ${seaMiles === 1 ? "mile" : "miles"} to Home Harbor`;

  ui.compassArrow.style.transform = `rotate(${degrees}deg)`;
  ui.compassText.textContent = distanceLabel;
}

function updateDockClasses() {
  document.body.classList.toggle(
    "home-docked",
    game.dockedIsland?.id === "home",
  );
  document.body.classList.toggle(
    "island-docked",
    Boolean(game.dockedIsland && game.dockedIsland.id !== "home"),
  );
  document.body.classList.toggle("sailing", !game.dockedIsland);
}

function setHomeTab(tabName) {
  activeHomeTab = tabName;
  homeTabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.homeTab === tabName);
  });
  homeSections.forEach((section) => {
    section.classList.toggle("active", section.dataset.homeSection === tabName);
  });
}

function resizeCanvas() {
  const width = Math.max(320, Math.floor(canvas.clientWidth));
  const height = Math.max(320, Math.floor(canvas.clientHeight));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
}

function revealAt(x, y, radius = game.fog.revealRadius) {
  const cell = world.fogCell;
  const minX = Math.max(0, Math.floor((x - radius) / cell));
  const maxX = Math.min(
    Math.ceil(world.width / cell),
    Math.ceil((x + radius) / cell),
  );
  const minY = Math.max(0, Math.floor((y - radius) / cell));
  const maxY = Math.min(
    Math.ceil(world.height / cell),
    Math.ceil((y + radius) / cell),
  );

  for (let row = minY; row <= maxY; row += 1) {
    for (let column = minX; column <= maxX; column += 1) {
      const centerX = column * cell + cell / 2;
      const centerY = row * cell + cell / 2;
      if (Math.hypot(centerX - x, centerY - y) <= radius) {
        game.fog.revealed.add(`${column},${row}`);
      }
    }
  }
}

function isRevealedAt(x, y) {
  const column = Math.floor(x / world.fogCell);
  const row = Math.floor(y / world.fogCell);
  return game.fog.revealed.has(`${column},${row}`);
}

function discoverNearbyIslands() {
  islands.forEach((island) => {
    if (island.discovered) return;
    const distance = Math.hypot(game.ship.x - island.x, game.ship.y - island.y);
    if (distance <= game.fog.revealRadius + island.radius * 0.5) {
      island.discovered = true;
      game.gold += island.discoveryBonus;
      setMessage(
        `Discovered ${island.name}! +${island.discoveryBonus}g discovery bonus.`,
        "discovery",
      );
      renderUi();
    }
  });
}

function stormAt(x, y) {
  return storms.find(
    (storm) => Math.hypot(storm.x - x, storm.y - y) <= storm.radius,
  );
}

function stormDamageChance(hullTier) {
  if (hullTier >= 2) return 0.06;
  if (hullTier >= 1) return 0.12;
  return 0.22;
}

function totalCargoCount(ship) {
  return Object.values(ship.cargo).reduce((sum, n) => sum + n, 0);
}

function loseRandomCargo(ship, fraction) {
  const total = totalCargoCount(ship);
  if (total === 0) return 0;
  let toLose = Math.max(1, Math.round(total * fraction));
  let lost = 0;
  while (toLose > 0) {
    const held = Object.entries(ship.cargo).filter(([, n]) => n > 0);
    if (held.length === 0) break;
    const [resource] = held[Math.floor(Math.random() * held.length)];
    ship.cargo[resource] -= 1;
    if (ship.cargo[resource] === 0) delete ship.cargo[resource];
    toLose -= 1;
    lost += 1;
  }
  return lost;
}

function placeShipAtHome(ship) {
  ship.x = homeIsland().x;
  ship.y = homeIsland().y + 78;
  ship.angle = -Math.PI / 2;
}

function ensureActiveUnassignedShip() {
  const free = game.ships.find((s) => !shipIsAssigned(s.id));
  if (free) {
    game.activeShipId = free.id;
    placeShipAtHome(free);
    return free;
  }
  const rowboat = createShip("rowboat", `rowboat-${Date.now()}`);
  placeShipAtHome(rowboat);
  game.ships.push(rowboat);
  game.activeShipId = rowboat.id;
  return rowboat;
}

function sinkActiveShip() {
  const ship = game.ship;
  const lostCargo = totalCargoCount(ship);
  ship.cargo = {};

  if (ship.type === "rowboat") {
    placeShipAtHome(ship);
    setMessage(
      lostCargo > 0
        ? `Your rowboat capsized! Lost ${lostCargo} cargo. Refloated at Home Harbor.`
        : `Your rowboat capsized! Refloated at Home Harbor.`,
      "danger",
    );
    return;
  }

  const template = shipTypes[ship.type];
  game.sunkShips.push({
    type: ship.type,
    name: ship.name,
    recoveryCost: Math.round(template.cost / 2),
  });
  game.ships = game.ships.filter((s) => s.id !== ship.id);
  ensureActiveUnassignedShip();
  setMessage(
    `${ship.name} went down! Lost ${lostCargo} cargo. You're back at Home Harbor — recover it at the Shipyard or close a lane to free up another ship.`,
    "danger",
  );
}

function applyStormStrike() {
  const ship = game.ship;
  if (Math.random() < 0.3) {
    sinkActiveShip();
    return;
  }
  const lost = loseRandomCargo(ship, 0.35 + Math.random() * 0.2);
  if (lost > 0) {
    setMessage(`Storm rocks the ${ship.name}! Lost ${lost} cargo overboard.`, "danger");
  } else {
    setMessage(`Storm rocks the ${ship.name}! No cargo to lose.`, "warning");
  }
}

function checkStormState(ship) {
  const inStorm = stormAt(ship.x, ship.y);
  const wasIn = ship.currentStormId || null;
  const nowIn = inStorm ? inStorm.id : null;

  if (nowIn && nowIn !== wasIn) {
    if (!game.firstStormSeen) {
      game.firstStormSeen = true;
      setMessage("Storm waters! Sailing through is faster but risky.", "warning");
    }
    if (Math.random() < stormDamageChance(ship.hullTier || 0)) {
      applyStormStrike();
      renderUi();
    }
  }
  ship.currentStormId = nowIn;
}

function recoverShip(index) {
  if (game.dockedIsland?.id !== "home") return;
  const sunk = game.sunkShips[index];
  if (!sunk) return;
  if (!hasOpenFleetSlot()) {
    setMessage("No fleet slot free. Upgrade the Shipyard first.", "warning");
    return;
  }
  spendGold(sunk.recoveryCost, `${sunk.name} recovered and refitted.`, () => {
    const ship = createShip(sunk.type, `${sunk.type}-${Date.now()}`);
    ship.x = homeIsland().x;
    ship.y = homeIsland().y + 78 + game.ships.length * 22;
    game.ships.push(ship);
    game.sunkShips.splice(index, 1);
    game.activeShipId = ship.id;
  });
}

function pirateIslandsActive() {
  return islands.filter(
    (island) => island.kind === "pirate" && !game.destroyedPirateIslands.has(island.id),
  );
}

function pirateIslandsDiscovered() {
  return pirateIslandsActive().filter((island) => island.discovered);
}

function isProtectedFromPirates(homeIslandId) {
  if (game.hireUntil > performance.now()) return true;
  const peace = game.tributePeace[homeIslandId] || 0;
  return peace > 0;
}

function decayTributeOnVoyage(homeIslandId) {
  if (game.tributePeace[homeIslandId] > 0) {
    game.tributePeace[homeIslandId] -= 1;
  }
}

function spawnPirate(homeIsland) {
  const angle = Math.random() * Math.PI * 2;
  const r = PIRATES.patrolRadius * (0.4 + Math.random() * 0.6);
  game.pirates.push({
    id: `pirate-${homeIsland.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    homeIslandId: homeIsland.id,
    x: homeIsland.x + Math.cos(angle) * r,
    y: homeIsland.y + Math.sin(angle) * r,
    angle: 0,
    target: null,
    cooldownUntil: 0,
  });
}

function tickPirateSpawns(nowMs) {
  pirateIslandsDiscovered().forEach((island) => {
    const last = game.pirateSpawn[island.id] || 0;
    const here = game.pirates.filter((p) => p.homeIslandId === island.id);
    if (here.length >= PIRATES.maxPerIsland) {
      game.pirateSpawn[island.id] = nowMs;
      return;
    }
    if (nowMs - last >= PIRATES.spawnIntervalMs) {
      spawnPirate(island);
      game.pirateSpawn[island.id] = nowMs;
    }
  });
}

function findPirateTarget(pirate) {
  let best = null;
  let bestDist = PIRATES.detectionRadius;
  game.ships.forEach((ship) => {
    if (isProtectedFromPirates(pirate.homeIslandId)) return;
    if (ship._sinking) return;
    const dist = Math.hypot(ship.x - pirate.x, ship.y - pirate.y);
    if (dist < bestDist) {
      best = ship;
      bestDist = dist;
    }
  });
  return best;
}

function tickPirates(delta, nowMs) {
  if (game.combat) return;
  tickPirateSpawns(nowMs);

  game.pirates = game.pirates.filter(
    (p) => !game.destroyedPirateIslands.has(p.homeIslandId),
  );

  game.pirates.forEach((pirate) => {
    const home = islandById(pirate.homeIslandId);
    if (!home) return;
    const distFromHome = Math.hypot(pirate.x - home.x, pirate.y - home.y);
    const retreating = nowMs < pirate.cooldownUntil;

    let target = null;
    if (!retreating) {
      target = findPirateTarget(pirate);
    }
    pirate.target = target ? target.id : null;

    let goalX;
    let goalY;
    if (retreating) {
      goalX = home.x;
      goalY = home.y;
    } else if (target && distFromHome < PIRATES.loseInterestRadius) {
      goalX = target.x;
      goalY = target.y;
    } else {
      const angle =
        Math.atan2(pirate.y - home.y, pirate.x - home.x) + delta * 0.6;
      const r = PIRATES.patrolRadius;
      goalX = home.x + Math.cos(angle) * r;
      goalY = home.y + Math.sin(angle) * r;
    }
    const dx = goalX - pirate.x;
    const dy = goalY - pirate.y;
    const len = Math.hypot(dx, dy);
    if (len > 0.5) {
      const speed = retreating ? PIRATES.pirateSpeed * 1.25 : PIRATES.pirateSpeed;
      pirate.x += (dx / len) * speed * delta;
      pirate.y += (dy / len) * speed * delta;
      pirate.angle = Math.atan2(dy, dx);
    }

    if (target && !retreating) {
      const closeDist = Math.hypot(target.x - pirate.x, target.y - pirate.y);
      if (closeDist < PIRATES.encounterRange) {
        triggerPirateEncounter(pirate, target);
      }
    }
  });
}

function triggerPirateEncounter(pirate, ship) {
  if (game.combat) return;
  const lane = game.lanes.find((l) => l.shipId === ship.id);
  if (lane) {
    resolveLaneCombat(pirate, ship, lane);
    return;
  }
  if (ship.id !== game.activeShipId) return;
  openCombatPopup(pirate, ship);
}

function drawPirates() {
  game.pirates.forEach((pirate) => {
    if (!isRevealedAt(pirate.x, pirate.y)) return;
    ctx.save();
    ctx.translate(pirate.x, pirate.y);
    ctx.rotate(pirate.angle + Math.PI / 2);

    ctx.fillStyle = "#2a1620";
    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.quadraticCurveTo(18, -2, 10, 20);
    ctx.lineTo(-10, 20);
    ctx.quadraticCurveTo(-18, -2, 0, -18);
    ctx.fill();

    ctx.fillStyle = "#0e0610";
    ctx.fillRect(-1, -16, 2, 28);

    ctx.fillStyle = "#cd3a3a";
    ctx.beginPath();
    ctx.moveTo(1, -14);
    ctx.lineTo(11, -6);
    ctx.lineTo(1, -2);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#fff9e8";
    ctx.beginPath();
    ctx.arc(5, -8, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  });
}

function tickHomeRaids(nowMs) {
  if (game.combat) return;
  if (pirateIslandsDiscovered().length === 0) return;
  if (game.lastRaidTime === 0) {
    game.lastRaidTime = nowMs;
    return;
  }
  if (nowMs - game.lastRaidTime < PIRATES.raidIntervalMs) return;
  game.lastRaidTime = nowMs;

  if (game.hireUntil > nowMs) {
    pushToast("Hired pirates fended off a raid on Home Harbor.", "info");
    return;
  }

  const defense = Math.min(0.85, game.home.cannonTowerTier * PIRATES.cannonTowerProtection);
  if (Math.random() < defense) {
    pushToast("Cannon Towers drove off a pirate raid!", "success");
    return;
  }

  const rawPct =
    PIRATES.raidGoldPctMin +
    Math.random() * (PIRATES.raidGoldPctMax - PIRATES.raidGoldPctMin);
  const vaultReduction = Math.min(0.85, game.home.bankVaultTier * PIRATES.bankVaultProtection);
  const finalPct = rawPct * (1 - vaultReduction);
  const lost = Math.max(1, Math.round(game.gold * finalPct));
  game.gold = Math.max(0, game.gold - lost);
  pushToast(`Pirate raid! Lost ${lost}g from Home Harbor.`, "danger");
  renderUi();
}

function fightWinChance(ship) {
  return Math.max(
    0.1,
    Math.min(0.9, PIRATES.combatBaseWin + (ship.cannonTier || 0) * PIRATES.combatCannonAdvantage),
  );
}

function fleeChance(ship) {
  return Math.max(
    0.1,
    Math.min(
      0.9,
      PIRATES.combatBaseFlee +
        (ship.speed - PIRATES.pirateSpeed) * PIRATES.combatSpeedAdvantage,
    ),
  );
}

function payOffCost(ship) {
  const cargoValue = Object.entries(ship.cargo).reduce((sum, [resource, n]) => {
    const home = islands[0];
    return sum + (home.prices[resource] || 0) * n;
  }, 0);
  return Math.max(
    PIRATES.payOffMin,
    Math.round(cargoValue * PIRATES.payOffCargoFraction),
  );
}

function showModal({ title, body, stats, actions }) {
  ui.modalTitle.textContent = title;
  ui.modalBody.textContent = body;
  ui.modalStats.innerHTML = "";
  (stats || []).forEach(([label, value]) => {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `<span>${label}</span><span>${value}</span>`;
    ui.modalStats.append(row);
  });
  ui.modalActions.innerHTML = "";
  (actions || []).forEach((action) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = action.label;
    if (action.kind) button.classList.add(action.kind);
    button.disabled = !!action.disabled;
    button.addEventListener("click", action.onClick);
    ui.modalActions.append(button);
  });
  ui.modalVeil.hidden = false;
}

function hideModal() {
  ui.modalVeil.hidden = true;
}

function removePirate(pirate) {
  game.pirates = game.pirates.filter((p) => p.id !== pirate.id);
}

function shipMaxHp(ship) {
  return 30 + (ship.hullTier || 0) * 15;
}

function pirateMaxHp() {
  return 35;
}

function rollPlayerDamage(ship) {
  return 1 + Math.floor(Math.random() * 6) + (ship.cannonTier || 0) * 3;
}

function rollPirateDamage() {
  return 1 + Math.floor(Math.random() * 6) + 2;
}

function openCombatPopup(pirate, ship) {
  game.combat = {
    kind: "fight",
    pirateId: pirate.id,
    shipId: ship.id,
    playerHp: shipMaxHp(ship),
    playerMaxHp: shipMaxHp(ship),
    pirateHp: pirateMaxHp(),
    pirateMaxHp: pirateMaxHp(),
    log: [
      `${ship.name} squares up against pirates from ${islandById(pirate.homeIslandId)?.name || "the open sea"}.`,
    ],
    animating: false,
    round: 0,
  };
  if (!game.firstPirateSeen) {
    game.firstPirateSeen = true;
    pushToast(
      "Pirates! Cannons help you fight, fast ships help you flee.",
      "warning",
    );
  }
  renderCombatPopup();
}

function combatHpClass(hp, max) {
  const ratio = max > 0 ? hp / max : 0;
  if (ratio <= 0.25) return "critical";
  if (ratio <= 0.5) return "low";
  return "";
}

function shipBattleSvg(color) {
  return `<svg viewBox="0 0 60 56" aria-hidden="true">
    <ellipse cx="30" cy="46" rx="22" ry="5" fill="rgba(0,0,0,0.18)"/>
    <path d="M30 8 Q50 22 42 44 L18 44 Q10 22 30 8 Z" fill="${color}"/>
    <rect x="29" y="6" width="2" height="32" fill="#17313b"/>
    <path d="M31 10 L46 24 L31 28 Z" fill="#fff9e8"/>
  </svg>`;
}

function pirateBattleSvg() {
  return `<svg viewBox="0 0 60 56" aria-hidden="true">
    <ellipse cx="30" cy="46" rx="22" ry="5" fill="rgba(0,0,0,0.18)"/>
    <path d="M30 8 Q50 22 42 44 L18 44 Q10 22 30 8 Z" fill="#2a1620"/>
    <rect x="29" y="6" width="2" height="32" fill="#0e0610"/>
    <path d="M31 10 L46 24 L31 28 Z" fill="#cd3a3a"/>
    <circle cx="38" cy="20" r="2.4" fill="#fff9e8"/>
  </svg>`;
}

function renderCombatPopup() {
  const c = game.combat;
  const pirate = game.pirates.find((p) => p.id === c.pirateId);
  const ship = shipById(c.shipId);
  if (!pirate || !ship) {
    endCombat();
    return;
  }
  const home = islandById(pirate.homeIslandId);
  const fleePct = Math.round(fleeChance(ship) * 100);
  const payCost = payOffCost(ship);

  ui.modalTitle.textContent = "Pirate Battle!";
  ui.modalBody.textContent = `Raiders from ${home?.name || "open sea"} bear down on the ${ship.name}.`;
  ui.modalActions.parentElement.classList.add("combat");
  ui.modalStats.innerHTML = "";

  const arena = document.createElement("div");
  arena.className = "combat-arena";

  const playerHpPct = Math.max(0, c.playerHp / c.playerMaxHp);
  const pirateHpPct = Math.max(0, c.pirateHp / c.pirateMaxHp);

  arena.innerHTML = `
    <div class="combat-side player">
      <div class="combat-name">${ship.name} (${ship.cannonTier || 0} cannons)</div>
      <div class="combat-ship">${shipBattleSvg(ship.color)}</div>
      <div class="combat-hp-bar"><div class="combat-hp-fill ${combatHpClass(c.playerHp, c.playerMaxHp)}" style="transform: scaleX(${playerHpPct})"></div></div>
      <div class="combat-hp-text">${Math.max(0, c.playerHp)} / ${c.playerMaxHp}</div>
      <div class="combat-roll ${c._playerRollText ? "" : "empty"}" id="playerRollDisplay">${c._playerRollText || "Ready"}</div>
    </div>
    <div class="combat-vs">VS</div>
    <div class="combat-side pirate">
      <div class="combat-name">Pirate Raider</div>
      <div class="combat-ship">${pirateBattleSvg()}</div>
      <div class="combat-hp-bar"><div class="combat-hp-fill ${combatHpClass(c.pirateHp, c.pirateMaxHp)}" style="transform: scaleX(${pirateHpPct})"></div></div>
      <div class="combat-hp-text">${Math.max(0, c.pirateHp)} / ${c.pirateMaxHp}</div>
      <div class="combat-roll ${c._pirateRollText ? "" : "empty"}" id="pirateRollDisplay">${c._pirateRollText || "Ready"}</div>
    </div>
  `;

  const log = document.createElement("div");
  log.className = "combat-log";
  c.log.slice(-4).forEach((line) => {
    const div = document.createElement("div");
    div.className = "line";
    div.textContent = line;
    log.append(div);
  });

  ui.modalStats.append(arena, log);

  ui.modalActions.innerHTML = "";
  const ended = c.playerHp <= 0 || c.pirateHp <= 0;
  if (ended) {
    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.textContent = "Continue";
    closeBtn.classList.add("success");
    closeBtn.addEventListener("click", () => finishCombat(pirate, ship));
    ui.modalActions.append(closeBtn);
  } else {
    const fireBtn = document.createElement("button");
    fireBtn.type = "button";
    fireBtn.textContent = "Fire!";
    fireBtn.classList.add("danger");
    fireBtn.disabled = !!c.animating;
    fireBtn.addEventListener("click", () => fireRound(ship));
    ui.modalActions.append(fireBtn);

    const fleeBtn = document.createElement("button");
    fleeBtn.type = "button";
    fleeBtn.textContent = `Try to flee (${fleePct}%)`;
    fleeBtn.disabled = !!c.animating;
    fleeBtn.addEventListener("click", () => attemptFlee(pirate, ship));
    ui.modalActions.append(fleeBtn);

    const payBtn = document.createElement("button");
    payBtn.type = "button";
    payBtn.textContent = `Pay them off (${payCost}g)`;
    payBtn.classList.add("success");
    payBtn.disabled = !!c.animating || game.gold < payCost;
    payBtn.addEventListener("click", () => attemptPayOff(pirate, ship, payCost));
    ui.modalActions.append(payBtn);

    const surrenderBtn = document.createElement("button");
    surrenderBtn.type = "button";
    surrenderBtn.textContent = "Surrender (lose cargo)";
    surrenderBtn.disabled = !!c.animating;
    surrenderBtn.addEventListener("click", () => surrenderCombat(pirate, ship));
    ui.modalActions.append(surrenderBtn);
  }

  ui.modalVeil.hidden = false;
}

function animateRoll(targetSelector, finalText, durationMs = 480) {
  return new Promise((resolve) => {
    const el = document.querySelector(targetSelector);
    if (!el) {
      resolve();
      return;
    }
    el.classList.remove("empty");
    const start = performance.now();
    const interval = setInterval(() => {
      const fakeRoll = 1 + Math.floor(Math.random() * 18);
      el.innerHTML = `<span class="combat-die rolling">${fakeRoll}</span><span class="combat-damage">?</span>`;
      if (performance.now() - start >= durationMs) {
        clearInterval(interval);
        el.innerHTML = finalText;
        resolve();
      }
    }, 60);
  });
}

function fireRound(ship) {
  const c = game.combat;
  if (!c || c.animating) return;
  c.animating = true;
  c.round += 1;
  renderCombatPopup();

  const playerDamage = rollPlayerDamage(ship);
  const playerRollText = `<span class="combat-die rolling">?</span><span class="combat-damage player">${playerDamage} dmg</span>`;
  c._playerRollText = playerRollText;

  animateRoll("#playerRollDisplay", playerRollText)
    .then(() => {
      c.pirateHp = Math.max(0, c.pirateHp - playerDamage);
      c.log.push(`Cannons fire — ${playerDamage} damage to pirate hull.`);
      renderCombatPopup();

      if (c.pirateHp <= 0) {
        c.log.push(`The pirate vessel breaks apart!`);
        c.animating = false;
        renderCombatPopup();
        return;
      }

      const pirateDamage = rollPirateDamage();
      const pirateRollText = `<span class="combat-die rolling">?</span><span class="combat-damage pirate">${pirateDamage} dmg</span>`;
      c._pirateRollText = pirateRollText;
      return animateRoll("#pirateRollDisplay", pirateRollText).then(() => {
        c.playerHp = Math.max(0, c.playerHp - pirateDamage);
        c.log.push(`Pirate volley — ${pirateDamage} damage to your hull.`);
        c.animating = false;
        renderCombatPopup();
      });
    });
}

const RETREAT_MS = {
  fleeWin: 30000,
  fleeFail: 12000,
  payOff: 35000,
  surrender: 30000,
};

function nudgePirateAway(pirate, ship, distance) {
  const dx = pirate.x - ship.x;
  const dy = pirate.y - ship.y;
  const len = Math.hypot(dx, dy) || 1;
  pirate.x += (dx / len) * distance;
  pirate.y += (dy / len) * distance;
}

function attemptFlee(pirate, ship) {
  const c = game.combat;
  if (!c || c.animating) return;
  if (Math.random() < fleeChance(ship)) {
    pirate.cooldownUntil = performance.now() + RETREAT_MS.fleeWin;
    nudgePirateAway(pirate, ship, 220);
    pushToast(`The ${ship.name} slips away! Pirate retreats to base.`, "success");
    endCombat();
  } else {
    const dmg = rollPirateDamage();
    c.playerHp = Math.max(0, c.playerHp - dmg);
    c.log.push(`Flee failed! Pirate parting shot: ${dmg} damage.`);
    if (c.playerHp <= 0) {
      c.log.push(`The ${ship.name} couldn't escape!`);
    }
    pirate.cooldownUntil = performance.now() + RETREAT_MS.fleeFail;
    renderCombatPopup();
  }
}

function attemptPayOff(pirate, ship, cost) {
  if (game.gold < cost) return;
  game.gold -= cost;
  pirate.cooldownUntil = performance.now() + RETREAT_MS.payOff;
  nudgePirateAway(pirate, ship, 220);
  pushToast(
    `Paid the pirates ${cost}g — they sail back to base.`,
    "info",
  );
  endCombat();
}

function surrenderCombat(pirate, ship) {
  const lost = loseRandomCargo(ship, 1);
  pirate.cooldownUntil = performance.now() + RETREAT_MS.surrender;
  nudgePirateAway(pirate, ship, 220);
  pushToast(
    lost > 0
      ? `Surrendered the ${lost}-crate hold. Pirates take it and leave.`
      : `Surrendered an empty hold. Pirates sneer and leave.`,
    "warning",
  );
  endCombat();
}

function finishCombat(pirate, ship) {
  const c = game.combat;
  if (!c) return;
  if (c.pirateHp <= 0) {
    removePirate(pirate);
    game.gold += PIRATES.bountyOnKill;
    pushToast(`Pirate sunk! +${PIRATES.bountyOnKill}g bounty.`, "success");
    endCombat();
  } else if (c.playerHp <= 0) {
    pushToast(`The ${ship.name} goes down!`, "danger");
    endCombat();
    sinkActiveShip();
  } else {
    endCombat();
  }
}

function endCombat() {
  game.combat = null;
  hideModal();
  ui.modalActions.parentElement.classList.remove("combat");
  renderUi();
}

function resolveLaneCombat(pirate, ship, lane) {
  const win = Math.random() < fightWinChance(ship) + PIRATES.laneFightWinBonus;
  if (win) {
    removePirate(pirate);
    game.gold += Math.round(PIRATES.bountyOnKill * 0.6);
    pushToast(
      `${ship.name} fought off pirates on the ${islandById(lane.fromIslandId)?.name} ↔ ${islandById(lane.toIslandId)?.name} lane!`,
      "success",
    );
  } else if (Math.random() < 0.55) {
    const lost = loseRandomCargo(ship, 0.45 + Math.random() * 0.25);
    pirate.cooldownUntil = performance.now() + 8000;
    pushToast(
      `Pirates raided ${ship.name} on its lane. Lost ${lost} cargo.`,
      "danger",
    );
  } else {
    pushToast(`${ship.name} sunk by pirates! Lane closed.`, "danger");
    const isActive = game.activeShipId === ship.id;
    if (isActive) {
      sinkActiveShip();
    } else {
      const lostCargo = totalCargoCount(ship);
      const template = shipTypes[ship.type];
      ship.cargo = {};
      if (ship.type !== "rowboat") {
        game.sunkShips.push({
          type: ship.type,
          name: ship.name,
          recoveryCost: Math.round(template.cost / 2),
        });
        game.ships = game.ships.filter((s) => s.id !== ship.id);
      } else {
        ship.x = homeIsland().x;
        ship.y = homeIsland().y + 78;
      }
      pushToast(`Lost ${lostCargo} cargo with ${ship.name}.`, "danger");
    }
  }
}

function islandById(id) {
  return islands.find((island) => island.id === id);
}

function shipById(id) {
  return game.ships.find((ship) => ship.id === id);
}

function shipIsAssigned(shipId) {
  return game.lanes.some((lane) => lane.shipId === shipId);
}

function laneBuyResource(lane, direction) {
  return direction === "to" ? lane.toResource : lane.fromResource;
}

function nextLaneWaypoint(fromX, fromY, toX, toY, avoidStorms) {
  if (!avoidStorms) return { x: toX, y: toY };
  const dx = toX - fromX;
  const dy = toY - fromY;
  const len = Math.hypot(dx, dy);
  if (len < 1) return { x: toX, y: toY };

  for (const storm of storms) {
    const t = ((storm.x - fromX) * dx + (storm.y - fromY) * dy) / (len * len);
    if (t < 0 || t > 1) continue;
    const closestX = fromX + dx * t;
    const closestY = fromY + dy * t;
    const distToLine = Math.hypot(storm.x - closestX, storm.y - closestY);
    const buffer = storm.radius + 50;
    if (distToLine < buffer) {
      const nx = -dy / len;
      const ny = dx / len;
      const side = (storm.x - closestX) * nx + (storm.y - closestY) * ny;
      const sign = side >= 0 ? -1 : 1;
      return {
        x: closestX + sign * nx * buffer,
        y: closestY + sign * ny * buffer,
      };
    }
  }
  return { x: toX, y: toY };
}

function processLanePort(lane, ship, island) {
  const buy = laneBuyResource(lane, lane.goingTo);

  let soldCount = 0;
  let soldGold = 0;
  Object.keys(ship.cargo).forEach((resource) => {
    const amount = ship.cargo[resource];
    const price = island.prices[resource] || 0;
    soldCount += amount;
    soldGold += amount * price;
    if (island.id === "home") {
      game.warehouse[resource] = (game.warehouse[resource] || 0) + amount;
    }
  });
  ship.cargo = {};
  game.gold += soldGold;

  const buyPrice = island.prices[buy];
  let bought = 0;
  if (buyPrice > 0) {
    while (bought < ship.capacity && game.gold >= buyPrice) {
      game.gold -= buyPrice;
      ship.cargo[buy] = (ship.cargo[buy] || 0) + 1;
      bought += 1;
    }
  }

  const parts = [];
  if (soldCount > 0) parts.push(`sold ${soldCount} for ${soldGold}g`);
  if (bought > 0) parts.push(`loaded ${bought} ${buy}`);
  if (parts.length > 0) {
    pushToast(`${ship.name} at ${island.name}: ${parts.join(", ")}.`, "success");
  } else if (soldCount === 0 && bought === 0) {
    pushToast(`${ship.name} at ${island.name}: no trade this stop.`, "info");
  }
}

function tickLanes(delta) {
  game.lanes.forEach((lane) => {
    const ship = shipById(lane.shipId);
    if (!ship) return;

    const targetIsland = islandById(
      lane.goingTo === "to" ? lane.toIslandId : lane.fromIslandId,
    );
    if (!targetIsland) return;

    const dist = Math.hypot(targetIsland.x - ship.x, targetIsland.y - ship.y);
    if (dist < targetIsland.radius + 28) {
      processLanePort(lane, ship, targetIsland);
      lane.goingTo = lane.goingTo === "to" ? "from" : "to";
      renderUi();
      return;
    }

    const wp = nextLaneWaypoint(
      ship.x,
      ship.y,
      targetIsland.x,
      targetIsland.y,
      lane.avoidStorms,
    );
    const dx = wp.x - ship.x;
    const dy = wp.y - ship.y;
    const len = Math.hypot(dx, dy);
    if (len > 0.1) {
      ship.x += (dx / len) * ship.speed * delta;
      ship.y += (dy / len) * ship.speed * delta;
      ship.angle = Math.atan2(dy, dx);
    }
    ship.x = Math.max(34, Math.min(world.width - 34, ship.x));
    ship.y = Math.max(34, Math.min(world.height - 34, ship.y));

    revealAt(ship.x, ship.y);
    if (!lane.avoidStorms) {
      checkStormState(ship);
    } else {
      ship.currentStormId = null;
    }
  });

  // Drop lanes whose ship was sunk.
  const before = game.lanes.length;
  game.lanes = game.lanes.filter((lane) => {
    if (shipById(lane.shipId)) return true;
    pushToast(`A shipping lane was lost — its ship is gone.`, "danger");
    return false;
  });
  if (game.lanes.length !== before) renderUi();
}

function nearestDock() {
  return islands.find((island) => {
    if (!island.discovered) return false;
    if (island.kind === "pirate") return false;
    const distance = Math.hypot(game.ship.x - island.x, game.ship.y - island.y);
    return distance < island.radius + 34;
  });
}

function nearestPirateIsland() {
  return pirateIslandsActive().find((island) => {
    if (!island.discovered) return false;
    const distance = Math.hypot(game.ship.x - island.x, game.ship.y - island.y);
    return distance < island.radius + 34;
  });
}

function openPirateNegotiation(island) {
  if (game.combat) return;
  game.combat = { kind: "negotiation", islandId: island.id };
  renderPirateNegotiation();
}

function renderPirateNegotiation() {
  const island = islandById(game.combat?.islandId);
  if (!island) {
    endCombat();
    return;
  }
  const distance = Math.hypot(island.x - homeIsland().x, island.y - homeIsland().y);
  const tributeCost = Math.round(PIRATES.tributeBaseCost + distance * 0.18);
  const tributeLeft = game.tributePeace[island.id] || 0;
  const hireActive = game.hireUntil > performance.now();
  const hireMinutesLeft = hireActive
    ? Math.max(1, Math.round((game.hireUntil - performance.now()) / 60000))
    : 0;

  showModal({
    title: `${island.name}`,
    body:
      "Pirates eye your colors. Choose your move — fight, pay, or settle a deal.",
    stats: [
      ["Tribute peace remaining", tributeLeft > 0 ? `${tributeLeft} voyages` : "None"],
      [
        "Hired protection",
        hireActive ? `${hireMinutesLeft} min remaining` : "None",
      ],
      ["Destroy bounty", `+${PIRATES.destroyBounty}g, permanent`],
    ],
    actions: [
      {
        label: `Pay Tribute (${tributeCost}g)`,
        kind: "success",
        disabled: game.gold < tributeCost,
        onClick: () => payTribute(island, tributeCost),
      },
      {
        label: hireActive
          ? `Already hired (${hireMinutesLeft} min)`
          : `Hire (${PIRATES.hireCost}g)`,
        disabled: hireActive || game.gold < PIRATES.hireCost,
        onClick: () => hirePirates(),
      },
      {
        label: `Destroy (${PIRATES.destroyCost}g)`,
        kind: "danger",
        disabled: game.gold < PIRATES.destroyCost,
        onClick: () => destroyPirateIsland(island),
      },
      { label: "Sail away", onClick: endCombat },
    ],
  });
}

function payTribute(island, cost) {
  if (game.gold < cost) return;
  game.gold -= cost;
  game.tributePeace[island.id] =
    (game.tributePeace[island.id] || 0) + PIRATES.tributeVoyages;
  pushToast(
    `Tribute paid to ${island.name}. Peace for ${PIRATES.tributeVoyages} voyages.`,
    "success",
  );
  endCombat();
}

function hirePirates() {
  if (game.gold < PIRATES.hireCost) return;
  game.gold -= PIRATES.hireCost;
  game.hireUntil = performance.now() + PIRATES.hireDurationMs;
  pushToast(
    `Hired pirate protection. Safe for ${Math.round(PIRATES.hireDurationMs / 60000)} minutes.`,
    "success",
  );
  endCombat();
}

function destroyPirateIsland(island) {
  if (game.gold < PIRATES.destroyCost) return;
  game.gold -= PIRATES.destroyCost;
  game.gold += PIRATES.destroyBounty;
  game.destroyedPirateIslands.add(island.id);
  game.pirates = game.pirates.filter((p) => p.homeIslandId !== island.id);
  pushToast(
    `${island.name} destroyed! +${PIRATES.destroyBounty}g bounty. Permanent peace.`,
    "success",
  );
  endCombat();
}

function buy(resource) {
  const island = game.dockedIsland;
  if (!island) return;

  const price = island.prices[resource];
  if (game.gold < price) {
    setMessage(`Need ${price}g to buy ${resource}.`, "warning");
    return;
  }

  if (cargoCount() >= game.ship.capacity) {
    setMessage(`The ${game.ship.name.toLowerCase()} cargo hold is full.`, "warning");
    return;
  }

  game.gold -= price;
  game.ship.cargo[resource] = (game.ship.cargo[resource] || 0) + 1;
  setMessage(`Bought 1 ${resource} at ${island.name} for ${price}g.`, "info");
  renderUi();
}

function sell(resource) {
  const island = game.dockedIsland;
  if (!island || !game.ship.cargo[resource]) return;

  const price = island.prices[resource];
  game.ship.cargo[resource] -= 1;
  if (game.ship.cargo[resource] === 0) delete game.ship.cargo[resource];
  game.gold += price;

  if (island.id === "home") {
    game.warehouse[resource] = (game.warehouse[resource] || 0) + 1;
  }

  setMessage(`Sold 1 ${resource} at ${island.name} for ${price}g.`, "success");
  renderUi();
}

function loadFromWarehouse(resource) {
  if (
    game.dockedIsland?.id !== "home" ||
    cargoCount() >= game.ship.capacity ||
    !game.warehouse[resource]
  ) {
    return;
  }

  game.warehouse[resource] -= 1;
  game.ship.cargo[resource] = (game.ship.cargo[resource] || 0) + 1;
  setMessage(`Loaded 1 ${resource} from the home warehouse.`, "info");
  renderUi();
}

function spendGold(cost, successMessage, apply) {
  if (game.gold < cost) {
    setMessage(`Need ${cost}g for that upgrade.`, "warning");
    return false;
  }

  game.gold -= cost;
  apply();
  setMessage(successMessage, "success");
  renderUi();
  return true;
}

function fleetSlotLimit() {
  return 1 + game.home.shipyardTier * 2;
}

function hasOpenFleetSlot() {
  return game.ships.length < fleetSlotLimit();
}

function buyShip(type) {
  if (
    game.dockedIsland?.id !== "home" ||
    game.home.shipyardTier === 0 ||
    !hasOpenFleetSlot()
  )
    return;

  const template = shipTypes[type];
  spendGold(template.cost, `${template.name} added to your fleet.`, () => {
    const ship = createShip(type, `${type}-${game.ships.length + 1}`);
    ship.x = homeIsland().x;
    ship.y = homeIsland().y + 78 + game.ships.length * 22;
    game.ships.push(ship);
    game.activeShipId = ship.id;
  });
}

function switchShip(shipId) {
  if (game.activeShipId === shipId) return;
  game.activeShipId = shipId;
  game.dockedIsland = nearestDock();
  revealAt(game.ship.x, game.ship.y);
  updateCompass();
  renderUi();
}

function buyShipUpgrade(action) {
  if (game.dockedIsland?.id !== "home") return;
  if (action.tier() >= action.maxTier) return;

  const nextCost = action.cost * (action.tier() + 1);
  spendGold(nextCost, `${action.label} upgraded.`, action.apply);
}

function buyHomeUpgrade(action) {
  if (game.dockedIsland?.id !== "home") return;
  if (action.tier() >= action.maxTier) return;

  const nextCost = action.cost * (action.tier() + 1);
  spendGold(nextCost, `${action.label} built at Home Harbor.`, action.apply);
}

function hireCrew(role) {
  if (game.dockedIsland?.id !== "home") return;

  const crewConfig = {
    deckhand: {
      cost: 90,
      label: "Deckhand",
      apply: () => {
        game.crew.deckhand = true;
        game.ship.capacity += 1;
      },
    },
    navigator: {
      cost: 160,
      label: "Navigator",
      apply: () => {
        game.crew.navigator = true;
        game.ship.speed += 30;
      },
    },
  }[role];

  if (!crewConfig || game.crew[role]) return;
  spendGold(
    crewConfig.cost,
    `${crewConfig.label} joined the crew.`,
    crewConfig.apply,
  );
}

function shipTypeSummary(template) {
  switch (template.name) {
    case "Sloop":
      return `${template.capacity} cargo, much faster than the rowboat.`;
    case "Schooner":
      return `${template.capacity} cargo and very fast sailing.`;
    case "Galleon":
      return `${template.capacity} cargo, strong hull, slower but built for big runs.`;
    case "Steamship":
      return `${template.capacity} cargo, very fast, very strong — late-game flagship.`;
    default:
      return `${template.capacity} cargo.`;
  }
}

function buildTradePost() {
  const island = game.dockedIsland;
  if (!island || island.id === "home" || game.tradePosts.has(island.id)) return;

  const distance = Math.hypot(island.x - islands[0].x, island.y - islands[0].y);
  const cost = Math.round(180 + distance * 0.35);
  spendGold(cost, `Built a trade post at ${island.name}.`, () => {
    game.tradePosts.add(island.id);
  });
}

function unassignedShips() {
  return game.ships.filter((ship) => !shipIsAssigned(ship.id));
}

function tradePostIslands() {
  return islands.filter((island) => game.tradePosts.has(island.id) && island.discovered);
}

function laneCanCreate() {
  return (
    game.home.tradingHall &&
    tradePostIslands().length >= 2 &&
    unassignedShips().length >= 2
  );
}

function defaultLaneCreator() {
  const posts = tradePostIslands();
  const from = posts[0];
  const to = posts.find((island) => island.id !== from.id) || posts[1] || from;
  const ships = unassignedShips();
  const ship = ships.find((s) => s.id !== game.activeShipId) || ships[0];
  return {
    fromIslandId: from?.id || "home",
    toIslandId: to?.id || "home",
    fromResource: from?.produces || resources[0],
    toResource: to?.produces || resources[0],
    shipId: ship?.id || "",
    avoidStorms: true,
  };
}

function openLaneCreator() {
  if (!laneCanCreate()) {
    pushToast(
      "Need Trading Hall, two trade posts, and a spare ship to start a lane.",
      "warning",
    );
    return;
  }
  game.laneCreator = defaultLaneCreator();
  renderUi();
}

function cancelLaneCreator() {
  game.laneCreator = null;
  renderUi();
}

function updateLaneCreator(field, value) {
  if (!game.laneCreator) return;
  game.laneCreator[field] = value;
  if (field === "fromIslandId") {
    const island = islandById(value);
    if (island) game.laneCreator.fromResource = island.produces;
  }
  if (field === "toIslandId") {
    const island = islandById(value);
    if (island) game.laneCreator.toResource = island.produces;
  }
  renderUi();
}

function submitLaneCreator() {
  const draft = game.laneCreator;
  if (!draft) return;
  if (draft.fromIslandId === draft.toIslandId) {
    pushToast("Pick two different islands for a lane.", "warning");
    return;
  }
  if (!draft.shipId || !shipById(draft.shipId)) {
    pushToast("Pick a ship to run this lane.", "warning");
    return;
  }
  if (shipIsAssigned(draft.shipId)) {
    pushToast("That ship is already on a lane.", "warning");
    return;
  }
  const remainingFree = unassignedShips().filter((s) => s.id !== draft.shipId);
  if (remainingFree.length === 0) {
    pushToast("Keep at least one ship free for manual sailing.", "warning");
    return;
  }

  const lane = {
    id: `lane-${Date.now()}`,
    fromIslandId: draft.fromIslandId,
    toIslandId: draft.toIslandId,
    fromResource: draft.fromResource,
    toResource: draft.toResource,
    shipId: draft.shipId,
    avoidStorms: !!draft.avoidStorms,
    goingTo: "to",
  };
  game.lanes.push(lane);

  if (game.activeShipId === draft.shipId) {
    game.activeShipId = remainingFree[0].id;
  }

  game.laneCreator = null;
  const ship = shipById(draft.shipId);
  pushToast(
    `New lane started: ${ship?.name || "Ship"} runs ${islandById(draft.fromIslandId)?.name} ↔ ${islandById(draft.toIslandId)?.name}.`,
    "success",
  );
  renderUi();
}

function deleteLane(laneId) {
  const before = game.lanes.length;
  game.lanes = game.lanes.filter((lane) => lane.id !== laneId);
  if (game.lanes.length !== before) {
    pushToast("Shipping lane closed.", "info");
    renderUi();
  }
}

function createActionRow({
  label,
  detail,
  buttonText,
  disabled,
  locked,
  onClick,
}) {
  const row = document.createElement("div");
  row.className = `action-row${locked ? " locked" : ""}`;
  row.title = detail;
  row.dataset.tooltip = detail;
  row.tabIndex = 0;

  const copy = document.createElement("div");
  copy.innerHTML = `<span class="resource-name">${label}</span><span class="action-detail">${detail}</span>`;

  const button = document.createElement("button");
  button.className = "action-button";
  button.type = "button";
  button.textContent = buttonText;
  button.disabled = disabled;
  button.addEventListener("click", onClick);

  row.append(copy, button);
  return row;
}

function renderActionPanels() {
  const island = game.dockedIsland;
  const atHome = island?.id === "home";
  const atAnyIsland = Boolean(island);
  const activeShip = game.ship;
  const openFleetSlot = hasOpenFleetSlot();

  ui.shipyardHint.textContent = atHome
    ? `${game.ships.length}/${fleetSlotLimit()} slots`
    : "Home only";
  ui.homeHint.textContent = atHome ? "Ready" : "Home only";
  ui.routeHint.textContent = atAnyIsland ? "Docked" : "Dock first";

  ui.shipActionList.innerHTML = "";
  Object.entries(shipTypes)
    .filter(([type]) => type !== "rowboat")
    .forEach(([type, template]) => {
      const noShipyard = game.home.shipyardTier === 0;
      const requiresAcademy = template.requires === "navalAcademy";
      const academyMissing = requiresAcademy && game.home.navalAcademyTier === 0;
      const locked = noShipyard || academyMissing;
      const canAfford = game.gold >= template.cost;
      const lockReason = noShipyard
        ? "Build the Shipyard in the Base tab first."
        : academyMissing
          ? "Build the Naval Academy in the Base tab first."
          : null;
      ui.shipActionList.append(
        createActionRow({
          label: lockReason
            ? `${template.name} - locked`
            : `${template.name} - ${template.cost}g`,
          detail: lockReason
            ? lockReason
            : !openFleetSlot
              ? "Upgrade the Shipyard in the Base tab to add more fleet slots."
              : canAfford
                ? `Buy a ${template.name}: ${shipTypeSummary(template)}`
                : `Need ${template.cost}g to buy a ${template.name}.`,
          buttonText: locked || !openFleetSlot ? "Base" : "Buy",
          disabled: !atHome || (!locked && openFleetSlot && !canAfford),
          locked: !atHome || locked || !openFleetSlot,
          onClick: () =>
            locked || !openFleetSlot ? setHomeTab("base") : buyShip(type),
        }),
      );
    });

  game.sunkShips.forEach((sunk, index) => {
    ui.shipActionList.append(
      createActionRow({
        label: `Recover ${sunk.name} - ${sunk.recoveryCost}g`,
        detail: `Refit your sunk ${sunk.name} for half its original cost.`,
        buttonText: "Recover",
        disabled: !atHome || !openFleetSlot || game.gold < sunk.recoveryCost,
        locked: !atHome,
        onClick: () => recoverShip(index),
      }),
    );
  });

  game.ships.forEach((ship) => {
    const onLane = shipIsAssigned(ship.id);
    ui.shipActionList.append(
      createActionRow({
        label: `${ship.name} ${ship.id === game.activeShipId ? "(active)" : onLane ? "(on lane)" : ""}`,
        detail: onLane
          ? "Running a shipping lane. Close the lane in the Routes tab to free this ship."
          : `Switch control to this ship. It currently holds ${Object.values(ship.cargo).reduce((sum, amount) => sum + amount, 0)} of ${ship.capacity} cargo.`,
        buttonText: ship.id === game.activeShipId ? "Active" : onLane ? "Locked" : "Use",
        disabled: !atHome || ship.id === game.activeShipId || onLane,
        locked: !atHome || onLane,
        onClick: () => switchShip(ship.id),
      }),
    );
  });

  shipActions.forEach((action) => {
    const tier = action.tier();
    const complete = tier >= action.maxTier;
    const cost = action.cost * (tier + 1);
    ui.shipActionList.append(
      createActionRow({
        label: complete
          ? `${action.label} ${tier}/${action.maxTier}`
          : `${action.label} ${tier}/${action.maxTier} - ${cost}g`,
        detail: complete ? "Fully upgraded" : action.detail,
        buttonText: complete ? "Max" : "Buy",
        disabled: !atHome || complete || game.gold < cost,
        locked: !atHome,
        onClick: () => buyShipUpgrade(action),
      }),
    );
  });

  ui.homeActionList.innerHTML = "";
  homeActions.forEach((action) => {
    const tier = action.tier();
    const complete = tier >= action.maxTier;
    const cost = action.cost * (tier + 1);
    ui.homeActionList.append(
      createActionRow({
        label: complete
          ? `${action.label} ${tier}/${action.maxTier}`
          : `${action.label} ${tier}/${action.maxTier} - ${cost}g`,
        detail: complete ? "Built" : action.detail,
        buttonText: complete ? "Done" : "Build",
        disabled: !atHome || complete || game.gold < cost,
        locked: !atHome,
        onClick: () => buyHomeUpgrade(action),
      }),
    );
  });

  [
    {
      id: "deckhand",
      label: "Deckhand - 90g",
      detail: "Adds 1 cargo capacity to the active ship.",
    },
    {
      id: "navigator",
      label: "Navigator - 160g",
      detail: "Adds a noticeable speed boost to the active ship.",
    },
  ].forEach((crew) => {
    const hired = game.crew[crew.id];
    const cost = crew.id === "deckhand" ? 90 : 160;
    ui.shipActionList.append(
      createActionRow({
        label: crew.label,
        detail: hired
          ? "This crew member is already helping your fleet."
          : crew.detail,
        buttonText: hired ? "Hired" : "Hire",
        disabled: !atHome || hired || game.gold < cost,
        locked: !atHome,
        onClick: () => hireCrew(crew.id),
      }),
    );
  });

  ui.tradePostAction.innerHTML = "";
  if (island && island.id !== "home") {
    const built = game.tradePosts.has(island.id);
    const postCost = Math.round(
      180 + Math.hypot(island.x - islands[0].x, island.y - islands[0].y) * 0.35,
    );
    ui.tradePostAction.append(
      createActionRow({
        label: built ? "Trade Post built" : `Build Trade Post - ${postCost}g`,
        detail: built
          ? `Trade posts let you run shipping lanes between ${island.name} and other posts.`
          : `A trade post here unlocks shipping lanes between ${island.name} and other posts.`,
        buttonText: built ? "Built" : "Build",
        disabled: built || game.gold < postCost,
        locked: built,
        onClick: buildTradePost,
      }),
    );
  }

  ui.routeActionList.innerHTML = "";
  if (game.laneCreator) {
    ui.routeActionList.append(buildLaneCreatorForm());
  } else {
    game.lanes.forEach((lane) => {
      ui.routeActionList.append(buildLaneCard(lane));
    });

    const canCreate = laneCanCreate();
    const reason = !game.home.tradingHall
      ? "Build the Trading Hall first."
      : tradePostIslands().length < 2
        ? "Need trade posts on at least two discovered islands."
        : unassignedShips().length < 2
          ? "Buy another ship — keep one free for manual sailing."
          : "Configure a new shipping lane.";
    ui.routeActionList.append(
      createActionRow({
        label: canCreate ? "New Shipping Lane" : "New Shipping Lane (locked)",
        detail: reason,
        buttonText: "Create",
        disabled: !canCreate,
        locked: !canCreate,
        onClick: openLaneCreator,
      }),
    );
  }
}

function buildLaneCreatorForm() {
  const draft = game.laneCreator;
  const wrap = document.createElement("div");
  wrap.className = "lane-form";

  const title = document.createElement("div");
  title.className = "lane-form-title";
  title.innerHTML = `<span>New Shipping Lane</span>`;
  wrap.append(title);

  const posts = tradePostIslands();
  const ships = unassignedShips();

  const islandOptions = posts.map((island) => ({
    value: island.id,
    label: island.name,
  }));
  const resourceOptions = resources.map((r) => ({ value: r, label: r }));

  wrap.append(
    laneFormRow("From", "fromIslandId", draft.fromIslandId, islandOptions),
    laneFormRow("Pick up", "fromResource", draft.fromResource, resourceOptions),
    laneFormRow("To", "toIslandId", draft.toIslandId, islandOptions),
    laneFormRow("Pick up", "toResource", draft.toResource, resourceOptions),
    laneFormRow(
      "Ship",
      "shipId",
      draft.shipId,
      ships.map((s) => ({
        value: s.id,
        label: `${s.name}${s.id === game.activeShipId ? " (active)" : ""}`,
      })),
    ),
  );

  const toggleRow = document.createElement("label");
  toggleRow.className = "lane-form-toggle";
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = !!draft.avoidStorms;
  checkbox.addEventListener("change", (e) =>
    updateLaneCreator("avoidStorms", e.target.checked),
  );
  toggleRow.append(checkbox);
  toggleRow.append(document.createTextNode(" Avoid storm waters (slower, safer)"));
  wrap.append(toggleRow);

  const buttons = document.createElement("div");
  buttons.className = "lane-form-buttons";
  const cancel = document.createElement("button");
  cancel.type = "button";
  cancel.className = "action-button";
  cancel.textContent = "Cancel";
  cancel.addEventListener("click", cancelLaneCreator);
  const create = document.createElement("button");
  create.type = "button";
  create.className = "action-button";
  create.textContent = "Start Lane";
  create.addEventListener("click", submitLaneCreator);
  buttons.append(cancel, create);
  wrap.append(buttons);

  return wrap;
}

function laneFormRow(label, field, currentValue, options) {
  const row = document.createElement("div");
  row.className = "lane-form-row";
  const lab = document.createElement("label");
  lab.textContent = label;
  const select = document.createElement("select");
  options.forEach((opt) => {
    const o = document.createElement("option");
    o.value = opt.value;
    o.textContent = opt.label;
    if (opt.value === currentValue) o.selected = true;
    select.append(o);
  });
  select.addEventListener("change", (e) => updateLaneCreator(field, e.target.value));
  row.append(lab, select);
  return row;
}

function buildLaneCard(lane) {
  const wrap = document.createElement("div");
  wrap.className = "lane-card";

  const ship = shipById(lane.shipId);
  const fromIsland = islandById(lane.fromIslandId);
  const toIsland = islandById(lane.toIslandId);

  const head = document.createElement("div");
  head.className = "lane-card-head";
  head.innerHTML = `<span class="lane-card-route">${fromIsland?.name || "?"} ↔ ${toIsland?.name || "?"}</span><span class="toast-kind">${lane.avoidStorms ? "Safe route" : "Fast route"}</span>`;
  wrap.append(head);

  const detail = document.createElement("div");
  detail.className = "lane-card-detail";
  detail.textContent = `${ship?.name || "Ship"} carries ${lane.fromResource} → ${toIsland?.name || "?"} and ${lane.toResource} → ${fromIsland?.name || "?"}. Currently sailing ${lane.goingTo === "to" ? "to " + (toIsland?.name || "?") : "back to " + (fromIsland?.name || "?")}.`;
  wrap.append(detail);

  const actions = document.createElement("div");
  actions.className = "lane-card-actions";
  const close = document.createElement("button");
  close.type = "button";
  close.className = "action-button";
  close.textContent = "Close Lane";
  close.addEventListener("click", () => deleteLane(lane.id));
  actions.append(close);
  wrap.append(actions);

  return wrap;
}

function renderUi() {
  const island = game.dockedIsland;
  updateDockClasses();
  ui.gold.textContent = `${game.gold}g`;
  ui.cargo.textContent = `${cargoCount()} / ${game.ship.capacity}`;
  ui.currentShipLabel.textContent = game.ship.name;
  ui.discovery.textContent = `${discoveredCount()} / ${islands.length}`;
  ui.dock.textContent = island ? island.name : "Sailing";
  ui.islandName.textContent = island ? island.name : "Open Sea";
  ui.islandDescription.textContent = island
    ? island.description
    : "Sail to an island and dock to trade.";
  ui.marketHint.textContent = island ? island.produces : "Explore";

  ui.marketList.innerHTML = "";
  if (island) {
    resources.forEach((resource) => {
      const row = document.createElement("div");
      row.className = "trade-row";

      const label = document.createElement("div");
      label.innerHTML = `<span class="resource-name">${resource}</span><span class="resource-detail">${island.prices[resource]}g each</span>`;

      const buyButton = document.createElement("button");
      buyButton.className = "trade-button";
      buyButton.type = "button";
      buyButton.title = `Buy ${resource}`;
      buyButton.textContent = "+";
      buyButton.disabled =
        game.gold < island.prices[resource] ||
        cargoCount() >= game.ship.capacity;
      buyButton.addEventListener("click", () => buy(resource));

      const sellButton = document.createElement("button");
      sellButton.className = "trade-button";
      sellButton.type = "button";
      sellButton.title = `Sell ${resource}`;
      sellButton.textContent = "-";
      sellButton.disabled = !game.ship.cargo[resource];
      sellButton.addEventListener("click", () => sell(resource));

      row.append(label, buyButton, sellButton);
      ui.marketList.append(row);
    });
  } else {
    resources.forEach((resource) => {
      const row = document.createElement("div");
      row.className = "trade-row locked";
      row.innerHTML = `<div><span class="resource-name">${resource}</span><span class="resource-detail">Dock to see prices</span></div><button class="trade-button" disabled>+</button><button class="trade-button" disabled>-</button>`;
      ui.marketList.append(row);
    });
  }

  ui.warehouseList.innerHTML = "";
  const warehouseItems = formatInventory(game.warehouse);
  if (warehouseItems.length === 0) {
    ui.warehouseList.innerHTML = `<div class="inventory-row"><span>No stored goods.</span></div>`;
  } else {
    warehouseItems.forEach(([resource, amount]) => {
      const row = document.createElement("div");
      row.className = "inventory-row";
      row.innerHTML = `<span class="resource-name">${resource}</span><span>${amount}</span>`;
      if (island?.id === "home") {
        row.style.cursor = "pointer";
        row.title = `Load ${resource}`;
        row.addEventListener("click", () => loadFromWarehouse(resource));
      }
      ui.warehouseList.append(row);
    });
  }

  ui.cargoList.innerHTML = "";
  const cargoItems = formatInventory(game.ship.cargo);
  if (cargoItems.length === 0) {
    ui.cargoList.innerHTML = `<div class="inventory-row"><span>Empty hold.</span></div>`;
  } else {
    cargoItems.forEach(([resource, amount]) => {
      const row = document.createElement("div");
      row.className = "inventory-row";
      row.innerHTML = `<span class="resource-name">${resource}</span><span>${amount}</span>`;
      ui.cargoList.append(row);
    });
  }

  renderActionPanels();
}

function update(delta) {
  const { ship, keys } = game;
  const activeIsAssigned = shipIsAssigned(ship.id);
  if (game.combat) return;
  let dx = 0;
  let dy = 0;

  if (!activeIsAssigned) {
    if (keys.has("ArrowUp") || keys.has("KeyW")) dy -= 1;
    if (keys.has("ArrowDown") || keys.has("KeyS")) dy += 1;
    if (keys.has("ArrowLeft") || keys.has("KeyA")) dx -= 1;
    if (keys.has("ArrowRight") || keys.has("KeyD")) dx += 1;
  }

  if (dx || dy) {
    const length = Math.hypot(dx, dy);
    ship.x += (dx / length) * ship.speed * delta;
    ship.y += (dy / length) * ship.speed * delta;
    ship.angle = Math.atan2(dy, dx);
    ship.x = Math.max(34, Math.min(world.width - 34, ship.x));
    ship.y = Math.max(34, Math.min(world.height - 34, ship.y));
  }

  tickLanes(delta);
  tickPirates(delta, performance.now());
  tickHomeRaids(performance.now());

  revealAt(ship.x, ship.y);
  discoverNearbyIslands();
  if (!activeIsAssigned) checkStormState(ship);

  const pirateIsland = nearestPirateIsland();
  if (pirateIsland && ship._lastPirateIslandId !== pirateIsland.id) {
    ship._lastPirateIslandId = pirateIsland.id;
    openPirateNegotiation(pirateIsland);
  } else if (!pirateIsland) {
    ship._lastPirateIslandId = null;
  }

  updateCompass();

  const dock = nearestDock();
  if (dock !== game.dockedIsland) {
    const wasDocked = game.dockedIsland;
    game.dockedIsland = dock || null;
    if (dock) setMessage(`Docked at ${dock.name}.`, "info");
    if (wasDocked && !dock) {
      Object.keys(game.tributePeace).forEach((id) => {
        if (game.tributePeace[id] > 0) game.tributePeace[id] -= 1;
      });
    }
    renderUi();
  }
}

function drawOcean() {
  const waveGap = 48;
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#58d0d0");
  gradient.addColorStop(1, "#147f99");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.lineWidth = 2;
  const startX = -((camera.x + 18) % 96) + 18;
  const startY = -((camera.y + 28) % waveGap) + 28;
  for (let y = startY; y < canvas.height; y += waveGap) {
    for (let x = startX; x < canvas.width; x += 96) {
      ctx.beginPath();
      ctx.arc(x, y, 14, 0.1, Math.PI - 0.1);
      ctx.stroke();
    }
  }
}

function drawHomeBuildings() {
  const home = game.home;

  // Always-present hut (the starting state) — simple wooden home.
  ctx.fillStyle = "#8b5d3d";
  ctx.fillRect(-10, -2, 20, 14);
  ctx.fillStyle = "#ef715f";
  ctx.beginPath();
  ctx.moveTo(-13, -2);
  ctx.lineTo(0, -14);
  ctx.lineTo(13, -2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#3a2519";
  ctx.fillRect(-2, 4, 4, 8);

  // Shipyard — wooden dock and crane to the southeast as it tiers up.
  if (home.shipyardTier > 0) {
    const t = home.shipyardTier;
    ctx.fillStyle = "#7a543a";
    ctx.fillRect(16, 14, 12 + t * 4, 4);
    ctx.fillRect(20 + t * 2, 10, 2, 12);
    if (t >= 2) {
      ctx.strokeStyle = "#3a2519";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(20 + t * 2, 8);
      ctx.lineTo(28 + t * 2, 4);
      ctx.stroke();
    }
    if (t >= 3) {
      ctx.fillStyle = "#5a3e2c";
      ctx.fillRect(28 + t * 2, 4, 6, 4);
    }
  }

  // Warehouse — squat block to the west.
  if (home.warehouseTier > 0) {
    const t = home.warehouseTier;
    ctx.fillStyle = "#a4884f";
    ctx.fillRect(-30 - t * 2, 0, 12 + t * 2, 12);
    ctx.fillStyle = "#6f5b34";
    ctx.fillRect(-30 - t * 2, 0, 12 + t * 2, 3);
    if (t >= 2) {
      ctx.fillStyle = "#5a4828";
      ctx.fillRect(-26 - t * 2, 4, 4, 4);
    }
  }

  // Market — colorful awnings to the south.
  if (home.marketTier > 0) {
    ctx.fillStyle = "#f6b84f";
    ctx.fillRect(-18, 18, 12, 4);
    ctx.fillStyle = "#ef715f";
    ctx.fillRect(-4, 18, 12, 4);
    ctx.fillStyle = "#3bb5c4";
    ctx.fillRect(10, 18, 10, 4);
  }

  // Lighthouse — tower to the north with a glowing top.
  if (home.lighthouseTier > 0) {
    ctx.fillStyle = "#fff9e8";
    ctx.fillRect(-3, -38, 6, 22);
    ctx.fillStyle = "#c4423a";
    ctx.fillRect(-3, -38, 6, 4);
    ctx.fillStyle = "#f6b84f";
    ctx.beginPath();
    ctx.arc(0, -36, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Trading Hall — peaked civic building near the hut.
  if (home.tradingHall) {
    ctx.fillStyle = "#cdb585";
    ctx.fillRect(-26, -16, 16, 12);
    ctx.fillStyle = "#7a543a";
    ctx.beginPath();
    ctx.moveTo(-28, -16);
    ctx.lineTo(-18, -24);
    ctx.lineTo(-8, -16);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#3a2519";
    ctx.fillRect(-20, -10, 4, 6);
  }

  // Naval Academy — peaked tower with flag east of the hut.
  if (home.navalAcademyTier > 0) {
    ctx.fillStyle = "#dcd2bd";
    ctx.fillRect(20, -22, 10, 18);
    ctx.fillStyle = "#465161";
    ctx.beginPath();
    ctx.moveTo(18, -22);
    ctx.lineTo(25, -32);
    ctx.lineTo(32, -22);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#465161";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(25, -34);
    ctx.lineTo(25, -40);
    ctx.stroke();
    ctx.fillStyle = "#3bb5c4";
    ctx.beginPath();
    ctx.moveTo(25, -40);
    ctx.lineTo(33, -38);
    ctx.lineTo(25, -36);
    ctx.closePath();
    ctx.fill();
  }

  // Cannon Towers — short stone towers with cannons, one per tier, around the perimeter.
  for (let i = 0; i < home.cannonTowerTier; i += 1) {
    const angle = -Math.PI / 4 + i * (Math.PI / 2.5);
    const cx = Math.cos(angle) * 38;
    const cy = Math.sin(angle) * 28;
    ctx.fillStyle = "#7a8290";
    ctx.fillRect(cx - 4, cy - 8, 8, 12);
    ctx.fillStyle = "#3a414c";
    ctx.fillRect(cx - 4, cy - 10, 8, 3);
    ctx.fillStyle = "#1a1d22";
    ctx.fillRect(cx - 1, cy - 14, 2, 6);
  }

  // Bank Vault — small stone box with a coin marker.
  if (home.bankVaultTier > 0) {
    ctx.fillStyle = "#8e8a82";
    ctx.fillRect(8, -8, 10, 8);
    ctx.fillStyle = "#5a5650";
    ctx.fillRect(8, -8, 10, 2);
    ctx.fillStyle = "#f6b84f";
    ctx.beginPath();
    ctx.arc(13, -3, 2, 0, Math.PI * 2);
    ctx.fill();
    if (home.bankVaultTier >= 2) {
      ctx.fillStyle = "#2f6b3d";
      ctx.fillRect(8, -10, 10, 2);
    }
  }
}

function drawIsland(island) {
  if (!island.discovered && !isRevealedAt(island.x, island.y)) return;
  if (island.kind === "pirate" && game.destroyedPirateIslands.has(island.id)) return;

  ctx.save();
  ctx.translate(island.x, island.y);

  ctx.fillStyle = "rgba(0,0,0,0.14)";
  ctx.beginPath();
  ctx.ellipse(
    6,
    9,
    island.radius * 1.08,
    island.radius * 0.76,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  ctx.fillStyle = island.color;
  ctx.beginPath();
  ctx.ellipse(0, 0, island.radius, island.radius * 0.72, 0, 0, Math.PI * 2);
  ctx.fill();

  if (island.kind !== "pirate") {
    ctx.fillStyle = "#f8f3df";
    ctx.beginPath();
    ctx.ellipse(
      0,
      4,
      island.radius * 0.75,
      island.radius * 0.48,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    ctx.fillStyle = "#4b9b5e";
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      ctx.arc(-18 + i * 18, -10 + (i % 2) * 7, 8, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    ctx.fillStyle = "#0e0610";
    for (let i = 0; i < 4; i += 1) {
      ctx.beginPath();
      ctx.arc(-20 + i * 14, -6 + (i % 2) * 8, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (island.id === "home") {
    drawHomeBuildings();
  }

  if (island.kind === "pirate") {
    ctx.fillStyle = "#1a1018";
    ctx.fillRect(-3, -34, 3, 30);
    ctx.fillStyle = "#17313b";
    ctx.fillRect(0, -34, 22, 14);
    ctx.fillStyle = "#fff9e8";
    ctx.beginPath();
    ctx.arc(11, -27, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#17313b";
    ctx.fillRect(9, -27, 1.4, 1.4);
    ctx.fillRect(12, -27, 1.4, 1.4);
    ctx.fillRect(10.4, -25, 0.8, 1);
  }

  if (game.tradePosts.has(island.id) && island.id !== "home") {
    ctx.fillStyle = "#3bb5c4";
    ctx.fillRect(island.radius * 0.4, -island.radius * 0.65, 4, 22);
    ctx.beginPath();
    ctx.moveTo(island.radius * 0.4 + 4, -island.radius * 0.65);
    ctx.lineTo(island.radius * 0.4 + 16, -island.radius * 0.55);
    ctx.lineTo(island.radius * 0.4 + 4, -island.radius * 0.45);
    ctx.closePath();
    ctx.fill();
  }

  ctx.fillStyle = "#17313b";
  ctx.font = "700 15px Avenir Next, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(island.name, 0, island.radius + 20);

  if (game.dockedIsland === island) {
    ctx.strokeStyle = "#fff9e8";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 0, island.radius + 11, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

function drawFog() {
  const cell = world.fogCell;
  const startColumn = Math.max(0, Math.floor(camera.x / cell) - 1);
  const endColumn = Math.min(
    Math.ceil(world.width / cell),
    Math.ceil((camera.x + canvas.width) / cell) + 1,
  );
  const startRow = Math.max(0, Math.floor(camera.y / cell) - 1);
  const endRow = Math.min(
    Math.ceil(world.height / cell),
    Math.ceil((camera.y + canvas.height) / cell) + 1,
  );

  ctx.save();
  ctx.fillStyle = "rgba(22, 45, 55, 0.82)";
  for (let row = startRow; row <= endRow; row += 1) {
    for (let column = startColumn; column <= endColumn; column += 1) {
      if (!game.fog.revealed.has(`${column},${row}`)) {
        ctx.fillRect(column * cell, row * cell, cell + 1, cell + 1);
      }
    }
  }

  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 1;
  for (let row = startRow; row <= endRow; row += 1) {
    for (let column = startColumn; column <= endColumn; column += 1) {
      if (!game.fog.revealed.has(`${column},${row}`)) {
        ctx.strokeRect(column * cell, row * cell, cell, cell);
      }
    }
  }
  ctx.restore();
}

function drawStorms() {
  const t = performance.now() / 1000;
  storms.forEach((storm) => {
    ctx.save();

    const grad = ctx.createRadialGradient(
      storm.x,
      storm.y,
      storm.radius * 0.15,
      storm.x,
      storm.y,
      storm.radius,
    );
    grad.addColorStop(0, "rgba(20, 36, 60, 0.78)");
    grad.addColorStop(0.7, "rgba(20, 36, 60, 0.55)");
    grad.addColorStop(1, "rgba(20, 36, 60, 0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(storm.x, storm.y, storm.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i += 1) {
      const r = storm.radius * (0.35 + i * 0.18);
      const phase = t * (0.4 + i * 0.15) + i;
      ctx.beginPath();
      for (let a = 0; a <= Math.PI * 2 + 0.1; a += 0.2) {
        const wobble = Math.sin(a * 3 + phase) * 6;
        const px = storm.x + Math.cos(a + phase * 0.2) * (r + wobble);
        const py = storm.y + Math.sin(a + phase * 0.2) * (r + wobble);
        if (a === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    const flashSeed = Math.floor(t * 1.6) + storm.x;
    const flashOn = Math.sin(flashSeed * 12.9898) * 43758.5453;
    if (flashOn - Math.floor(flashOn) > 0.78) {
      ctx.strokeStyle = "rgba(255, 247, 180, 0.95)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      const cx = storm.x + (Math.sin(flashSeed) * storm.radius) / 1.6;
      const cy = storm.y + (Math.cos(flashSeed * 1.3) * storm.radius) / 1.8;
      ctx.moveTo(cx, cy - 30);
      ctx.lineTo(cx + 6, cy - 8);
      ctx.lineTo(cx - 4, cy + 6);
      ctx.lineTo(cx + 8, cy + 28);
      ctx.stroke();
    }

    ctx.restore();
  });
}

function drawLanes() {
  if (game.lanes.length === 0) return;
  ctx.save();
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 8]);
  game.lanes.forEach((lane) => {
    const from = islandById(lane.fromIslandId);
    const to = islandById(lane.toIslandId);
    if (!from || !to) return;
    ctx.strokeStyle = lane.avoidStorms
      ? "rgba(75, 155, 94, 0.55)"
      : "rgba(239, 113, 95, 0.55)";
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  });
  ctx.restore();
}

function drawWorldBounds() {
  ctx.save();
  ctx.strokeStyle = "rgba(255, 249, 232, 0.5)";
  ctx.lineWidth = 8;
  ctx.strokeRect(0, 0, world.width, world.height);
  ctx.restore();
}

function drawShip(ship, isActive = false) {
  ctx.save();
  ctx.translate(ship.x, ship.y);
  ctx.rotate(ship.angle + Math.PI / 2);
  ctx.globalAlpha = isActive ? 1 : 0.58;

  ctx.fillStyle = ship.color;
  ctx.beginPath();
  ctx.moveTo(0, -22);
  ctx.quadraticCurveTo(22, -4, 12, 24);
  ctx.lineTo(-12, 24);
  ctx.quadraticCurveTo(-22, -4, 0, -22);
  ctx.fill();

  ctx.fillStyle = "#fff9e8";
  ctx.beginPath();
  ctx.moveTo(0, -16);
  ctx.lineTo(14, 9);
  ctx.lineTo(0, 5);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#17313b";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, -18);
  ctx.lineTo(0, 18);
  ctx.stroke();

  if (isActive) {
    ctx.strokeStyle = "#fff9e8";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 2, 29, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

function draw() {
  resizeCanvas();
  camera.x = Math.max(
    0,
    Math.min(world.width - canvas.width, game.ship.x - canvas.width / 2),
  );
  camera.y = Math.max(
    0,
    Math.min(world.height - canvas.height, game.ship.y - canvas.height / 2),
  );

  drawOcean();
  ctx.save();
  ctx.translate(-camera.x, -camera.y);
  drawWorldBounds();
  drawStorms();
  drawLanes();
  islands.forEach(drawIsland);
  game.ships.forEach((ship) => drawShip(ship, ship.id === game.activeShipId));
  drawPirates();
  drawFog();
  ctx.restore();
}

let lastTime = performance.now();
function frame(now) {
  const delta = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;
  update(delta);
  draw();
  requestAnimationFrame(frame);
}

window.addEventListener("keydown", (event) => {
  if (
    [
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "KeyW",
      "KeyA",
      "KeyS",
      "KeyD",
    ].includes(event.code)
  ) {
    event.preventDefault();
    game.keys.add(event.code);
  }
});

window.addEventListener("keyup", (event) => {
  game.keys.delete(event.code);
});

homeTabButtons.forEach((button) => {
  button.addEventListener("click", () => setHomeTab(button.dataset.homeTab));
});

window.addEventListener("resize", resizeCanvas);

resizeCanvas();
setHomeTab(activeHomeTab);
revealAt(game.ship.x, game.ship.y, game.fog.revealRadius + 60);
updateCompass();
renderUi();
requestAnimationFrame(frame);
