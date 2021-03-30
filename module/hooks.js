import { resetCrewForShip } from "./actor/crew.js";
import { createBlankEPToken } from "./item/ep-token.js";

// eslint-disable-next-line no-unused-vars
Hooks.on("updateActor", (entity, data, options, userId) => {
  // since the main character sheet edit only updates the key art field, and
  // this size isn't suitable for the actor browser, we hook into the actor
  // update and propagate any token updates to the actor's img field.
  if (options.diff && hasProperty(data, "token")) {
    // there is two cases here:
    // 1. A brand new image has been propagated up. that means the delta
    //    here will have an image field
    // 2. There is no 'img' field, and the token field was a non-img update.
    //    in #1 we just copy the data. in #2 we will attempt to source the
    //    data (if available) from the already existing token object on the
    //    actor entity.
    if (hasProperty(data, "token.img")) {
      entity.update({ img: data.token.img });
    } else {
      if (hasProperty(entity, "data.token.img")) {
        entity.update({ img: entity.data.token.img });
      }
    }
  }
});

// eslint-disable-next-line no-unused-vars
Hooks.on("deleteActor", (entity, options, userId) => {
  if (entity.data.type === "ship") {
    resetCrewForShip(entity._id).then(() => {
      rerenderAllCrew();
    });
  }
});

// eslint-disable-next-line no-unused-vars
Hooks.on("createActor", async (entity, options, userId) => {
  if (entity.data.type === "ship") {
    rerenderAllCrew();
    await createEPTokensForShip(entity);
  }
});

function rerenderAllCrew() {
  // re render all characters/npcs to update their crew position drop downs.
  for (let e of game.actors.entities) {
    let rootData = e.data;
    if (rootData.type === "character" || rootData.type === "npc") {
      e.render();
    }
  }
}

async function createEPTokensForShip(entity) {
  for (let i = 0; i < CONFIG.YZECORIOLIS.MaxEPTokensPerShip; i++) {
    await createBlankEPToken(entity);
  }
}
