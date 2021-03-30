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
    if (!this.data.img) this.data.img = this._getDefaultToken();
    super.prepareData();

    // Get the Item's data
    const itemData = this.data;
    const actorData = this.actor ? this.actor.data : {};
    const data = itemData.data;
    if (itemData.type === "talent") this._prepareTalentData(itemData);
  }

  _prepareTalentData(itemData) {}

  async roll() {
    //TODO: Should refactor this a bit so both sheet and macros share the same
    //code path.
    const token = this.actor.token;
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
      actor: this.actor,
    };
    const chatOptions = this.actor._prepareChatRollOptions(
      "systems/yzecoriolis/templates/sidebar/roll.html",
      rollType
    );
    coriolisModifierDialog((modifier) => {
      rollData.modifier = modifier;
      coriolisRoll(chatOptions, rollData);
    });
  }

  getChatData(htmlOptions) {
    const data = duplicate(this.data.data);
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

  _getDefaultToken() {
    let itemType = this.data.type;
    let isExplosive = this.data.data.explosive;
    let tokenPath = DEFAULT_TOKEN;
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
    }
    return tokenPath;
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
