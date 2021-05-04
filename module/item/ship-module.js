import { getOwnedItemById } from "../util.js";

export const toggleShipModule = async (shipEntity, moduleId) => {
  const moduleData = getShipModule(shipEntity, moduleId);
  const updateData = {
    _id: moduleData._id,
    data: {
      enabled: !moduleData.data.enabled,
    },
  };
  return shipEntity.updateEmbeddedEntity("OwnedItem", updateData);
};

const getShipModule = (shipEntity, moduleId) => {
  return getOwnedItemById(shipEntity, moduleId);
};
