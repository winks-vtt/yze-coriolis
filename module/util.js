export const getID = function () {
  // Math.random should be unique because of its seeding algorithm.
  // Convert it to base 36 (numbers + letters), and grab the first 9 characters
  // after the decimal.
  return "_" + Math.random().toString(36).substr(2, 9);
};

export const getItemsByType = (itemType) => {
  return game.items.contents.filter((item) => {
    return item.data.type === itemType;
  });
};

export const getOwnedItemsByType = (actor, itemType) => {
  return actor.data.items.filter((item) => item.type === itemType);
};

export const getOwnedItemById = (actor, itemId) => {
  return actor.data.items.find((item) => item.id === itemId);
};

export const getActorEntitiesByType = (actorType) => {
  return game.actors.contents.filter((a) => {
    return a.data.type === actorType;
  });
};

/**
 * @param  {String} actorId
 * @returns the actor data object.
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
  return actor.data;
};

/**
 * @param  {String} actorId
 * @returns the Actor Entity object for actorId. Not meant for general use.
 * Prefer to use getActorById when possible.
 */
export const getActorEntityById = (actorId) => {
  const actor = game.actors.get(actorId);
  if (!actor) {
    console.warn("actor not found with ID: ", actorId);
    return null;
  }
  return actor;
};
