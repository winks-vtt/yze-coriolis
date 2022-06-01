import { coriolisRoll, coriolisModifierDialog } from "../coriolis-roll.js";
/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class yzecoriolisItem extends Item {
  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    // setup a token before calling prepare because the token is also setup
    // lazily inside.
    super.prepareData();

    // Get the Item's data
    const itemData = this.data;
    if (itemData.type === "talent") this._prepareTalentData(itemData);
  }

  // eslint-disable-next-line no-unused-vars
  _prepareTalentData(itemData) {
    // TODO: prep talent data
  }

  async _preCreate(data, options, user) {
    await super._preCreate(data, options, user);
    // for cloning operations just keep the image.
    if (hasProperty(data, "img") && data.img !== null) {
      return;
    }
    let itemType = data.type;
    let isExplosive = this.data.data.explosive;
    const tokenPath = getDefaultItemIcon(itemType, isExplosive);
    this.data.update({ img: tokenPath });
  }

  async roll() {
    //TODO: Should refactor this a bit so both sheet and macros share the same
    //code path.
    const item = this.data;
    const actorData = this.actor ? this.actor.data.data : {};
    const itemData = item.data;
    const skillKey = getSkillKeyForWeaponType(itemData.melee);
    const attributeKey = getAttributeKeyForWeaponType(itemData.melee);
    const rollType = getRollType(item.type);
    let bonus = itemData.bonus ? Number(itemData.bonus) : 0;
    if (rollType === "armor") {
      bonus = itemData.armorRating;
    }
    const rollData = {
      rollType: rollType,
      skillKey: skillKey,
      skill: skillKey ? actorData.skills[skillKey].value : 0,
      attributeKey: attributeKey,
      attribute: attributeKey ? actorData.attributes[attributeKey].value : 0,
      modifier: 0,
      bonus: bonus,
      rollTitle: item.name,
      pushed: false,
    };
    const chatOptions = this.actor._prepareChatRollOptions(
      "systems/yzecoriolis/templates/sidebar/roll.html",
      rollType
    );
    coriolisModifierDialog((modifier, additionalData) => {
      rollData.modifier = modifier;
      rollData.additionalData = additionalData;
      coriolisRoll(chatOptions, rollData);
    }, itemData.automatic);
  }

  getChatData(htmlOptions) {
    const data = foundry.utils.deepClone(this.data.data);
    const labels = this.labels;
    // Rich text description
    data.description = TextEditor.enrichHTML(data.description, htmlOptions);

    // Item type specific properties
    const props = [];
    const fn = this[`_${this.data.type}ChatData`];
    if (fn) fn.bind(this)(data, labels, props);

    //TODO: toggle equipped status for normal items.

    // Filter properties and return
    data.properties = props.filter((p) => !!p);
    return data;
  }

  async sendToChat() {
    const imgPath = this.data.img
      ? this.data.img
      : getDefaultItemIcon(this.type, this.data.data.explosive);
    const templateData = {
      item: foundry.utils.deepClone(this.data),
      icon: imgPath,
    };
    const html = await renderTemplate(
      `systems/yzecoriolis/templates/sidebar/item.html`,
      templateData
    );
    const msg = {
      content: html,
    };
    ChatMessage.create(msg, false);
  }

  _weaponChatData(data, labels, props) {
    for (let p of Object.values(this.data.data.special)) {
      props.push(p);
    }
  }

  _armorChatData(data, labels, props) {
    for (let p of Object.values(this.data.data.special)) {
      props.push(p);
    }
  }

  /**
   * Foundry doesn't have a built-in way to hide certain item types. This is a
   * work around.
   * @override
   */
  static async createDialog(data, options) {
    const hiddenItems = ["energyPointToken", "item"];
    const original = game.system.documentTypes.Item;
    game.system.documentTypes.Item = original.filter(
      (itemType) => !hiddenItems.includes(itemType)
    );
    const newItem = super.createDialog(data, options);
    game.system.documentTypes.Item = original;
    return newItem;
  }
}

export const getSkillKeyForWeaponType = (isMelee) => {
  if (isMelee) {
    return "meleecombat";
  } else {
    return "rangedcombat";
  }
};

export const getAttributeKeyForWeaponType = (isMelee) => {
  if (isMelee) {
    return "strength";
  } else {
    return "agility";
  }
};

export const getRollType = (itemType) => {
  if (itemType === "weapon") {
    return "weapon";
  } else if (itemType === "armor") {
    return "armor";
  }
  return "weapon";
};

export const getDefaultItemIcon = (itemType, isExplosive) => {
  let tokenPath = CONST.DEFAULT_TOKEN;
  switch (itemType) {
    case "weapon":
      tokenPath = "systems/yzecoriolis/css/icons/weapons-icon.svg";
      if (isExplosive) {
        tokenPath = "systems/yzecoriolis/css/icons/explosion-icon.svg";
      }
      break;
    case "armor":
      tokenPath = "systems/yzecoriolis/css/icons/armor-icon.svg";
      break;
    case "gear":
      tokenPath = "systems/yzecoriolis/css/icons/gear-icon.svg";
      break;
    case "talent":
      tokenPath = "systems/yzecoriolis/css/icons/talent-icon.svg";
      break;
    case "injury":
      tokenPath = "systems/yzecoriolis/css/icons/injury-icon.svg";
      break;
  }
  return tokenPath;
};
