// Import Modules
import { YZECORIOLIS } from "./config.js";
import { registerSystemSettings } from "./settings.js";
import { yzecoriolisActor } from "./actor/actor.js";
import { yzecoriolisActorSheet } from "./actor/actor-sheet.js";
import { yzecoriolisShipSheet } from "./actor/ship-sheet.js";
import { yzecoriolisItem } from "./item/item.js";
import { yzecoriolisItemSheet } from "./item/item-sheet.js";
import { coriolisChatListeners } from "./coriolis-roll.js";
import {
  getAttributeKeyForWeaponType,
  getSkillKeyForWeaponType,
} from "./item/item.js";
import * as migrations from "./migration.js";
import { preloadHandlerbarsTemplates } from "./templates.js";
import {
  addDarknessPoints,
  spendDarknessPoints,
  displayDarknessPoints,
} from "./darkness-points.js";
import { getActorDataById } from "./util.js";
import {
  importShipSheetTutorial,
  showOnboardingMessage,
} from "./onboarding.js";
import { coriolisJournalSheet } from "./coriolisJournal.js";

Hooks.once("init", async function () {
  console.log(`Coriolis | Initializing Coriolis\n${YZECORIOLIS.ASCII}`);
  game.yzecoriolis = {
    yzecoriolisActor,
    yzecoriolisItem,
    rollItemMacro,
    config: YZECORIOLIS,
    migrations: migrations,
  };

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: "1d6",
    decimals: 0,
  };

  // Setup TinyMCE stylings
  CONFIG.TinyMCE.content_css = "systems/yzecoriolis/css/yzecoriolismce.css";
  CONFIG.JournalEntry.sheetClass = coriolisJournalSheet;
  preloadHandlerbarsTemplates();

  // Define custom Entity classes
  CONFIG.Actor.documentClass = yzecoriolisActor;
  CONFIG.Item.documentClass = yzecoriolisItem;
  CONFIG.YZECORIOLIS = YZECORIOLIS;

  //Register system settings
  registerSystemSettings();

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("yzecoriolis", yzecoriolisActorSheet, {
    types: ["character"],
    makeDefault: true,
    label: "YZECORIOLIS.SheetClassCharacter",
  });
  Actors.registerSheet("yzecoriolis", yzecoriolisActorSheet, {
    types: ["npc"],
    makeDefault: true,
    label: "YZECORIOLIS.SheetClassNPC",
  });
  Actors.registerSheet("yzecoriolis", yzecoriolisShipSheet, {
    types: ["ship"],
    makeDefault: true,
    label: "YZECORIOLIS.SheetClassShip",
  });

  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("yzecoriolis", yzecoriolisItemSheet, {
    makeDefault: true,
    label: "SheetClassItem",
  });

  // register turn order changes. Currently it's sorting from high->low so no need to edit atm.
  //Combat.prototype.setupTurns = setupCoriolisTurns;

  Handlebars.registerHelper("concat", function () {
    var outStr = "";
    for (var arg in arguments) {
      if (typeof arguments[arg] != "object") {
        outStr += arguments[arg];
      }
    }
    return outStr;
  });

  Handlebars.registerHelper("toLowerCase", function (str) {
    return str.toLowerCase();
  });

  Handlebars.registerHelper("if_eq", function (a, b, opts) {
    if (a === b) {
      return opts.fn(this);
    } else {
      return opts.inverse(this);
    }
  });

  Handlebars.registerHelper("if_gt", function (a, b, opts) {
    if (a > b) {
      return opts.fn(this);
    } else {
      return opts.inverse(this);
    }
  });

  Handlebars.registerHelper("if_notEmptyString", function (a, opts) {
    if (a !== "") {
      return opts.fn(this);
    } else {
      return opts.inverse(this);
    }
  });

  Handlebars.registerHelper("getSkillName", function (skillkey) {
    return CONFIG.YZECORIOLIS.skills[skillkey];
  });
  Handlebars.registerHelper("getSkillRollName", function (skillkey) {
    return CONFIG.YZECORIOLIS.skillRolls[skillkey];
  });

  Handlebars.registerHelper("getSkillCategoryName", function (skillkey) {
    return CONFIG.YZECORIOLIS.skillCategories[skillkey];
  });

  Handlebars.registerHelper("getAttributeName", function (attributeKey) {
    return CONFIG.YZECORIOLIS.attributes[attributeKey];
  });

  Handlebars.registerHelper("getAttributeRollName", function (attributeKey) {
    return CONFIG.YZECORIOLIS.attributeRolls[attributeKey];
  });

  Handlebars.registerHelper(
    "getTalentCategoryName",
    function (talentCategoryKey) {
      return CONFIG.YZECORIOLIS.talentCategories[talentCategoryKey];
    }
  );

  Handlebars.registerHelper("getGearWeightName", function (gearWeight) {
    return CONFIG.YZECORIOLIS.gearWeights[gearWeight];
  });

  Handlebars.registerHelper("getGearName", function (gearName) {
    return CONFIG.YZECORIOLIS.gearNames[gearName];
  });

  Handlebars.registerHelper("getTechTierName", function (tier) {
    return CONFIG.YZECORIOLIS.techTiers[tier];
  });

  Handlebars.registerHelper("getWeightName", function (weight) {
    return CONFIG.YZECORIOLIS.gearWeights[weight];
  });

  Handlebars.registerHelper("getRangeName", function (range) {
    return CONFIG.YZECORIOLIS.ranges[range];
  });

  Handlebars.registerHelper("getWeaponCritDisplay", function (critObj) {
    if (critObj.numericValue > 0 && critObj.customValue !== "") {
      return `${critObj.numericValue}/${critObj.customValue}`;
    }
    if (critObj.numericValue > 0) {
      return `${critObj.numericValue}`;
    }
    if (critObj.customValue !== "") {
      return `${critObj.customValue}`;
    }
    return "";
  });

  Handlebars.registerHelper("percentcss", function (a, b) {
    if (b <= 0) {
      return 0;
    }
    return (a / b) * 100;
  });

  Handlebars.registerHelper("talentHasCost", function (talentCategory, opts) {
    if (talentCategory === "cybernetic" || talentCategory === "bionicsculpt") {
      return opts.fn(this);
    } else {
      return opts.inverse(this);
    }
  });

  Handlebars.registerHelper("getSkillKeyForWeaponType", function (isMelee) {
    return getSkillKeyForWeaponType(isMelee);
  });

  Handlebars.registerHelper("getAttributeKeyForWeaponType", function (isMelee) {
    return getAttributeKeyForWeaponType(isMelee);
  });

  // returns just the position without the ship name.
  Handlebars.registerHelper(
    "getCrewPositionNameBasic",
    function (crewPosition) {
      let positionName =
        CONFIG.YZECORIOLIS.crewPositions[crewPosition.position];
      // for non associated crew, just return position name
      if (!crewPosition.shipId) {
        return positionName;
      }
      // search for ship and grab "ship - crewPosition"
      let ship = game.actors.get(crewPosition.shipId);
      if (!ship) {
        console.warn("failed to find ship", crewPosition);
        return positionName;
      }
      return `${positionName}`;
    }
  );

  Handlebars.registerHelper("getCrewPositionName", function (crewPosition) {
    let positionName = CONFIG.YZECORIOLIS.crewPositions[crewPosition.position];
    // for non associated crew, just return position name
    if (!crewPosition.shipId) {
      console.log("no ship", crewPosition);
      return positionName;
    }
    // search for ship and grab "ship - crewPosition"
    let ship = game.actors.get(crewPosition.shipId);
    if (!ship) {
      console.warn("failed to find ship", crewPosition);
      return positionName;
    }
    return `${ship.data.name} - ${positionName}`;
  });

  Handlebars.registerHelper(
    "getShipRollNameForPosition",
    function (crewPosition) {
      const skill = CONFIG.YZECORIOLIS.crewRolls[crewPosition.position];
      return CONFIG.YZECORIOLIS.skills[skill];
    }
  );

  Handlebars.registerHelper("getShipRollValueForPosition", function (crewId) {
    const crew = getActorDataById(crewId);
    const crewPosition = crew.data.bio.crewPosition;
    const skillKey = CONFIG.YZECORIOLIS.crewRolls[crewPosition.position];
    const skillValue = crew.data.skills[skillKey].value;
    const attribKey = crew.data.skills[skillKey].attribute;
    const attribValue = crew.data.attributes[attribKey].value;
    return attribValue + skillValue;
  });
});

