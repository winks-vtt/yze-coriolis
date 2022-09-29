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

    const actorData = this;

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    if (actorData.type === "character")
      this._prepareCharacterData(actorData, true);
    if (actorData.type === "npc") this._prepareCharacterData(actorData, false);
  }

  async _preCreate(initData, options, user) {
    await super._preCreate(initData, options, user);
    //setup default images for ships
    if (
      initData.type === "ship" &&
      hasProperty(initData, "img") &&
      initData.img === Actor.DEFAULT_ICON
    ) {
      this.updateSource({ img: CONFIG.YZECORIOLIS.DEFAULT_SHIP_KEY_ART });
    }

    // we check the incoming data to make sure we aren't overriding a 'cloning'
    // operation.
    if (
      !hasProperty(initData, "system.keyArt") &&
      (initData.type === "character" || initData.type === "npc")
    ) {
      this.updateSource({
        "system.keyArt": CONFIG.YZECORIOLIS.DEFAULT_PLAYER_KEY_ART,
      });
    }
    // if we have a blank string keyArt prop, just set it to the default.
    if (
      hasProperty(initData, "system.keyArt") &&
      (initData.type === "character" || initData.type === "npc") &&
      initData.system.keyArt === ""
    ) {
      this.updateSource({
        "system.keyArt": CONFIG.YZECORIOLIS.DEFAULT_PLAYER_KEY_ART,
      });
    }
  }

  async _onCreate(data, ...args) {
    await super._onCreate(data, ...args);
  }

  async _preUpdate(updateData, options, user) {
    await super._preUpdate(updateData, options, user);
  }
  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData, capCharPoints) {
    const sysData = actorData.system;

    if (capCharPoints) {
      // Cap attribute scores
      Object.keys(sysData.attributes).forEach((k) => {
        let attr = sysData.attributes[k];
        if (attr.value > attr.max) {
          attr.value = attr.max;
        }
        if (attr.value < attr.min) {
          attr.value = attr.min;
        }
      });

      //Cap Skill scores
      Object.keys(sysData.skills).forEach((k) => {
        let skl = sysData.skills[k];
        if (skl.value > skl.max) {
          skl.value = skl.max;
        }
        if (skl.value < skl.min) {
          skl.value = skl.min;
        }
      });
    }

    let hpBonuses = this._prepHPBonuses();
    let mpBonuses = this._prepMPBonuses();
    sysData.hitPoints.max =
      sysData.attributes.strength.value +
      sysData.attributes.agility.value +
      hpBonuses;
    sysData.mindPoints.max =
      sysData.attributes.wits.value +
      sysData.attributes.empathy.value +
      mpBonuses;

    if (sysData.hitPoints.value > sysData.hitPoints.max) {
      sysData.hitPoints.value = sysData.hitPoints.max;
    }
    if (sysData.mindPoints.value > sysData.mindPoints.max) {
      sysData.mindPoints.value = sysData.mindPoints.max;
    }
  }

  _prepareChatRollOptions(template, title) {
    let chatOptions = {
      speaker: {
        alias: this.prototypeToken.name,
        actor: this._id,
      },
      title: title,
      template: template,
      rollMode: game.settings.get("core", "rollMode"),
      sound: CONFIG.sounds.dice,
      flags: {
        img: this.prototypeToken.randomImg ? this.img : this.prototypeToken.img,
      },
      // img to be displayed next to the name on the test card - if it's a wildcard img, use the actor image
    };

    // If the test is coming from a token sheet
    if (this.token) {
      chatOptions.speaker.alias = this.prototypeToken.name; // Use the token name instead of the actor name
      chatOptions.speaker.token = this.prototypeToken._id;
      chatOptions.speaker.scene = canvas.scene._id;
      chatOptions.flags.img = this.prototypeToken.img; // Use the token image instead of the actor image
    } // If a linked actor - use the currently selected token's data if the actor id matches
    else {
      let speaker = ChatMessage.getSpeaker();
      if (speaker.actor == this._id) {
        chatOptions.speaker.alias = speaker.alias;
        chatOptions.speaker.token = speaker.token;
        chatOptions.speaker.scene = speaker.scene;
        chatOptions.flags.img = speaker.token
          ? canvas.tokens.get(speaker.token).img
          : chatOptions.flags.img;
      }
    }

    return chatOptions;
  }

  _prepHPBonuses() {
    // look through talents for any HPBonuses
    let bonus = 0;
    for (let t of this.items) {
      if (t.type !== "talent") {
        continue;
      }
      const tData = t.system;
      bonus += Number(tData.hpBonus);
    }
    return bonus;
  }

  _prepMPBonuses() {
    // look through talents for any MPBonuses
    let bonus = 0;
    for (let t of this.items) {
      if (t.type !== "talent") {
        continue;
      }
      const tData = t.system;
      bonus += Number(tData.mpBonus);
    }
    return bonus;
  }

  /** @override */
  static async create(initData, options = {}) {
    initData.prototypeToken = initData.prototypeToken || {};
    if (initData.type === "character" || initData.type === "npc") {
      foundry.utils.mergeObject(
        initData.prototypeToken,
        {
          actorLink: true,
        },
        { overwrite: false }
      );
    }
    return super.create(initData, options);
  }
}
