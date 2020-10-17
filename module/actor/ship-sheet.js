/**
* Extend the basic ActorSheet for a basic Coriolis ship sheet
 * @extends {ActorSheet}
 */
export class yzecoriolisShipSheet extends ActorSheet {

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["yzecoriolis", "sheet", "actor"],
            template: "systems/yzecoriolis/templates/actor/ship-sheet.html",
            width: 1200,
            height: 828,
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
        data.config = CONFIG.YZECORIOLIS;
        return data;
    }
}