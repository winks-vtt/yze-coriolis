import { getID } from "../util.js";
import { coriolisRoll } from "../coriolis-roll.js";
import { coriolisModifierDialog } from "../coriolis-roll.js";
import {
  computeNewBarValue,
  onHoverBarSegmentIn,
  onHoverBarOut,
  prepDataBarBlocks,
} from "./databar.js";
import { buildCrewOptionsArray } from "./crew.js";
/**
 * Extend the basic ActorSheet for a basic Coriolis character
 * @extends {ActorSheet}
 */
export class yzecoriolisActorSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["yzecoriolis", "sheet", "actor", "character"],
      template: "systems/yzecoriolis/templates/actor/actor-sheet.html",
      width: 1000,
      height: 800,
      resizable: false,
      scrollY: [
        ".gear-wrapper .gear-list",
        ".talent-list",
        ".critical-injuries-list",
      ],
      tabs: [
        {
          navSelector: ".navigation",
          contentSelector: ".sheet-panels",
          initial: "stats",
        },
      ],
    });
  }

  /**
   * Activate a named TinyMCE text editor
   * @param {string} name             The named data field which the editor modifies.
   * @param {object} options          TinyMCE initialization options passed to TextEditor.create
   * @param {string} initialContent   Initial text content for the editor area.
   */
  activateEditor(name, options = {}, initialContent = "") {
    const customOptions = { ...options, body_class: "charnotes-edit-body" };
    super.activateEditor(name, customOptions, initialContent);
  }
  /* -------------------------------------------- */

  /** @override */
  getData(options) {
    const baseData = super.getData(options);
    let itemData = {};
    let actorStats = {};
    if (
      this.actor.data.type === "character" ||
      this.actor.data.type === "npc"
    ) {
      // prepare items
      itemData = this._prepareCharacterItems(baseData.actor);
      actorStats = this._prepCharacterStats(baseData.actor.data.data);
    }
    const sheetData = {
      editable: baseData.editable,
      owner: baseData.actor.isOwner,
      config: CONFIG.YZECORIOLIS,
      ...baseData.actor.data,
      ...itemData,
      ...actorStats,
    };
    return sheetData;
  }

  _prepCharacterStats(data) {
    const stats = {
      radiationBlocks: prepDataBarBlocks(
        data.radiation.value,
        data.radiation.max
      ),
      xpBlocks: prepDataBarBlocks(data.experience.value, data.experience.max),
      repBlocks: prepDataBarBlocks(data.reputation.value, data.reputation.max),
      hpBlocks: prepDataBarBlocks(data.hitPoints.value, data.hitPoints.max),
      mindBlocks: prepDataBarBlocks(data.mindPoints.value, data.mindPoints.max),

      // we augment the sheet with our 'current' option so that the selection menu
      // can be driven by it.
      crewOptions: buildCrewOptionsArray(),
      currentCrewOption: JSON.stringify(data.bio.crewPosition),
    };
    return stats;
  }

  _prepareCharacterItems(actor) {
    // Initialize our containers
    const gear = [];
    const armor = [];
    const talents = {};
    const weapons = [];
    const explosives = [];
    const injuries = [];
    let totalWeightPoints = 0;

    const gearDataSet = {
      type: "gear",
      weight: "L",
      quantity: 1,
      defaultname: game.i18n.localize("YZECORIOLIS.NewGear"),
    };

    for (let k of Object.keys(CONFIG.YZECORIOLIS.talentCategories)) {
      talents[k] = {
        dataset: {
          type: "talent",
          defaultname: game.i18n.localize("YZECORIOLIS.NewTalent"),
          category: k,
        },
        items: [],
      };
    }

    const weaponDataSet = {
      type: "weapon",
      weight: "L",
      defaultname: game.i18n.localize("YZECORIOLIS.NewWeapon"),
    };

    const explosiveDataSet = {
      type: "weapon",
      weight: "L",
      quantity: 1,
      explosive: true,
      blastRadius: "close",
      blastPower: 1,
      defaultname: game.i18n.localize("YZECORIOLIS.NewExplosive"),
    };

    const armorDataSet = {
      type: "armor",
      weight: "L",
      armorRating: 1,
      extraFeatures: 0,
      defaultname: game.i18n.localize("YZECORIOLIS.NewArmor"),
    };

    const injuryDataSet = {
      type: "injury",
      defaultname: game.i18n.localize("YZECORIOLIS.NewCriticalInjury"),
    };

    for (let i of actor.items) {
      let item = i.data.data;
      // setup equipped status
      const isActive = getProperty(item, "equipped");
      item.toggleClass = isActive ? "equipped" : "";

      // append to gear
      if (i.type === "gear") {
        gear.push(i.data);
        if (isActive) {
          totalWeightPoints +=
            CONFIG.YZECORIOLIS.gearWeightPoints[item.weight] * item.quantity;
        }
      }
      // append to talents
      if (i.type === "talent") {
        talents[item.category].items.push(i.data);
      }

      // append to weapons and explosives
      if (i.type === "weapon") {
        if (item.explosive) {
          explosives.push(i.data);
        } else {
          weapons.push(i.data);
        }
        if (isActive) {
          totalWeightPoints +=
            CONFIG.YZECORIOLIS.gearWeightPoints[item.weight] * item.quantity;
        }
      }
      if (i.type === "armor") {
        armor.push(i.data);
        if (isActive) {
          totalWeightPoints += CONFIG.YZECORIOLIS.gearWeightPoints[item.weight]; // we assume 1 quantity.
        }
      }
      if (i.type === "injury") {
        injuries.push(i.data);
      }
    }
    // assign and return
    const itemData = {
      gear: gear,
      gearDataSet: gearDataSet,

      weapons: weapons,
      weaponDataSet: weaponDataSet,

      explosives: explosives,
      explosiveDataSet: explosiveDataSet,

      armor: armor,
      armorDataSet: armorDataSet,

      talents: talents,
      encumbrance: this._computeEncumbrance(totalWeightPoints),

      injuries: injuries,
      injuryDataSet: injuryDataSet,
    };
    return itemData;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // hook up scalable input fields

    html.find(".expandable-info").click((event) => this._onItemSummary(event));

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Add Inventory Item
    html.find(".item-create").click(this._onItemCreate.bind(this));

    // Add relationship
    html
      .find(".relationship-create")
      .click(this._onRelationshipCreate.bind(this));

    // delete relationship
    html
      .find(".relationship-delete")
      .click(this._onRelationshipDelete.bind(this));

    // databar editing
    html.find(".bar-segment").click(this._onClickBarSegment.bind(this));
    html.find(".bar-segment").mouseenter(onHoverBarSegmentIn);
    html.find(".bar").mouseleave(onHoverBarOut);

    // Update Inventory Item
    html.find(".item-edit").click((ev) => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.data.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    html.find(".item-post").click((ev) => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sendToChat();
    });

    // Item State Toggling
    html.find(".item-toggle").click(this._onToggleItem.bind(this));

    // update gear quantity directly from sheet.
    html
      .find(".gear-quantity-input")
      .change(this._onGearQuantityChanged.bind(this));

    // Delete Inventory Item
    html.find(".item-delete").click((ev) => {
      const confirmationDialog = new Dialog({
        title: game.i18n.localize("YZECORIOLIS.ItemDeleteConfirmationTitle"),
        content: `<p>${game.i18n.localize(
          "YZECORIOLIS.ItemDeleteConfirmationContent"
        )}</p>`,
        buttons: {
          yes: {
            icon: '<i class="fas fa-check"></i>',
            label: game.i18n.localize("Yes"),
            callback: () => {
              const li = $(ev.currentTarget).parents(".item");
              li.slideUp(200, async () => {
                await this.actor.deleteEmbeddedDocuments("Item", [
                  li.data("itemId"),
                ]);
              });
            },
          },
          no: {
            icon: '<i class="fas fa-times"></i>',
            label: game.i18n.localize("No"),
          },
        },
        default: "no",
      });
      confirmationDialog.render(true);
    });

    // Rollable abilities.
    html.find(".rollable").click(this._onRoll.bind(this));

    // drag events for macros
    if (this.actor.isOwner) {
      let handler = (ev) => this._onDragStart(ev);
      html.find("li.item").each((i, li) => {
        // ignore for the header row
        if (li.classList.contains("item-header")) return;
        // add draggable attribute and drag start listener
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }

    // handle crew position changes
    html.find(".crew-position").change(this._onCrewPositionChanged.bind(this));
  }

  /* -------------------------------------------- */

  _computeEncumbrance(totalWeight) {
    // your max is strength * 2.
    // We are doubling that value so we can avoid having to deal with fractions & floats
    // for smaller items.
    // totalWeight already has the doubling factored in.
    const strengthValue =
      this.actor.data.data.attributes.strength.value * 2 * 2;

    // for display purposes we'll halve everything so that encumbrance makes
    // sense to users that are familiar with the rules.
    let enc = {
      max: strengthValue / 2,
      value: totalWeight / 2,
    };
    let pct = (enc.value / enc.max) * 100;
    if (enc.value === 0) {
      pct = 0;
    }
    enc.percentage = Math.min(pct, 100);
    enc.encumbered = pct > 100;
    return enc;
  }

  /**
   * Handle changing the quantity of a gear item from the sheet directly.
   * @param  {} event
   */
  async _onGearQuantityChanged(event) {
    event.preventDefault();
    const input = event.target;
    let value = input.value;
    const li = $(event.currentTarget).parents(".item");
    const item = this.actor.items.get(li.data("itemId"));
    if (value < 0) {
      value = 0;
    }
    return item.update({ "data.quantity": value });
  }

  async _onCrewPositionChanged(event) {
    event.preventDefault();
    const crewSelection = JSON.parse(event.target.value);
    let oldShipId = this.actor.data.data.bio.crewPosition.shipId;
    return this.actor
      .update({ "data.bio.crewPosition": crewSelection })
      .then(() => {
        // force a rerender of the new ship
        if (crewSelection.shipId) {
          let ship = game.actors.get(crewSelection.shipId);
          if (ship) {
            ship.render();
          }
        }
        // force a rerender of the old ship, if any
        if (oldShipId) {
          let oldShip = game.actors.get(oldShipId);
          if (oldShip) {
            oldShip.render();
          }
        }
      });
  }

  _onClickBarSegment(event) {
    event.preventDefault();
    const targetSegment = event.currentTarget;
    // Get the type of item to create.
    const index = Number(targetSegment.dataset.index);
    const curValue = Number(targetSegment.dataset.current);
    const minValue = Number(targetSegment.dataset.min);
    const maxValue = Number(targetSegment.dataset.max);
    const targetField = targetSegment.dataset.name;
    // Grab any data associated with this control.
    let newRad = computeNewBarValue(index, curValue, minValue, maxValue);
    let update = {};
    update[targetField] = newRad;
    return this.actor.update(update);
  }

  async _onRelationshipCreate(event) {
    event.preventDefault();
    const person = {
      buddy: false,
      name: "",
    };
    let relationships = {};
    if (this.actor.data.data.relationships) {
      relationships = foundry.utils.deepClone(
        this.actor.data.data.relationships
      );
    }
    let key = getID();
    relationships["r" + key] = person;
    return this.actor.update({ "data.relationships": relationships });
  }

  async _onRelationshipDelete(event) {
    const li = $(event.currentTarget).parents(".relation");
    let relations = foundry.utils.deepClone(this.actor.data.data.relationships);
    let targetKey = li.data("itemId");
    delete relations[targetKey];
    li.slideUp(200, async () => {
      await this._setRelations(relations);
    });
  }

  async _setRelations(relations) {
    await this.actor.update({ "data.relationships": null }, { render: false });
    await this.actor.update({ "data.relationships": relations });
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = foundry.utils.deepClone(header.dataset);
    // Initialize a default name.
    const name = data.defaultname;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      data: data,
    };

    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.data["type"];
    // no need to keep ahold of defaultname after creation.
    delete itemData.data["defaultname"];

    return this.actor.createEmbeddedDocuments("Item", [itemData]);
  }

  /**
   * Handle toggling the state of an Owned Item within the Actor
   * @param {Event} event   The triggering click event
   * @private
   */
  _onToggleItem(event) {
    event.preventDefault();
    const itemId = event.currentTarget.closest(".item").dataset.itemId;
    const item = this.actor.items.get(itemId);
    const attr = "data.equipped";
    return item.update({ [attr]: !getProperty(item.data, attr) });
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    const actorData = this.actor.data.data;
    const automaticWeapon = dataset.automaticweapon === "true";
    const rollData = {
      rollType: dataset.rolltype,
      skillKey: dataset.skillkey,
      skill: dataset.skillkey ? actorData.skills[dataset.skillkey].value : 0,
      attributeKey: dataset.attributekey,
      attribute: dataset.attributekey
        ? actorData.attributes[dataset.attributekey].value
        : 0,
      modifier: 0,
      bonus: dataset.bonus ? Number(dataset.bonus) : 0,
      rollTitle: dataset.label,
      pushed: false,
      actorType: this.actor.data.type,
    };
    const chatOptions = this.actor._prepareChatRollOptions(
      "systems/yzecoriolis/templates/sidebar/roll.html",
      dataset.rolltype
    );
    coriolisModifierDialog((modifier, additionalData) => {
      rollData.modifier = modifier;
      rollData.additionalData = additionalData;
      coriolisRoll(chatOptions, rollData);
    }, automaticWeapon);
  }

  /**
   * Handle showing an item's description in the character sheet as an easy fold out.
   * @private
   */
  _onItemSummary(event) {
    event.preventDefault();
    let li = $(event.currentTarget).parents(".item");
    let item = this.actor.items.get(li.data("item-id"));
    let chatData = item.getChatData({ secrets: this.actor.isOwner });
    // Toggle summary
    if (li.hasClass("expanded")) {
      let summary = li.children(".item-summary");
      summary.slideUp(200, () => {
        summary.remove();
      });
    } else {
      let div = $(
        `<div class="item-summary"><div class="item-summary-wrapper"><div>${chatData.description}</div></div></div>`
      );
      if (! game.settings.get("yzecoriolis", "AlwaysShowFeatures")) {
        let props = $(`<div class="item-properties"></div>`);
        chatData.properties.forEach((p) =>
          props.append(`<span class="tag">${p}</span>`)
        );

        $(div).find(".item-summary-wrapper").append(props);
      };
      // div.append(props);
      li.append(div.hide());
      div.slideDown(200);
    }
    li.toggleClass("expanded");
  }
}
