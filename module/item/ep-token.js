import { getID, getOwnedItemsByType, getActorById } from "../util.js";

/**
 * @param  {Actor} shipEntity
 */
export const createBlankEPToken = async (shipEntity) => {
  // oddly, foundry's data format maps to name and type being at the root object
  // and all other fields being shoveled into the data object.
  const tokenData = {
    name: "epk" + getID(),
    type: "energyPointToken",
    data: {
      active: false,
      holder: shipEntity.id,
    },
  };
  return await shipEntity.createOwnedItem(tokenData);
};

/**
 * returns all EP tokens regardless of active state or holder.
 * @param  {Actor} shipEntity
 */
const getEPTokens = (shipEntity) => {
  return getOwnedItemsByType(shipEntity, "energyPointToken");
};

/**
 * @param  {Actor} shipEntity
 */
const getActiveEPTokens = (shipEntity) => {
  const tokens = getEPTokens(shipEntity);
  return tokens.filter((t) => t.data.active === true) || [];
};

/**
 * Takes all active tokens and deactives them. Then sets their holders back to
 * ship ID.
 * @param  {Actor} shipEntity
 */
export const resetAllEPTokens = async (shipEntity) => {
  const activeTokens = getActiveEPTokens(shipEntity);
  activeTokens.map((t) => {
    t.data.active = false;
    t.data.holder = shipEntity.id;
  });

  if (activeTokens.length === 0) {
    return null;
  }

  return await shipEntity.updateEmbeddedEntity("OwnedItem", activeTokens);
};

/**
 * @param  {Actor} shipEntity
 * @param  {Number} activeCount
 */
export const setActiveEPTokens = async (shipEntity, activeCount) => {
  // TODO: try to collapse this reset + set into a single API call to possibly
  // avoid double renders.
  await resetAllEPTokens(shipEntity);
  const refreshedShip = getActorById(shipEntity.id);
  const tokens = getEPTokens(refreshedShip);
  const newActiveTokens = [];
  for (let i = 0; i < activeCount; ++i) {
    const tk = {
      _id: tokens[i]._id,
      data: {
        active: true,
        holder: refreshedShip.id,
      },
    };
    newActiveTokens.push(tk);
  }
  await refreshedShip.updateEmbeddedEntity("OwnedItem", newActiveTokens);
};

/**
 * @param  {Actor} shipEntity
 * @returns the amount of active EP tokens that are currently held by the ship.
 */
export const shipEPCount = (shipEntity) => {
  const activeTokens = getActiveEPTokens(shipEntity);
  return activeTokens.filter((a) => a.data.holder === shipEntity.id).length;
};

/**
 * @param  {} shipEntity
 * @returns all active tokens that are assigned to the ship.
 */
const getShipTokens = (shipEntity) => {
  const activeTokens = getActiveEPTokens(shipEntity);
  return activeTokens.filter((a) => a.data.holder === shipEntity.id);
};

/**
 * Takes the tokens assigned to this crew member and re-assigns them back to the ship.
 * @param  {} shipEntity
 * @param  {} crewId
 */
export const restoreCrewEPTokensToShip = async (shipEntity, crewId) => {
  const activeTokens = getActiveEPTokens(shipEntity);
  const crewTokens = activeTokens.filter((a) => a.data.holder === crewId);
  const updatedData = crewTokens.map((ct) => {
    return {
      _id: ct._id,
      data: {
        holder: shipEntity.id,
      },
    };
  });
  await shipEntity.updateEmbeddedEntity("OwnedItem", updatedData);
};

/**
 * @param  {} shipEntity
 * @param  {} crewId ID of crew
 * @returns the amount of active EP tokens that are currently held by this crew
 * member
 */
export const crewEPCount = (shipEntity, crewId) => {
  const activeTokens = getActiveEPTokens(shipEntity);
  return activeTokens.filter((a) => a.data.holder === crewId).length;
};

/**
 * Allocates any EP tokens the ship has to this crew member. If the amount
 * requested is higher than the amount available, this will just allocate
 * whatever is remaining to the crew member.
 * @param  {Actor} shipEntity
 * @param  {String} crewId
 * @param  {Number} count
 */
export const setCrewEPCount = async (shipEntity, crewId, count) => {
  await restoreCrewEPTokensToShip(shipEntity, crewId);
  const shipTokenCount = shipEPCount(shipEntity);
  const allowedCount = Math.min(count, shipTokenCount);
  const shipTokens = getShipTokens(shipEntity);
  const updatedTokens = [];
  for (let i = 0; i < allowedCount; i++) {
    const t = shipTokens[i];
    updatedTokens.push({
      _id: t._id,
      data: {
        holder: crewId,
      },
    });
  }
  await shipEntity.updateEmbeddedEntity("OwnedItem", updatedTokens);
};

/**
 * returns the maximum allowed EP Tokens a user or ship can hold.
 */
export const getMaxAllowedEPTokens = () => {
  return game.settings.get("yzecoriolis", "maxEPTokensAllowed");
};
