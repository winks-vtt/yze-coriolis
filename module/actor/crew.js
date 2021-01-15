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
    let actorRootData = e.data;
    if (actorRootData.type === "ship") {
      options.push(
        ...baseOptions.map((bo) => {
          return createOption(
            `${actorRootData.name} - ${bo.label}`,
            bo.value.position,
            actorRootData._id
          );
        })
      );
    }
  }
  return options;
}
