// buildCrewOptionsArray returns an array of objects detailing possible crew
// position data that the character sheet can select from.
export function buildCrewOptionsArray() {
  const createCrewObject = (position, shipId) => {
    return {
      position: position,
      shipId: shipId,
    };
  };
  const createOption = (label, position, shipId) => {
    let opt = {
      label: label,
      value: createCrewObject(position, shipId),
    };
    opt.key = JSON.stringify(opt.value);
    return opt;
  };

  let options = [];
  // options for without a ship association
  let baseOptions = Object.keys(CONFIG.YZECORIOLIS.crewPositions).map((c) => {
    return createOption(CONFIG.YZECORIOLIS.crewPositions[c], c, "");
  });

  options.push(...baseOptions);

  // create options for all other ships in the world.
  // TODO: should have to handle permissions/visibility here?
  for (let e of game.actors.entities) {
    let shipData = e.data;
    if (shipData.type === "ship") {
      options.push(
        ...baseOptions.map((bo) => {
          return createOption(
            `${shipData.name} - ${bo.label}`,
            bo.value.position,
            shipData._id
          );
        })
      );
    }
  }
  return options;
}

// resetCrewForShip takes all crew from current ship and blanks out their IDs.
export async function resetCrewForShip(shipId) {
  // There's a potential race here if we have multiple GMs, but since the end
  // result is the same I'm not worried about trying to figure out which one
  // should do the update call.
  if (!game.user.isGM) {
    return;
  }
  for (let e of game.actors.entities) {
    let charData = e.data;
    if (charData.type === "character" || charData.type === "npc") {
      if (charData.data.bio.crewPosition.shipId === shipId) {
        await e.update({ "data.bio.crewPosition.shipId": "" });
      }
    }
  }
  return null;
}
