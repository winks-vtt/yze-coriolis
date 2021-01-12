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
    // Basic template rendering data
    const token = this.actor.token;
    const item = this.data;
    const actorData = this.actor ? this.actor.data.data : {};
    const itemData = item.data;

    //TODO: handle the different item types here.
    // Define the roll formula.
    let roll = new Roll("d20+@abilities.str.mod", actorData);
    let label = `Rolling ${item.name}`;
    // Roll and send to chat.
    roll.roll().toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: label,
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
    }
    return tokenPath;
  }
}
