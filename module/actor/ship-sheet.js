import { computeNewBarValue, onHoverBarSegmentIn, onHoverBarOut, prepDataBarBlocks } from "./databar.js";

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
            tabs: [{
                navSelector: ".navigation",
                contentSelector: ".sheet-panels",
                initial: "crew"
            }]
        });
    }

    getData() {
        const data = super.getData();
        if (this.actor.data.type === 'ship') {
            this._prepShipStats(data);
        }
        data.config = CONFIG.YZECORIOLIS;
        return data;
    }

    _prepShipStats(sheetData) {
        const actorData = sheetData.actor;
        const data = actorData.data;
        console.log('data', actorData);
        actorData.hullBlocks = prepDataBarBlocks(data.hullPoints.value, data.hullPoints.max);
        actorData.energyBlocks = prepDataBarBlocks(data.energyPoints.value, data.energyPoints.max);
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        // Everything below here is only needed if the sheet is editable
        if (!this.options.editable) return;


        // databar editing
        html.find('.bar-segment').click(this._onClickBarSegment.bind(this));
        html.find('.bar-segment').mouseenter(onHoverBarSegmentIn);
        html.find('.bar').mouseleave(onHoverBarOut);
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
}