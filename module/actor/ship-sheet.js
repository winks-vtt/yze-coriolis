import { getActiveEPTokens, setActiveEPTokens } from "../item/ep-token.js";
import {
  computeNewBarValue,
  onHoverBarSegmentIn,
  onHoverBarOut,
  prepDataBarBlocks,
} from "./databar.js";

/**
 * Extend the basic ActorSheet for a basic Coriolis ship sheet
 * @extends {ActorSheet}
 */
export class yzecoriolisShipSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["yzecoriolis", "sheet", "actor", "ship"],
      template: "systems/yzecoriolis/templates/actor/ship-sheet.html",
      width: 1200,
      height: 880,
      resizable: false,
      tabs: [
        {
          navSelector: ".navigation",
          contentSelector: ".sheet-panels",
          initial: "crew",
        },
      ],
    });
  }

  getData() {
    const data = super.getData();
    if (this.actor.data.type === "ship") {
      this._prepShipStats(data);
    }
    data.config = CONFIG.YZECORIOLIS;
    return data;
  }

  _prepShipStats(sheetData) {
    const sheetActor = sheetData.actor;
    const data = sheetActor.data;
    sheetActor.hullBlocks = prepDataBarBlocks(
      data.hullPoints.value,
      data.hullPoints.max
    );

    const activeTokens = getActiveEPTokens(this.actor);
    console.log("tokens", activeTokens);
    sheetActor.energyBlocks = prepDataBarBlocks(
      activeTokens.length,
      data.energyPoints.max
    );

    // pull in any relevant crew.
    sheetActor.crew = [];
    const shipId = sheetActor._id;
    for (let e of game.actors.entities) {
      let rootData = e.data;
      if (rootData.type === "character" || rootData.type === "npc") {
        const crewShipId = rootData.data.bio.crewPosition.shipId;
        if (shipId !== crewShipId) {
          continue;
        }
        const crewCopy = { ...rootData };
        crewCopy.energyBlocks = prepDataBarBlocks(
          data.energyPoints.value,
          data.energyPoints.max
        );
        sheetActor.crew.push(crewCopy);
      }
    }
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // databar editing
    html.find(".bar-segment").click(this._onClickBarSegment.bind(this));
    html.find(".bar-segment").mouseenter(onHoverBarSegmentIn);
    html.find(".bar").mouseleave(onHoverBarOut);
  }

  async _onClickBarSegment(event) {
    event.preventDefault();
    const targetSegment = event.currentTarget;
    // Get the type of item to create.
    const index = Number(targetSegment.dataset.index) || 0;
    const curValue = Number(targetSegment.dataset.current) || 0;
    const minValue = Number(targetSegment.dataset.min) || 0;
    const maxValue = Number(targetSegment.dataset.max) || 0;
    const targetField = targetSegment.dataset.name;
    // Grab any data associated with this control.
    let newBarValue = computeNewBarValue(index, curValue, minValue, maxValue);
    let update = {};
    update[targetField] = newBarValue;

    await this.actor.update(update);
    return setActiveEPTokens(this.actor);
  }
}
