
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
    if (!data.keyArt) {
      data.keyArt = data.keyArt || CONFIG.YZECORIOLIS.DEFAULT_PLAYER_KEY_ART;
    }


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

    let hpBonuses = this._prepHPBonuses(data);
    data.hitPoints.max = data.attributes.strength.value + data.attributes.agility.value + hpBonuses;
    data.mindPoints.max = data.attributes.wits.value + data.attributes.empathy.value;

    if (data.hitPoints.value > data.hitPoints.max) {
      data.hitPoints.value = data.hitPoints.max;
    }
    if (data.mindPoints.value > data.mindPoints.max) {
      data.mindPoints.value = data.mindPoints.max;
    }
  }

  _prepareChatRollOptions(template, title) {
    let chatOptions = {
      speaker: {
        alias: this.data.token.name,
        actor: this.data._id,
      },
      title: title,
      template: template,
      rollMode: game.settings.get("core", "rollMode"),
      sound: CONFIG.sounds.dice,
      flags: { img: this.data.token.randomImg ? this.data.img : this.data.token.img }
      // img to be displayed next to the name on the test card - if it's a wildcard img, use the actor image
    }

    // If the test is coming from a token sheet
    if (this.token) {
      chatOptions.speaker.alias = this.token.data.name; // Use the token name instead of the actor name
      chatOptions.speaker.token = this.token.data._id;
      chatOptions.speaker.scene = canvas.scene._id
      chatOptions.flags.img = this.token.data.img; // Use the token image instead of the actor image
    }
    else // If a linked actor - use the currently selected token's data if the actor id matches
    {
      let speaker = ChatMessage.getSpeaker()
      if (speaker.actor == this.data._id) {
        chatOptions.speaker.alias = speaker.alias
        chatOptions.speaker.token = speaker.token
        chatOptions.speaker.scene = speaker.scene
        chatOptions.flags.img = speaker.token ? canvas.tokens.get(speaker.token).data.img : chatOptions.flags.img
      }
    }

    return chatOptions
  }

  _prepareRollTitle(rollType) {

  }

  _prepHPBonuses(data) {
    // look through talents for any HPBonuses
    let bonus = 0;
    for (let t of this.data.items) {
      if (t.type !== 'talent') {
        continue
      }
      const tData = t.data;
      bonus += tData.hpBonus
    }
    return bonus;
  }
}