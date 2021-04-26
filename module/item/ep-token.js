import { getID, getOwnedItemsByType } from "../util.js";

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
export const getActiveEPTokens = (shipEntity) => {
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
  const refreshedShip = game.actors.get(shipEntity.id);
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
