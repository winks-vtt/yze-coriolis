import { getID } from '../util.js';
import { ChatMessageYZECoriolis } from '../sidebar/chatmessage.js';
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
      width: 930,
      height: 770,
      tabs: [{
        navSelector: ".sheet-tabs",
        contentSelector: ".sheet-body",
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
    }
    data.config = CONFIG.YZECORIOLIS;
    return data;
  }

  _prepareCharacterItems(sheetData) {
    const actorData = sheetData.actor;

    // Initialize our containers
    const gear = {};
    const armor = [];
    const talents = {};
    const weapons = [];
    const explosives = [];
    let totalWeightPoints = 0;

    for (let k of Object.keys(CONFIG.YZECORIOLIS.gearWeights)) {
      gear[k] = {
        "dataset": {
          "type": "gear",
          "weight": k,
          "quantity": 1
        },
        "items": []
      }
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

    for (let i of sheetData.items) {
      let item = i.data;
      i.img = i.img || DEFAULT_TOKEN;
      // append to gear
      if (i.type === 'gear') {
        gear[item.weight].items.push(i);
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
    }
    // assign and return
    actorData.gear = gear;

    actorData.weapons = weapons;
    actorData.weaponDataSet = weaponDataSet;

    actorData.explosives = explosives;
    actorData.explosiveDataSet = explosiveDataSet;

    actorData.armor = armor;
    actorData.armorDataSet = armorDataSet;

    actorData.talents = talents;
    actorData.encumbrance = this._computeEncumbrance(totalWeightPoints);
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    html.find('.item .item-name h4').click(event => this._onItemSummary(event));

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

    // Update Inventory Item
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.getOwnedItem(li.data("itemId"));
      item.sheet.render(true);
    });

    // update gear quantity directly from sheet.
    html.find('.gear-quantity-input').change(this._onGearQuantityChanged.bind(this));

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      this.actor.deleteOwnedItem(li.data("itemId"));
      li.slideUp(200, () => this.render(false));
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
    let enc = {
      max: 20,
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

  _onRelationshipCreate(event) {
    event.preventDefault();
    const person = {
      buddy: false,
      name: 'placeholder'
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
    console.log('dataset', data);
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
    const name = '';
    let injuries = {};
    if (this.actor.data.data.criticalInjuries) {
      injuries = duplicate(this.actor.data.data.criticalInjuries);
    }
    let key = getID();
    injuries['ci' + key] = name;
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
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    const actorData = this.actor.data.data;
    if (dataset.roll && this._isValidRoll(dataset.rolltype, actorData, dataset)) {
      let roll = new Roll(dataset.roll, actorData);
      let label = dataset.label ? `${dataset.label} Roll` : '';
      try {
        roll.roll();
        this._displayRoll(roll, label);
      } catch (err) {
        ui.notifications.error(err);
        throw new Error(err);
      }
    } else {
      ui.notifications.error(new Error(game.i18n.localize('YZECORIOLIS.ErrorsInvalidSkillRoll')));
    }
  }

  /**
   * Returns true/false if roll they are attempting makes any sense. This isn't enforcing game rules.
   * This is enforcing input validation so the Roll API doesn't error.
   * This makes sure the rollType we are attempting has the valid data to make the roll.
   * @param  {} attribute numeric value of the attribute we are testing
   * @param  {} skill numeric value of the skilll we are testing
   */
  _isValidRoll(rollType, actorData, dataset) {
    let attributeValue = 0;
    let skillValue = 0;
    switch (rollType) {
      case 'skill':
        attributeValue = actorData.attributes[dataset.attributekey].value;
        skillValue = actorData.skills[dataset.skillkey].value;
        return attributeValue + skillValue > 0;
      case 'attribute':
        attributeValue = actorData.attributes[dataset.attributekey].value;
        return attributeValue > 0;

    }
    return false;
  }
  /**
   * @param  {} roll roll object
   */
  _displayRoll(roll, label) {
    let chatData = {}
    chatData.speaker = ChatMessage.getSpeaker({
      actor: this.actor
    });
    chatData.flavor = label;
    chatData.user = game.user._id;
    chatData.type = CONST.CHAT_MESSAGE_TYPES.ROLL;
    chatData.roll = roll;
    ChatMessageYZECoriolis.create(chatData, {});
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

    // Toggle summary
    if (li.hasClass("expanded")) {
      let summary = li.children(".item-summary");
      summary.slideUp(200, () => summary.remove());
    } else {
      let div = $(`<div class="item-summary">${chatData.description}</div>`);
      let props = $(`<div class="item-properties"></div>`);
      chatData.properties.forEach(p => props.append(`<span class="tag">${p}</span>`));
      div.append(props);
      li.append(div.hide());
      div.slideDown(200);
    }
    li.toggleClass("expanded");
  }

}