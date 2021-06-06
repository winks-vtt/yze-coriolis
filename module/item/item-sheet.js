import { getID } from "../util.js";
/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class yzecoriolisItemSheet extends ItemSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["yzecoriolis", "sheet", "item"],
      width: 770,
      height: 770,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "description",
        },
      ],
    });
  }

  /** @override */
  get template() {
    const path = "systems/yzecoriolis/templates/item";
    // Return a single sheet for all item types.
    //return `${path}/item-sheet.html`;
    // Alternatively, you could use the following return statement to do a
    // unique item sheet by type, like `weapon-sheet.html`.

    return `${path}/${this.item.data.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData(options) {
    const baseData = super.getData(options);
    // baseData.config = CONFIG.YZECORIOLIS;
    const sheetData = {
      editable: baseData.editable,
      owner: baseData.item.isOwner,
      config: CONFIG.YZECORIOLIS,
      ...baseData.item.data,
    };
    return sheetData;
  }

  /* -------------------------------------------- */

  /** @override */
  setPosition(options = {}) {
    const position = super.setPosition(options);
    const sheetBody = this.element.find(".sheet-body");
    const bodyHeight = position.height - 192;
    sheetBody.css("height", bodyHeight);
    return position;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Roll handlers, click handlers, etc. would go here.
    // Add Inventory Item
    html.find(".feature-create").click(this._onFeatureCreate.bind(this));

    // // Delete Inventory Item
    html.find(".feature-delete").click(this._onFeatureDelete.bind(this));
  }

  _onFeatureCreate(event) {
    event.preventDefault();
    const name = "";
    let features = {};
    if (this.object.data.data.special) {
      features = duplicate(this.object.data.data.special);
    }
    let key = getID();
    features["si" + key] = name;
    return this.object.update({ "data.special": features });
  }

  _onFeatureDelete(event) {
    const li = $(event.currentTarget).parents(".special-feature");
    let features = duplicate(this.object.data.data.special);
    let targetKey = li.data("itemId");
    delete features[targetKey];
    li.slideUp(200, () => {
      this.render(false);
    });
    this._setSpecialFeatures(features);
  }

  async _setSpecialFeatures(features) {
    await this.object.update({ "data.special": null });
    await this.object.update({ "data.special": features });
  }
}
