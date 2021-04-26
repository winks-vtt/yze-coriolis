export const getID = function () {
  // Math.random should be unique because of its seeding algorithm.
  // Convert it to base 36 (numbers + letters), and grab the first 9 characters
  // after the decimal.
  return "_" + Math.random().toString(36).substr(2, 9);
};

export const getItemsByType = (itemType) => {
  return game.items.entities.filter((item) => {
    return item.data.type === itemType;
  });
};

export const getOwnedItemsByType = (actor, itemType) => {
  return actor.data.items.filter((item) => item.type === itemType);
};

export const getActorsByType = (actorType) => {
  return game.actors.entities.filter((a) => {
    return a.data.type === actorType;
  });
};

export const getActorById = (actorId) => {
  return game.actors.get(actorId);
};
