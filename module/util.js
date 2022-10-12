export const getID = function () {
  // Math.random should be unique because of its seeding algorithm.
  // Convert it to base 36 (numbers + letters), and grab the first 9 characters
  // after the decimal.
  return "_" + Math.random().toString(36).substr(2, 9);
};

export const getItemsByType = (itemType) => {
  return game.items.contents.filter((item) => {
    return item.type === itemType;
  });
};

export const getOwnedItemsByType = (actor, itemType) => {
  return actor.items.filter((item) => item.type === itemType);
};

export const getOwnedItemById = (actor, itemId) => {
  return actor.items.find((item) => item.id === itemId);
};

export const getActorEntitiesByType = (actorType) => {
  return game.actors.contents.filter((a) => {
    return a.type === actorType;
  });
};

/**
 * @param  {String} actorId
 * @returns the actor document object.
 */
export const getActorDataById = (actorId) => {
  if (!actorId) {
    return null;
  }
  const actor = game.actors.get(actorId);
  if (!actor) {
    console.warn("actor not found with ID: ", actorId);
    return null;
  }
  return actor;
};

export const hasOwnerPermissionLevel = (perm) => {
  return perm === CONST.DOCUMENT_PERMISSION_LEVELS.OWNER;
};
