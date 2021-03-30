import { getID } from "../util.js";

export const createBlankEPToken = async (shipEntity) => {
  const tokenData = {
    name: getID(),
    type: "energyPointToken",
    data: {
      active: false,
      holder: shipEntity.id,
    },
  };
  return await shipEntity.createOwnedItem(tokenData);
};
