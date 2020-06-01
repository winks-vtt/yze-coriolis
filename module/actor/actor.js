/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class yzecoriolisActor extends Actor {

  /**
   * Augment the basic actor data with additional dynamic data.
   */
  prepareData() {
    super.prepareData();

    const actorData = this.data;
    const data = actorData.data;
    const flags = actorData.flags;

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    if (actorData.type === 'character') this._prepareCharacterData(actorData);
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    const data = actorData.data;
    // Cap attribute scores
    for (let [key, attr] of Object.entries(data.attributes)) {
      if (attr.value > attr.max) {
        attr.value = attr.max;
      }
      if (attr.value < attr.min) {
        attr.value = attr.min;
      }
    }

    //Cap Skill scores
    for (let [key, skl] of Object.entries(data.skills)) {
      if (skl.value > skl.max) {
        skl.value = skl.max;
      }
      if (skl.value < skl.min) {
        skl.value = skl.min;
      }
    }

    data.hitPoints.max = data.attributes.strength.value + data.attributes.agility.value;
    data.mindPoints.max = data.attributes.wits.value + data.attributes.empathy.value;

    if (data.hitPoints.value > data.hitPoints.max) {
      data.hitPoints.value = data.hitPoints.max;
    }
    if (data.mindPoints.value > data.mindPoints.max) {
      data.mindPoints.value = data.mindPoints.max;
    }
  }
}