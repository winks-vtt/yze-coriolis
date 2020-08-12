import { getID } from '../util.js';
import { coriolisRoll } from '../coriolis-roll.js';
import { coriolisModifierDialog } from '../coriolis-roll.js';
import { computeNewBarValue, onHoverBarSegmentIn, onHoverBarOut, prepDataBarBlocks } from './databar.js';
/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class yzecoriolisActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["yzecoriolis", "sheet", "actor"],
      template: "systems/yzecoriolis/templates/actor/actor-sheet.html",
      width: 1000,
      height: 800,
      resizable: false,
      tabs: [{
        navSelector: ".navigation",
        contentSelector: ".sheet-panels",
        initial: "stats"
      }]
    });
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    const data = super.getData();
    data.dtypes = ["String", "Number", "Boolean"];
    if (this.actor.data.type == 'character') {
      // prepare items
      this._prepareCharacterItems(data);
      this._prepCharacterStats(data);
    }
    data.config = CONFIG.YZECORIOLIS;
    return data;
  }

  _prepCharacterStats(sheetData) {
    const actorData = sheetData.actor;
    const data = actorData.data;

    actorData.radiationBlocks = prepDataBarBlocks(data.radiation.value, data.radiation.max);
    actorData.xpBlocks = prepDataBarBlocks(data.experience.value, data.experience.max);;
    actorData.repBlocks = prepDataBarBlocks(data.reputation.value, data.reputation.max);
    actorData.hpBlocks = prepDataBarBlocks(data.hitPoints.value, data.hitPoints.max);
    actorData.mindBlocks = prepDataBarBlocks(data.mindPoints.value, data.mindPoints.max);
  }




  _prepareCharacterItems(sheetData) {
    const actorData = sheetData.actor;

    // Initialize our containers
    const gear = [];
    const armor = [];
    const talents = {};
    const weapons = [];
    const explosives = [];
    const injuries = [];
    let totalWeightPoints = 0;

    const gearDataSet = {
      "type": "gear",
      "weight": "L",
      "quantity": 1
    }

    for (let k of Object.keys(CONFIG.YZECORIOLIS.talentCategories)) {
      talents[k] = {
        "dataset": {
          "type": "talent",
          "category": k
        },
        "items": []
      };
    }

    const weaponDataSet = {
      "type": "weapon",
      "weight": "L",
    };

    const explosiveDataSet = {
      "type": "weapon",
      "weight": "L",
      "quantity": 1,
      "explosive": true,
      "blastRadius": "close",
      "blastPower": 1,
    };

    const armorDataSet = {
      "type": "armor",
      "weight": "L",
      "armorRating": 1,
      "extraFeatures": 0
    }

    const injuryDataSet = {
      "type": "injury"
    }

    for (let i of sheetData.items) {
      let item = i.data;
      i.img = i.img || DEFAULT_TOKEN;
      console.log('item img', i.img);
      // setup equipped status
      const isActive = getProperty(i.data, "equipped");
      item.toggleClass = isActive ? "equipped" : "";

      // append to gear
      if (i.type === 'gear') {
        gear.push(i);
        totalWeightPoints += CONFIG.YZECORIOLIS.gearWeightPoints[item.weight] * item.quantity;
      }
      // append to talents
      if (i.type === "talent") {
        talents[item.category].items.push(i);
      }

      // append to weapons and explosives
      if (i.type === "weapon") {
        if (item.explosive) {
          explosives.push(i);
        } else {
          weapons.push(i);
        }
        totalWeightPoints += CONFIG.YZECORIOLIS.gearWeightPoints[item.weight] * item.quantity;
      }
      if (i.type === "armor") {
        armor.push(i);
        totalWeightPoints += CONFIG.YZECORIOLIS.gearWeightPoints[item.weight]; // we assume 1 quantity.
      }
      if (i.type === "injury") {
        injuries.push(i);
      }
    }
    // assign and return
    actorData.gear = gear;
    actorData.gearDataSet = gearDataSet;

    actorData.weapons = weapons;
    actorData.weaponDataSet = weaponDataSet;

    actorData.explosives = explosives;
    actorData.explosiveDataSet = explosiveDataSet;

    actorData.armor = armor;
    actorData.armorDataSet = armorDataSet;

    actorData.talents = talents;
    actorData.encumbrance = this._computeEncumbrance(totalWeightPoints);

    actorData.injuries = injuries;
    actorData.injuryDataSet = injuryDataSet;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // hook up scalable input fields


    html.find('.expandable-info').click(event => this._onItemSummary(event));

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Add relationship
    html.find('.relationship-create').click(this._onRelationshipCreate.bind(this));

    // delete relationship
    html.find('.relationship-delete').click(this._onRelationshipDelete.bind(this));

    // Add meeting
    html.find('.meeting-create').click(this._onMeetingCreate.bind(this));

    // delete meeting
    html.find('.meeting-delete').click(this._onMeetingDelete.bind(this));

    // Add Critical Injury
    html.find('.injury-create').click(this._onCriticalInjuryCreate.bind(this));
    // Delete a Critical Injury
    html.find('.injury-delete').click(this._onCriticalInjuryDelete.bind(this));

    // databar editing
    html.find('.bar-segment').click(this._onClickBarSegment.bind(this));
    html.find('.bar-segment').mouseenter(onHoverBarSegmentIn);
    html.find('.bar').mouseleave(onHoverBarOut);

    // Update Inventory Item
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.getOwnedItem(li.data("itemId"));
      item.sheet.render(true);
    });

    // Item State Toggling
    html.find('.item-toggle').click(this._onToggleItem.bind(this));


    // update gear quantity directly from sheet.
    html.find('.gear-quantity-input').change(this._onGearQuantityChanged.bind(this));

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      this.actor.deleteOwnedItem(li.data("itemId"));
      li.slideUp(200, () => this.render(false));

      console.log("deleted?", li.data("itemId"));
    });

    // Rollable abilities.
    html.find('.rollable').click(this._onRoll.bind(this));

    // drag events for macros
    if (this.actor.owner) {
      let handler = ev => this._onDragItemStart(ev);
      html.find('li.item').each((i, li) => {
        // ignore for the header row
        if (li.classList.contains("item-header")) return;
        // add draggable attribute and drag start listener
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }
  }

  /* -------------------------------------------- */

  _computeEncumbrance(totalWeight) {
    // your max is strength * 2.
    // We are doubling that value so we can avoid having to deal with fractions
    // for smaller items.
    const strengthValue = this.actor.data.data.attributes.strength.value * 2 * 2;
    let enc = {
      max: strengthValue,
      value: totalWeight
    };
    let pct = (totalWeight / enc.max) * 100;
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
    const item = this.actor.getOwnedItem(li.data("itemId"));
    if (value < 0) {
      value = 0;
    }
    return item.update({ 'data.quantity': value });
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

  _onRelationshipCreate(event) {
    event.preventDefault();
    const person = {
      buddy: false,
      name: ''
    };
    let relationships = {};
    if (this.actor.data.data.relationships) {
      relationships = duplicate(this.actor.data.data.relationships);
    }
    let key = getID();
    relationships['r' + key] = person;
    return this.actor.update({ 'data.relationships': relationships });
  }

  async _onRelationshipDelete(event) {
    const li = $(event.currentTarget).parents(".relation");
    let relations = duplicate(this.actor.data.data.relationships);
    let targetKey = li.data("itemId");
    delete relations[targetKey];
    li.slideUp(200, () => {
      this.render(false);
    });
    this._setRelations(relations);
  }

  async _setRelations(relations) {
    await this.actor.update({ "data.relationships": null });
    await this.actor.update({ 'data.relationships': relations });
  }

  _onMeetingCreate(event) {
    event.preventDefault();
    const meeting = {
      name: '',
      concept: '',
      notes: ''
    };
    let meetings = {};
    if (this.actor.data.data.meetings) {
      meetings = duplicate(this.actor.data.data.meetings);
    }
    let key = getID();
    meetings['m' + key] = meeting;
    return this.actor.update({ 'data.meetings': meetings });
  }

  async _onMeetingDelete(event) {
    const li = $(event.currentTarget).parents(".meeting");
    let meetings = duplicate(this.actor.data.data.meetings);
    let targetKey = li.data("itemId");
    delete meetings[targetKey];
    li.slideUp(200, () => {
      this.render(false);
    });
    this._setMeetings(meetings);
  }

  async _setMeetings(meetings) {
    await this.actor.update({ "data.meetings": null });
    await this.actor.update({ 'data.meetings': meetings });
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
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;

    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      data: data
    };

    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.data["type"];

    // Finally, create the item!
    return this.actor.createOwnedItem(itemData);
  }

  _onCriticalInjuryCreate(event) {
    event.preventDefault();
    const critData = {
      name: '',
      description: ''
    }
    let injuries = {};
    if (this.actor.data.data.criticalInjuries) {
      injuries = duplicate(this.actor.data.data.criticalInjuries);
    }
    let key = getID();
    injuries['ci' + key] = critData;
    return this.actor.update({ 'data.criticalInjuries': injuries });
  }

  async _onCriticalInjuryDelete(event) {
    const li = $(event.currentTarget).parents(".injury");
    let injuries = duplicate(this.actor.data.data.criticalInjuries);
    let targetKey = li.data("itemId");
    delete injuries[targetKey];
    li.slideUp(200, () => {
      this.render(false);
    });
    this._setInjuries(injuries);
  }

  async _setInjuries(injuries) {
    await this.actor.update({ "data.criticalInjuries": null });
    await this.actor.update({ 'data.criticalInjuries': injuries });
  }


  /**
   * Handle toggling the state of an Owned Item within the Actor
   * @param {Event} event   The triggering click event
   * @private
   */
  _onToggleItem(event) {
    event.preventDefault();
    const itemId = event.currentTarget.closest(".item").dataset.itemId;
    const item = this.actor.getOwnedItem(itemId);
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
    const rollData = {
      rollType: dataset.rolltype,
      skillKey: dataset.skillkey,
      skill: dataset.skillkey ? actorData.skills[dataset.skillkey].value : 0,
      attributeKey: dataset.attributekey,
      attribute: dataset.attributekey ? actorData.attributes[dataset.attributekey].value : 0,
      modifier: 0,
      bonus: dataset.bonus ? Number(dataset.bonus) : 0,
      rollTitle: dataset.label,
      pushed: false,
      actor: this.actor
    }
    const chatOptions = this.actor._prepareChatRollOptions('systems/yzecoriolis/templates/sidebar/roll.html', dataset.rolltype);
    coriolisModifierDialog((modifier) => {
      rollData.modifier = modifier;
      coriolisRoll(chatOptions, rollData);
    });
  }

  /**
   * Handle showing an item's description in the character sheet as an easy fold out.
   * @private
   */
  _onItemSummary(event) {
    event.preventDefault();
    let li = $(event.currentTarget).parents(".item");
    let item = this.actor.getOwnedItem(li.data("item-id"));
    let chatData = item.getChatData({ secrets: this.actor.owner });
    console.log("item summary clicked");
    // Toggle summary
    if (li.hasClass("expanded")) {
      let summary = li.children(".item-summary");
      summary.slideUp(200, () => { summary.remove() });
    } else {
      let div = $(`<div class="item-summary"><div class="item-summary-wrapper"><div>${chatData.description}</div></div></div>`);
      let props = $(`<div class="item-properties"></div>`);
      chatData.properties.forEach(p => props.append(`<span class="tag">${p}</span>`));

      $(div).find(".item-summary-wrapper").append(props);
      // div.append(props);
      li.append(div.hide());
      div.slideDown(200);
    }
    li.toggleClass("expanded");
  }

}