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

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    if (actorData.type === "character")
      this._prepareCharacterData(actorData, true);
    if (actorData.type === "npc") this._prepareCharacterData(actorData, false);
  }

  async _preCreate(data, options, user) {
    await super._preCreate(data, options, user);
    //setup default images
    if (data.type === "ship") {
      this.data.update({ img: CONFIG.YZECORIOLIS.DEFAULT_SHIP_KEY_ART });
    }
    if (data.type === "character" || data.type === "npc") {
      this.data.update({
        "data.keyArt": CONFIG.YZECORIOLIS.DEFAULT_PLAYER_KEY_ART,
      });
    }
  }
  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData, capCharPoints) {
    const data = actorData.data;

    if (capCharPoints) {
      // Cap attribute scores
      Object.keys(data.attributes).forEach((k) => {
        let attr = data.attributes[k];
        if (attr.value > attr.max) {
          attr.value = attr.max;
        }
        if (attr.value < attr.min) {
          attr.value = attr.min;
        }
      });

      //Cap Skill scores
      Object.keys(data.skills).forEach((k) => {
        let skl = data.skills[k];
        if (skl.value > skl.max) {
          skl.value = skl.max;
        }
        if (skl.value < skl.min) {
          skl.value = skl.min;
        }
      });
    }

    let hpBonuses = this._prepHPBonuses();
    data.hitPoints.max =
      data.attributes.strength.value +
      data.attributes.agility.value +
      hpBonuses;
    data.mindPoints.max =
      data.attributes.wits.value + data.attributes.empathy.value;

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
      flags: {
        img: this.data.token.randomImg ? this.data.img : this.data.token.img,
      },
      // img to be displayed next to the name on the test card - if it's a wildcard img, use the actor image
    };

    // If the test is coming from a token sheet
    if (this.token) {
      chatOptions.speaker.alias = this.token.data.name; // Use the token name instead of the actor name
      chatOptions.speaker.token = this.token.data._id;
      chatOptions.speaker.scene = canvas.scene._id;
      chatOptions.flags.img = this.token.data.img; // Use the token image instead of the actor image
    } // If a linked actor - use the currently selected token's data if the actor id matches
    else {
      let speaker = ChatMessage.getSpeaker();
      if (speaker.actor == this.data._id) {
        chatOptions.speaker.alias = speaker.alias;
        chatOptions.speaker.token = speaker.token;
        chatOptions.speaker.scene = speaker.scene;
        chatOptions.flags.img = speaker.token
          ? canvas.tokens.get(speaker.token).data.img
          : chatOptions.flags.img;
      }
    }

    return chatOptions;
  }

  _prepHPBonuses() {
    // look through talents for any HPBonuses
    let bonus = 0;
    for (let t of this.data.items) {
      if (t.type !== "talent") {
        continue;
      }
      const tData = t.data;
      bonus += Number(tData.hpBonus);
    }
    return bonus;
  }

  /** @override */
  static async create(data, options = {}) {
    data.token = data.token || {};
    if (data.type === "character" || data.type === "npc") {
      mergeObject(
        data.token,
        {
          vision: true,
          dimSight: 30,
          brightSight: 0,
          actorLink: true,
          disposition: 1,
        },
        { overwrite: false }
      );
    }
    return super.create(data, options);
  }
}
