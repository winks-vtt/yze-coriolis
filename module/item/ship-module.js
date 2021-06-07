import { getOwnedItemById } from "../util.js";

export const toggleShipModule = async (shipEntity, moduleId) => {
  const moduleData = getShipModule(shipEntity, moduleId);
  const updateData = {
    _id: moduleData.id,
    data: {
      enabled: !moduleData.data.data.enabled,
    },
  };
  return shipEntity.updateEmbeddedDocuments("Item", [updateData]);
};

const getShipModule = (shipEntity, moduleId) => {
  return getOwnedItemById(shipEntity, moduleId);
};
