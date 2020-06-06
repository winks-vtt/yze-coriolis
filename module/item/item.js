/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class yzecoriolisItem extends Item {
  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    super.prepareData();

    // Get the Item's data
    const itemData = this.data;
    const actorData = this.actor ? this.actor.data : {};
    const data = itemData.data;

    if (itemData.type === 'character') this._prepareItemData(itemData);
  }

  _prepareItemData(itemData) {
    // prep item data?
  }

  async roll() {
    // Basic template rendering data
    const token = this.actor.token;
    const item = this.data;
    const actorData = this.actor ? this.actor.data.data : {};
    const itemData = item.data;

    //TODO: handle the different item types here.
    // Define the roll formula.
    let roll = new Roll('d20+@abilities.str.mod', actorData);
    let label = `Rolling ${item.name}`;
    // Roll and send to chat.
    roll.roll().toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: label
    });
  }

  getChatData(htmlOptions) {
    const data = duplicate(this.data.data);
    const labels = this.labels;
    console.log('data', data);
    // Rich text description
    data.description = TextEditor.enrichHTML(data.description, htmlOptions);
    console.log('data after ', data);

    // Item type specific properties
    const props = [];
    const fn = this[`_${this.data.type}ChatData`];
    if (fn) fn.bind(this)(data, labels, props);


    //TODO: toggle equipped status for normal items.


    // Filter properties and return
    data.properties = props.filter(p => !!p);
    console.log('data finished ', data);
    return data;

  }
}