// called after game data is loaded from severs. entities exist
Hooks.once("setup", function () {
  // Localize CONFIG objects once up-front
  const toLocalize = [
    "attributes",
    "attributeRolls",
    "skillCategories",
    "skills",
    "skillRolls",
    "talentCategories",
    "talentGroupConceptCategories",
    "talents",
    "techTiers",
    "gearWeights",
    "critTypes",
    "ranges",
    "icons",
    "crewPositions",
    "shipModuleCategories",
    "shipWeaponRanges",
  ];

  // exclude sorting from some config values where the order matters.
  const noSort = [
    "talentCategories",
    "shipModuleCategories",
    "techTiers",
    "gearWeights",
    "critTypes",
    "ranges",
    "icons",
    "shipWeaponRanges",
  ];

  for (let o of toLocalize) {
    const localized = Object.entries(CONFIG.YZECORIOLIS[o]).map((e) => {
      return [e[0], game.i18n.localize(e[1])];
    });
    if (!noSort.includes(o)) localized.sort((a, b) => a[1].localeCompare(b[1]));
    CONFIG.YZECORIOLIS[o] = localized.reduce((obj, e) => {
      obj[e[0]] = e[1];
      return obj;
    }, {});
  }
});

// Activate chat listeners for coriolis
// eslint-disable-next-line no-unused-vars
Hooks.on("renderChatLog", (log, html, data) => {
  coriolisChatListeners(html);
});

Hooks.on("renderChatMessage", (app, html, msg) => {
  // Do not display "Blind" chat cards to non-gm
  if (html.hasClass("blind") && !game.user.isGM) {
    // since the header has timestamp content we'll remove the content instead.
    // this avoids an NPE when foundry tries to update the timestamps.
    html.find(".message-content").remove();
  }
  // remove push option from non-authors
  if (!game.user.isGM && msg.message.user !== game.user.id) {
    html.find(".dice-push").remove();
  }
});

