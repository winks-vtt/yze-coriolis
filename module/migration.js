import { addDarknessPoints } from "./darkness-points.js";
import { getDefaultItemIcon } from "./item/item.js";
/**
 * Perform a system migration for the entire World, applying migrations for Actors, Items, and Compendium packs
 * @return {Promise}      A Promise which resolves once the migration is completed
 */
export const migrateWorld = async function () {
  ui.notifications.info(
    `Applying Coriolis System Migration for version ${game.system.data.version}. Please be patient and do not close your game or shut down your server.`,
    { permanent: true }
  );

  // Migrate World Actors
  for (let a of game.actors.contents) {
    try {
      const updateData = migrateActorData(a.data);
      if (!foundry.utils.isObjectEmpty(updateData)) {
        console.log(`Migrating Actor entity ${a.name}`);
        await a.update(updateData, { enforceTypes: false });
      }
    } catch (err) {
      console.error(err);
    }
  }
  // Migrate World Items
  for (let i of game.items.contents) {
    try {
      const updateData = migrateItemData(i.toObject());
      if (!foundry.utils.isObjectEmpty(updateData)) {
        console.log(`Migrating Item entity ${i.name}`);
        await i.update(updateData, { enforceTypes: false });
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Migrate Actor Override Tokens
  for (let s of game.scenes.contents) {
    try {
      const updateData = migrateSceneData(s.data);
      if (!foundry.utils.isObjectEmpty(updateData)) {
        console.log(`Migrating Scene entity ${s.name}`);
        await s.update(updateData, { enforceTypes: false });
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Migrate World Compendium Packs
  const packs = game.packs.filter((p) => {
    return (
      p.metadata.package === "world" &&
      ["Actor", "Item", "Scene"].includes(p.metadata.entity)
    );
  });
  for (let p of packs) {
    await migrateCompendium(p);
  }

  // migrate Darkness Point System
  await migrateDarknessPoints();

  // Set the migration as complete
  await game.settings.set(
    "yzecoriolis",
    "systemMigrationVersion",
    game.system.data.version
  );
  ui.notifications.info(
    `Coriolis System Migration to version ${game.system.data.version} completed!`,
    { permanent: true }
  );
};

/* -------------------------------------------- */

/**
 * Bootstrap the talent compendium
 */
export const bootstrapTalentCompendium = async function () {
  const talentPack = game.packs.find((p) => {
    return (
      p.metadata.package === "world" &&
      p.metadata.entity === "Item" &&
      p.metadata.name === "talents"
    );
  });

  // Load an external JSON data file which contains data for import
  const response = await fetch("worlds/dev-coriolis/talent-import.json");
  const content = await response.json();

  const tempItems = await Item.create(content, { temporary: true });
  for (let t of tempItems) {
    await talentPack.importEntity(t);
    console.log(`imported Talent ${t.name} into ${talentPack.collection}`);
  }
};

export const bootstrapGearCompendium = async function () {
  //await importEveryDayItemsCompendium("Everyday Items", "everyday-items");
  await importEveryDayItemsCompendium(
    "Medicurgical Technology",
    "medicurgical-technology"
  );
  await importEveryDayItemsCompendium(
    "Tools And Spare Parts",
    "tools-and-spare-parts"
  );
  await importEveryDayItemsCompendium(
    "Survival and Colonization",
    "survival-and-colonization"
  );
  await importEveryDayItemsCompendium("Exos and Vehicles", "exos-and-vehicles");
  await importEveryDayItemsCompendium(
    "Recon and Infiltration",
    "recon-and-infiltration"
  );
  await importEveryDayItemsCompendium("Combat Gear", "combat-gear");
};

const importEveryDayItemsCompendium = async function (
  contentKey,
  compendiumName
) {
  const targetCompendiumObject = getCompendiumForImport(compendiumName);
  // Load an external JSON data file which contains data for import
  const response = await fetch(
    "modules/coriolis-core-compendiums/imports/import-coriolis-core-compendium-gear.json"
  );
  const content = await response.json();
  const gearArray = content[contentKey];

  let preppedGearArray = prepItemsForImport(gearArray);
  await importItemsIntoCompendium(targetCompendiumObject, preppedGearArray);
};

const getCompendiumForImport = function (compendiumName) {
  const comp = game.packs.find((p) => {
    return (
      p.metadata.package === "world" &&
      p.metadata.entity === "Item" &&
      p.metadata.name === compendiumName
    );
  });
  return comp;
};
const prepItemsForImport = function (itemArray) {
  let itemList = [];
  for (let t of itemArray) {
    let tt = { data: t };
    tt.name = t.name;
    tt.type = "gear";
    delete t.name;
    itemList.push(tt);
  }
  console.log(itemList);
  return itemList;
};

const importItemsIntoCompendium = async function (
  targetCompendium,
  preppedList
) {
  const tempItems = await Item.create(preppedList, { temporary: true });
  for (let t of tempItems) {
    await targetCompendium.importEntity(t);
    console.log(`imported Item ${t.name} into ${targetCompendium.collection}`);
  }
};
/**
 * Apply migration rules to all Entities within a single Compendium pack
 * @param pack
 * @return {Promise}
 */
export const migrateCompendium = async function (pack) {
  const entity = pack.metadata.entity;
  if (!["Actor", "Item", "Scene"].includes(entity)) return;

  // Begin by requesting server-side data model migration and get the migrated content
  await pack.migrate();
  const content = await pack.getContent();

  // Iterate over compendium entries - applying fine-tuned migration functions
  for (let ent of content) {
    try {
      let updateData = null;
      if (entity === "Item") updateData = migrateItemData(ent.data);
      else if (entity === "Actor") updateData = migrateActorData(ent.data);
      else if (entity === "Scene") updateData = migrateSceneData(ent.data);
      if (!foundry.utils.isObjectEmpty(updateData)) {
        expandObject(updateData);
        updateData["_id"] = ent._id;
        await pack.updateEntity(updateData);
        console.log(
          `Migrated ${entity} entity ${ent.name} in Compendium ${pack.collection}`
        );
      }
    } catch (err) {
      console.error(err);
    }
  }
  console.log(
    `Migrated all ${entity} entities from Compendium ${pack.collection}`
  );
};

/* -------------------------------------------- */
/*  Entity Type Migration Helpers               */
/* -------------------------------------------- */

/**
 * Migrate a single Actor entity to incorporate latest data model changes
 * Return an Object of updateData to be applied
 * @param {Actor} actor   The actor to Update
 * @return {Object}       The updateData to apply
 */
export const migrateActorData = function (actor) {
  let updateData = {};

  // Migrate Owned Items
  if (!actor.items) return updateData;
  const items = actor.items.reduce((arr, i) => {
    // Migrate the Owned Item
    const itemData = i instanceof CONFIG.Item.documentClass ? i.toObject() : i;
    let itemUpdate = migrateItemData(itemData);

    // Update the Owned Item
    if (!foundry.utils.isObjectEmpty(itemUpdate)) {
      itemUpdate._id = itemData._id;
      arr.push(expandObject(itemUpdate));
    }

    return arr;
  }, []);
  if (items.length > 0) updateData.items = items;
  return updateData;
};

/* -------------------------------------------- */

/**
 * Migrate a single Item entity to incorporate latest data model changes
 * @param item
 */
export const migrateItemData = function (item) {
  let updateData = {};

  const itemType = item.type;
  const isUsingDefaultIcon = [
    "icons/svg/item-bag.svg",
    CONST.DEFAULT_TOKEN,
  ].includes(item.img);

  const isTypeWithCustomIcon =
    itemType === "weapon" ||
    itemType === "armor" ||
    itemType === "gear" ||
    itemType === "talent";
  if (isUsingDefaultIcon && isTypeWithCustomIcon) {
    updateData = { img: getDefaultItemIcon(itemType, !!item.data.explosive) };
    console.log(
      itemType,
      "should upate to:",
      getDefaultItemIcon(itemType, !!item.data.explosive)
    );
  }
  // Return the migrated update data
  return updateData;
};

/* -------------------------------------------- */

/**
 * Migrate a single Scene entity to incorporate changes to the data model of it's actor data overrides
 * Return an Object of updateData to be applied
 * @param {Object} scene  The Scene data to Update
 * @return {Object}       The updateData to apply
 */
export const migrateSceneData = function (scene) {
  const tokens = foundry.utils.deepClone(scene.tokens);
  return {
    tokens: tokens.map((t) => {
      if (!t.actorId || t.actorLink || !t.actorData.data) {
        t.actorData = {};
        return t;
      }
      const token = new Token(t);
      if (!token.actor) {
        t.actorId = null;
        t.actorData = {};
      } else if (!t.actorLink) {
        const updateData = migrateActorData(token.data.actorData);
        t.actorData = foundry.utils.mergeObject(
          token.data.actorData,
          updateData
        );
      }
      return t;
    }),
  };
};

const migrateDarknessPoints = async function () {
  if (!game.user.isGM) {
    return;
  }
  let dpPoints = game.settings.get("yzecoriolis", "darknessPoints");
  const MIGRATED_VALUE = -42;
  if (dpPoints !== MIGRATED_VALUE) {
    await addDarknessPoints(dpPoints);
    await game.settings.set("yzecoriolis", "darknessPoints", MIGRATED_VALUE);
    ui.notifications.info(game.i18n.localize("YZECORIOLIS.MigratedDP"), {
      permanent: true,
    });
  }
};
