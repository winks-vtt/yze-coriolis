import { resetCrewForShip } from "./actor/crew.js";
import { createBlankEPTokens, setActiveEPTokens } from "./item/ep-token.js";
import { displayDarknessPoints } from "./darkness-points.js";

// eslint-disable-next-line no-unused-vars
Hooks.on("updateUser", (entity, data, options, userId) => {
  // we avoid any null sets because we are just doing a clearing of the flag
  // before setting it to a valid value.
  const isSettingDP =
    hasProperty(data, "flags.yzecoriolis.darknessPoints") &&
    data.flags.yzecoriolis.darknessPoints !== null;

  if (options.diff && isSettingDP) {
    if (game.user.isGM) {
      displayDarknessPoints();
    }
  }
});

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

  rerenderAllShips();
});

// eslint-disable-next-line no-unused-vars
Hooks.on("deleteActor", (entity, options, userId) => {
  if (entity.data.type === "ship") {
    resetCrewForShip(entity.id).then(() => {
      rerenderAllCrew();
    });
  }
});

// eslint-disable-next-line no-unused-vars
Hooks.on("createActor", async (entity, options, userId) => {
  if (entity.data.type === "ship") {
    rerenderAllCrew();
    await createEPTokensForShip(entity);
    await setMaxEPTokensActive(entity);
  }
});

Hooks.on("renderCombatTracker", (app, html, data) => {
  const currentCombat = data.combats[data.currentIndex - 1];
  if (currentCombat) {
    html.find(".combatant").each((i, el) => {
      const id = el.dataset.combatantId;
      const combatant = currentCombat.data.combatants.find((c) => c.id === id);
      const initDiv = el.getElementsByClassName("token-initiative")[0];

      if (combatant.initiative != null) {
        const readOnly = game.user.isGM ? "" : "readonly";
        initDiv.innerHTML = `<input style="color: white; "type="number" ${readOnly} value="${combatant.initiative}">`;

        initDiv.addEventListener("change", async (e) => {
          const inputElement = e.target;
          const combatantId = inputElement.closest("[data-combatant-id]")
            .dataset.combatantId;
          await currentCombat.setInitiative(combatantId, inputElement.value);
        });
      }
    });
  }
});

function rerenderAllCrew() {
  // re render all characters/npcs to update their crew position drop downs.
  for (let e of game.actors.contents) {
    let rootData = e.data;
    if (rootData.type === "character" || rootData.type === "npc") {
      e.render(false);
    }
  }
}

function rerenderAllShips() {
  // re render all ships to update their crew tabs.
  for (let e of game.actors.contents) {
    let rootData = e.data;
    if (rootData.type === "ship") {
      e.render(false);
    }
  }
}

async function createEPTokensForShip(entity) {
  await createBlankEPTokens(entity, CONFIG.YZECORIOLIS.MaxEPTokensPerShip);
}

// setMaxEPTokensActive sets maxEnergyPoints worth of EP tokens active for the
// ship on initial creation so the bar isn't empty when you creat a new ship.
async function setMaxEPTokensActive(entity) {
  const epMax = entity.data.data.maxEnergyPoints;
  if (epMax) {
    await setActiveEPTokens(entity, epMax);
  }
}