Hooks.on("getSceneControlButtons", (controls) => {
  let group = controls.find((b) => b.name == "token");
  group.tools.push(
    {
      name: "add",
      title: "YZECORIOLIS.DarknessPointsAdd",
      icon: "fas fa-plus",
      buttons: true,
      visible: game.user.isGM,
      onClick: () => {
        addDarknessPoints(1);
      },
    },
    {
      name: "substract",
      title: "YZECORIOLIS.DarknessPointsRemove",
      icon: "fas fa-minus",
      buttons: true,
      visible: game.user.isGM,
      onClick: () => {
        spendDarknessPoints(1);
      },
    },
    {
      name: "inspect",
      title: "YZECORIOLIS.DarknessPoints",
      icon: "fas fa-question",
      buttons: true,
      visible: game.user.isGM,
      onClick: () => {
        displayDarknessPoints();
      },
    }
  );
});

Hooks.once("ready", async function () {
  // Determine whether a system migration is required and feasible
  const currentVersion = game.settings.get(
    "yzecoriolis",
    "systemMigrationVersion"
  );
  const NEEDS_MIGRATION_VERSION = "2.5.0";
  const COMPATIBLE_MIGRATION_VERSION = "1.4.7";
  let needMigration =
    currentVersion &&
    isNewerVersion(NEEDS_MIGRATION_VERSION, currentVersion) &&
    currentVersion !== "0"; // zero means we just created a new world.

  // Perform the migration
  if (needMigration && game.user.isGM) {
    if (
      currentVersion &&
      isNewerVersion(COMPATIBLE_MIGRATION_VERSION, currentVersion)
    ) {
      ui.notifications.error(
        `Your Coriolis system data is from too old a Foundry version and cannot be reliably migrated to the latest version. The process will be attempted, but errors may occur.`,
        { permanent: true }
      );
    }
    await migrations.migrateWorld();
  }
  //bootstrapTalentCompendium();
  //bootstrapGearCompendium();

  // wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on("hotbarDrop", (bar, data, slot) =>
    createYzeCoriolisMacro(data, slot)
  );

  await importShipSheetTutorial();
  await showOnboardingMessage();
});

Hooks.once("diceSoNiceReady", (dice3d) => {
  dice3d.addSystem(
    { id: "yzecoriolis", name: "Coriolis: Third Horizon" },
    true
  );
  dice3d.addDicePreset({
    type: "d6",
    labels: [
      "systems/yzecoriolis/css/images/dice-1.png",
      "systems/yzecoriolis/css/images/dice-2.png",
      "systems/yzecoriolis/css/images/dice-3.png",
      "systems/yzecoriolis/css/images/dice-4.png",
      "systems/yzecoriolis/css/images/dice-5.png",
      "systems/yzecoriolis/css/images/dice-6.png",
    ],
    // bumpMaps: [, , , , , , , , , , , , , , , , , , ,
    //   "systems/archmage/images/nat20_BUMP.png"
    // ],
    system: "yzecoriolis",
  });
  dice3d.addColorset(
    {
      name: "yzecoriolis",
      description: "Coriolis Third Horizon",
      category: "Colors",
      foreground: "#FFFFFF",
      background: "#000000",
      outline: "gray",
      texture: "none",
    },
    "force"
  );
});

/**
 * Create a macro from an Item drop
 * @param  {} data
 * @param  {} slot
 */
async function createYzeCoriolisMacro(data, slot) {
  if (data.type !== "Item") return;
  if (!("data" in data))
    return ui.notifications.warn(
      "You can only create macro buttons for owned items"
    );
  const item = data.data;

  // create the macro command
  const command = `game.yzecoriolis.rollItemMacro("${item.name}");`;
  let macro = game.macros.contents.find(
    (m) => m.name === item.name && m.command === command
  );
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: "script",
      img: item.img,
      command: command,
      flags: { "yzecoriolis.itemMacro": true },
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Create a macro from an item drop. Get an existing item macro if it exists. Otherwise create a new one.
 * @param  {} itemName
 */
function rollItemMacro(itemName) {
  const speaker = ChatMessage.getSpeaker();
  let actor;
  if (speaker.token) actor = game.actors.tokens[speaker.token];
  if (!actor) actor = game.actors.get(speaker.actor);

  if (!actor) {
    return ui.notifications.warn(
      game.i18n.localize("YZECORIOLIS.ErrorsNoActorSelectedForMacro")
    );
  }
  // Get matching items
  const items = actor ? actor.items.filter((i) => i.name === itemName) : [];
  if (items.length > 1) {
    ui.notifications.warn(
      `Your controlled Actor ${actor.name} has more than one Item with name ${itemName}. The first matched item will be chosen.`
    );
  } else if (items.length === 0) {
    return ui.notifications.warn(
      `Your controlled Actor does not have an item named ${itemName}`
    );
  }
  const item = items[0];

  // Trigger the item roll
  return item.roll();
}
