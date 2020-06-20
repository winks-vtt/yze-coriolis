// Import Modules
import { YZECORIOLIS } from "./config.js";
import { registerSystemSettings } from "./settings.js";
import { yzecoriolisActor } from "./actor/actor.js";
import { yzecoriolisActorSheet } from "./actor/actor-sheet.js";
import { yzecoriolisItem } from "./item/item.js";
import { yzecoriolisItemSheet } from "./item/item-sheet.js";

import { bootstrapGearCompendium } from './migration.js';
import * as migrations from "./migration.js";
import { ChatMessageYZECoriolis } from "./sidebar/chatmessage.js";

Hooks.once('init', async function () {
  console.log(`Coriolis | Initializing Coriolis\n${YZECORIOLIS.ASCII}`);
  game.yzecoriolis = {
    yzecoriolisActor,
    yzecoriolisItem,
    rollItemMacro,
    config: YZECORIOLIS,
    migrations: migrations
  };

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: "1d10",
    decimals: 2
  };

  // Define custom Entity classes
  CONFIG.Actor.entityClass = yzecoriolisActor;
  CONFIG.Item.entityClass = yzecoriolisItem;
  CONFIG.YZECORIOLIS = YZECORIOLIS;
  CONFIG.ChatMessage.entityClass = ChatMessageYZECoriolis;
  //Register system settings
  registerSystemSettings();

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("yzecoriolis", yzecoriolisActorSheet, { makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("yzecoriolis", yzecoriolisItemSheet, { makeDefault: true });

  // If you need to add Handlebars helpers, here are a few useful examples:
  Handlebars.registerHelper('concat', function () {
    var outStr = '';
    for (var arg in arguments) {
      if (typeof arguments[arg] != 'object') {
        outStr += arguments[arg];
      }
    }
    return outStr;
  });

  Handlebars.registerHelper('toLowerCase', function (str) {
    return str.toLowerCase();
  });

  Handlebars.registerHelper('if_eq', function (a, b, opts) {
    if (a === b) {
      return opts.fn(this);
    } else {
      return opts.inverse(this);
    }
  });

  Handlebars.registerHelper('getSkillName', function (skillkey) {
    return CONFIG.YZECORIOLIS.skills[skillkey];
  });

  Handlebars.registerHelper('getSkillCategoryName', function (skillkey) {
    return CONFIG.YZECORIOLIS.skillCategories[skillkey];
  });

  Handlebars.registerHelper('getAttributeName', function (attributeKey) {
    return CONFIG.YZECORIOLIS.attributes[attributeKey];
  });

  Handlebars.registerHelper('getTalentCategoryName', function (talentCategoryKey) {
    return CONFIG.YZECORIOLIS.talentCategories[talentCategoryKey];
  });

  Handlebars.registerHelper('getGearWeightName', function (gearWeight) {
    return CONFIG.YZECORIOLIS.gearWeights[gearWeight];
  });

  Handlebars.registerHelper('getGearName', function (gearName) {
    return CONFIG.YZECORIOLIS.gearNames[gearName];
  });

  Handlebars.registerHelper('getTechTierName', function (tier) {
    return CONFIG.YZECORIOLIS.techTiers[tier];
  });

  Handlebars.registerHelper('getWeightName', function (weight) {
    return CONFIG.YZECORIOLIS.gearWeights[weight];
  });

  Handlebars.registerHelper('talentHasCost', function (talentCategory, opts) {
    if (talentCategory === 'cybernetic' || talentCategory === 'bionicsculpt') {
      return opts.fn(this);
    } else {
      return opts.inverse(this);
    }
  });

});

// called after game data is loaded from severs. entities exist
Hooks.once("setup", function () {
  // Localize CONFIG objects once up-front
  const toLocalize = [
    "attributes",
    "skillCategories",
    "skills",
    "talentCategories",
    "talentGroupConceptCategories",
    "talents",
    "techTiers",
    "gearWeights",
    "critTypes",
    "ranges"
  ];

  // exclude sorting from some config values where the order matters.
  const noSort = ['talentCategories', 'techTiers', 'gearWeights', 'critTypes', 'ranges'];

  for (let o of toLocalize) {
    const localized = Object.entries(CONFIG.YZECORIOLIS[o]).map(e => {
      return [e[0], game.i18n.localize(e[1])];
    });
    if (!noSort.includes(o)) localized.sort((a, b) => a[1].localeCompare(b[1]));
    CONFIG.YZECORIOLIS[o] = localized.reduce((obj, e) => {
      obj[e[0]] = e[1];
      return obj;
    }, {});
  }

});


Hooks.once('ready', async function () {
  // Determine whether a system migration is required and feasible
  const currentVersion = game.settings.get("yzecoriolis", "systemMigrationVersion");
  const NEEDS_MIGRATION_VERSION = 0.1;
  const COMPATIBLE_MIGRATION_VERSION = 0.1;
  let needMigration = (currentVersion < NEEDS_MIGRATION_VERSION) || (currentVersion === null);

  // Perform the migration
  if (needMigration && game.user.isGM) {
    if (currentVersion && (currentVersion < COMPATIBLE_MIGRATION_VERSION)) {
      ui.notifications.error(`Your Year Zero Engine Coriolis system data is from too old a Foundry version and cannot be reliably migrated to the latest version. The process will be attempted, but errors may occur.`, { permanent: true });
    }
    migrations.migrateWorld();
  }
  //bootstrapTalentCompendium();
  //bootstrapGearCompendium();
  // wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on("hotbarDrop", (bar, data, slot) => createYzeCoriolisMacro(data, slot));
});

/**
 * Create a macro from an Item drop
 * @param  {} data
 * @param  {} slot
 */
async function createYzeCoriolisMacro(data, slot) {
  if (data.type !== "Item") return;
  if (!("data" in data)) return ui.notifications.warn("You can only create macro buttons for owned items");
  const item = data.data;

  // create the macro command
  const command = `game.yzecoriolis.rollItemMacro("${item.name}");`;
  let macro = game.macros.entities.find(m => (m.name === item.name) && (m.command === command));
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: "script",
      mg: item.img,
      command: command,
      flags: { "yzecoriolis.itemMacro": true }
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
  const item = actor ? actor.items.find(i => i.name === itemName) : null;
  if (!item) return ui.notifications.warn(`Your controlled Actor does not have an item named ${itemName}`);

  // trigger the item roll
  return item.roll();
}