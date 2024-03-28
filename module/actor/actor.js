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
      ((hasProperty(initData, "img") && initData.img === Actor.DEFAULT_ICON) ||
        !hasProperty(initData, "img"))
    ) {
      this.updateSource({ img: CONFIG.YZECORIOLIS.DEFAULT_SHIP_KEY_ART });
    }

    // we check the incoming data to make sure we aren't overriding a 'cloning'
    // operation.
    if (
      !hasProperty(initData, "img") &&
      (initData.type === "character" || initData.type === "npc")
    ) {
      this.updateSource({
        img: CONFIG.YZECORIOLIS.DEFAULT_PLAYER_KEY_ART,
        prototypeToken: {
          texture: {
            src: CONFIG.YZECORIOLIS.DEFAULT_PLAYER_KEY_ART_TOKEN,
          },
        },
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

    let hpModifcations = this._prepHPModifications();
    let mpModifcations = this._prepMPModifications();
    let radiationModifcations = this._prepRadiationModifications();
    let encumbranceModifcations = this._prepEncumbranceModifications();
    let movementRateModifcations = this._prepMovementRateModifications();
    sysData.hitPoints.max = sysData.attributes.strength.value
      + sysData.attributes.agility.value
      + hpModifcations;
    sysData.mindPoints.max = sysData.attributes.wits.value
      + sysData.attributes.empathy.value
      + mpModifcations;
    sysData.radiation.max = sysData.radiation.max
      + radiationModifcations;
    sysData.movementRateMods = movementRateModifcations;
    sysData.encumbranceMods = encumbranceModifcations;

    if (sysData.hitPoints.value > sysData.hitPoints.max) {
      sysData.hitPoints.value = sysData.hitPoints.max;
    }
    if (sysData.mindPoints.value > sysData.mindPoints.max) {
      sysData.mindPoints.value = sysData.mindPoints.max;
    }

    // get the different modifiers and sort them into their attributes/skills
    sysData.itemModifiers = {
      strength: {},
      agility: {},
      wits: {},
      empathy: {},
      dexterity: {},
      force: {},
      infiltration: {},
      manipulation: {},
      meleeCombat: {},
      observation: {},
      rangedCombat: {},
      survival: {},
      command: {},
      culture: {},
      dataDjinn: {},
      medicurgy: {},
      mysticPowers: {},
      pilot: {},
      science: {},
      technology: {},
      armor: {},
    };
    for (let item of this.items) {
      for (let key in item.system.itemModifiers) {
        // everything with the strength-attribute
        if (item.system.itemModifiers[key].mod === "itemModifierAttrStrength") {
          sysData.itemModifiers.strength[key] = {
            id: key,
            name: item.name,
            attribute: game.i18n.localize("YZECORIOLIS.AttrStrength"),
            skill: null,
            type: game.i18n.localize(CONFIG.YZECORIOLIS.itemTypes[item.type]),
            value: item.system.itemModifiers[key].value,
            checked: false
          };
          sysData.itemModifiers.force[key] = {
            id: key,
            name: item.name,
            attribute: game.i18n.localize("YZECORIOLIS.AttrStrength"),
            skill: null,
            type: game.i18n.localize(CONFIG.YZECORIOLIS.itemTypes[item.type]),
            value: item.system.itemModifiers[key].value,
            checked: false
          };
          sysData.itemModifiers.meleeCombat[key] = {
            id: key,
            name: item.name,
            attribute: game.i18n.localize("YZECORIOLIS.AttrStrength"),
            skill: null,
            type: game.i18n.localize(CONFIG.YZECORIOLIS.itemTypes[item.type]),
            value: item.system.itemModifiers[key].value,
            checked: false
          };
        }
        if (item.system.itemModifiers[key].mod === "itemModifierSkillForce") {
          sysData.itemModifiers.force[key] = {
            id: key,
            name: item.name,
            attribute: game.i18n.localize("YZECORIOLIS.AttrStrength"),
            skill: game.i18n.localize("YZECORIOLIS.SkillForce"),
            type: game.i18n.localize(CONFIG.YZECORIOLIS.itemTypes[item.type]),
            value: item.system.itemModifiers[key].value,
            checked: false
          };
        }
        if (item.system.itemModifiers[key].mod === "itemModifierSkillMelee") {
          sysData.itemModifiers.meleeCombat[key] = {
            id: key,
            name: item.name,
            attribute: game.i18n.localize("YZECORIOLIS.AttrStrength"),
            skill: game.i18n.localize("YZECORIOLIS.SkillMeleeCombat"),
            type: game.i18n.localize(CONFIG.YZECORIOLIS.itemTypes[item.type]),
            value: item.system.itemModifiers[key].value,
            checked: false
          };
        }
        // everything with the agility-attribute
        if (item.system.itemModifiers[key].mod === "itemModifierAttrAgility") {
          sysData.itemModifiers.agility[key] = {
            id: key,
            name: item.name,
            attribute: game.i18n.localize("YZECORIOLIS.AttrAgility"),
            skill: null,
            type: game.i18n.localize(CONFIG.YZECORIOLIS.itemTypes[item.type]),
            value: item.system.itemModifiers[key].value,
            checked: false
          };
          sysData.itemModifiers.dexterity[key] = {
            id: key,
            name: item.name,
            attribute: game.i18n.localize("YZECORIOLIS.AttrAgility"),
            skill: null,
            type: game.i18n.localize(CONFIG.YZECORIOLIS.itemTypes[item.type]),
            value: item.system.itemModifiers[key].value,
            checked: false
          };
          sysData.itemModifiers.infiltration[key] = {
            id: key,
            name: item.name,
            attribute: game.i18n.localize("YZECORIOLIS.AttrAgility"),
            skill: null,
            type: game.i18n.localize(CONFIG.YZECORIOLIS.itemTypes[item.type]),
            value: item.system.itemModifiers[key].value,
            checked: false
          };
          sysData.itemModifiers.rangedCombat[key] = {
            id: key,
            name: item.name,
            attribute: game.i18n.localize("YZECORIOLIS.AttrAgility"),
            skill: null,
            type: game.i18n.localize(CONFIG.YZECORIOLIS.itemTypes[item.type]),
            value: item.system.itemModifiers[key].value,
            checked: false
          };
          sysData.itemModifiers.pilot[key] = {
            id: key,
            name: item.name,
            attribute: game.i18n.localize("YZECORIOLIS.AttrAgility"),
            skill: null,
            type: game.i18n.localize(CONFIG.YZECORIOLIS.itemTypes[item.type]),
            value: item.system.itemModifiers[key].value,
            checked: false
          };
        }
        if (item.system.itemModifiers[key].mod === "itemModifierSkillDex") {
          sysData.itemModifiers.dexterity[key] = {
            id: key,
            name: item.name,
            attribute: game.i18n.localize("YZECORIOLIS.AttrAgility"),
            skill: game.i18n.localize("YZECORIOLIS.SkillDexterity"),
            type: game.i18n.localize(CONFIG.YZECORIOLIS.itemTypes[item.type]),
            value: item.system.itemModifiers[key].value,
            checked: false
          };
        }
        if (item.system.itemModifiers[key].mod === "itemModifierSkillInf") {
          sysData.itemModifiers.infiltration[key] = {
            id: key,
            name: item.name,
            attribute: game.i18n.localize("YZECORIOLIS.AttrAgility"),
            skill: game.i18n.localize("YZECORIOLIS.SkillInfiltration"),
            type: game.i18n.localize(CONFIG.YZECORIOLIS.itemTypes[item.type]),
            value: item.system.itemModifiers[key].value,
            checked: false
          };
        }
        if (item.system.itemModifiers[key].mod === "itemModifierSkillRange") {
          sysData.itemModifiers.rangedCombat[key] = {
            id: key,
            name: item.name,
            attribute: game.i18n.localize("YZECORIOLIS.AttrAgility"),
            skill: game.i18n.localize("YZECORIOLIS.SkillRangedCombat"),
            type: game.i18n.localize(CONFIG.YZECORIOLIS.itemTypes[item.type]),
            value: item.system.itemModifiers[key].value,
            checked: false
          };
        }
        if (item.system.itemModifiers[key].mod === "itemModifierSkillPil") {
          sysData.itemModifiers.pilot[key] = {
            id: key,
            name: item.name,
            attribute: game.i18n.localize("YZECORIOLIS.AttrAgility"),
            skill: game.i18n.localize("YZECORIOLIS.SkillPilot"),
            type: game.i18n.localize(CONFIG.YZECORIOLIS.itemTypes[item.type]),
            value: item.system.itemModifiers[key].value,
            checked: false
          };
        }
        // everything with the wits-attribute
        if (item.system.itemModifiers[key].mod === "itemModifierAttrWits") {
          sysData.itemModifiers.wits[key] = {
            id: key,
            name: item.name,
            attribute: game.i18n.localize("YZECORIOLIS.AttrWits"),
            skill: null,
            type: game.i18n.localize(CONFIG.YZECORIOLIS.itemTypes[item.type]),
            value: item.system.itemModifiers[key].value,
            checked: false
          };
          sysData.itemModifiers.observation[key] = {
            id: key,
            name: item.name,
            attribute: game.i18n.localize("YZECORIOLIS.AttrWits"),
            skill: null,
            type: game.i18n.localize(CONFIG.YZECORIOLIS.itemTypes[item.type]),
            value: item.system.itemModifiers[key].value,
            checked: false
          };
          sysData.itemModifiers.survival[key] = {
            id: key,
            name: item.name,
            attribute: game.i18n.localize("YZECORIOLIS.AttrWits"),
            skill: null,
            type: game.i18n.localize(CONFIG.YZECORIOLIS.itemTypes[item.type]),
            value: item.system.itemModifiers[key].value,
            checked: false
          };
          sysData.itemModifiers.dataDjinn[key] = {
            id: key,
            name: item.name,
            attribute: game.i18n.localize("YZECORIOLIS.AttrWits"),
            skill: null,
            type: game.i18n.localize(CONFIG.YZECORIOLIS.itemTypes[item.type]),
            value: item.system.itemModifiers[key].value,
            checked: false
          };
          sysData.itemModifiers.medicurgy[key] = {
            id: key,
            name: item.name,
            attribute: game.i18n.localize("YZECORIOLIS.AttrWits"),
            skill: null,
            type: game.i18n.localize(CONFIG.YZECORIOLIS.itemTypes[item.type]),
            value: item.system.itemModifiers[key].value,
            checked: false
          };
          sysData.itemModifiers.science[key] = {
            id: key,
            name: item.name,
            attribute: game.i18n.localize("YZECORIOLIS.AttrWits"),
            skill: null,
            type: game.i18n.localize(CONFIG.YZECORIOLIS.itemTypes[item.type]),
            value: item.system.itemModifiers[key].value,
            checked: false
          };
          sysData.itemModifiers.technology[key] = {
            id: key,
            name: item.name,
            attribute: game.i18n.localize("YZECORIOLIS.AttrWits"),
            skill: null,
            type: game.i18n.localize(CONFIG.YZECORIOLIS.itemTypes[item.type]),
            value: item.system.itemModifiers[key].value,
            checked: false
          };
        }
        if (item.system.itemModifiers[key].mod === "itemModifierSkillObs") {
          sysData.itemModifiers.observation[key] = {
            id: key,
            name: item.name,
            attribute: game.i18n.localize("YZECORIOLIS.AttrWits"),
            skill: game.i18n.localize("YZECORIOLIS.SkillObservation"),
            type: game.i18n.localize(CONFIG.YZECORIOLIS.itemTypes[item.type]),
            value: item.system.itemModifiers[key].value,
            checked: false
          };
        }
        if (item.system.itemModifiers[key].mod === "itemModifierSkillSurv") {
          sysData.itemModifiers.survival[key] = {
            id: key,
            name: item.name,
            attribute: game.i18n.localize("YZECORIOLIS.AttrWits"),
            skill: game.i18n.localize("YZECORIOLIS.SkillSurvival"),
            type: game.i18n.localize(CONFIG.YZECORIOLIS.itemTypes[item.type]),
            value: item.system.itemModifiers[key].value,
            checked: false
          };
        }
        if (item.system.itemModifiers[key].mod === "itemModifierSkillData") {
          sysData.itemModifiers.dataDjinn[key] = {
            id: key,
            name: item.name,
            attribute: game.i18n.localize("YZECORIOLIS.AttrWits"),
            skill: game.i18n.localize("YZECORIOLIS.SkillDataDjinn"),
            type: game.i18n.localize(CONFIG.YZECORIOLIS.itemTypes[item.type]),
            value: item.system.itemModifiers[key].value,
            checked: false
          };
        }
        if (item.system.itemModifiers[key].mod === "itemModifierSkillMedi") {
          sysData.itemModifiers.medicurgy[key] = {
            id: key,
            name: item.name,
            attribute: game.i18n.localize("YZECORIOLIS.AttrWits"),
            skill: game.i18n.localize("YZECORIOLIS.SkillMedicurgy"),
            type: game.i18n.localize(CONFIG.YZECORIOLIS.itemTypes[item.type]),
            value: item.system.itemModifiers[key].value,
            checked: false
          };
        }
        if (item.system.itemModifiers[key].mod === "itemModifierSkillSci") {
          sysData.itemModifiers.science[key] = {
            id: key,
            name: item.name,
            attribute: game.i18n.localize("YZECORIOLIS.AttrWits"),
            skill: game.i18n.localize("YZECORIOLIS.SkillScience"),
            type: game.i18n.localize(CONFIG.YZECORIOLIS.itemTypes[item.type]),
            value: item.system.itemModifiers[key].value,
            checked: false
          };
        }
        if (item.system.itemModifiers[key].mod === "itemModifierSkillTech") {
          sysData.itemModifiers.technology[key] = {
            id: key,
            name: item.name,
            attribute: game.i18n.localize("YZECORIOLIS.AttrWits"),
            skill: game.i18n.localize("YZECORIOLIS.SkillTechnology"),
            type: game.i18n.localize(CONFIG.YZECORIOLIS.itemTypes[item.type]),
            value: item.system.itemModifiers[key].value,
            checked: false
          };
        }
        // everything with the empathy-attribute
        if (item.system.itemModifiers[key].mod === "itemModifierAttrEmpathy") {
          sysData.itemModifiers.empathy[key] = {
            id: key,
            name: item.name,
            attribute: game.i18n.localize("YZECORIOLIS.AttrEmpathy"),
            skill: null,
            type: game.i18n.localize(CONFIG.YZECORIOLIS.itemTypes[item.type]),
            value: item.system.itemModifiers[key].value,
            checked: false
          };
          sysData.itemModifiers.manipulation[key] = {
            id: key,
            name: item.name,
            attribute: game.i18n.localize("YZECORIOLIS.AttrEmpathy"),
            skill: null,
            type: game.i18n.localize(CONFIG.YZECORIOLIS.itemTypes[item.type]),
            value: item.system.itemModifiers[key].value,
            checked: false
          };
          sysData.itemModifiers.command[key] = {
            id: key,
            name: item.name,
            attribute: game.i18n.localize("YZECORIOLIS.AttrEmpathy"),
            skill: null,
            type: game.i18n.localize(CONFIG.YZECORIOLIS.itemTypes[item.type]),
            value: item.system.itemModifiers[key].value,
            checked: false
          };
          sysData.itemModifiers.culture[key] = {
            id: key,
            name: item.name,
            attribute: game.i18n.localize("YZECORIOLIS.AttrEmpathy"),
            skill: null,
            type: game.i18n.localize(CONFIG.YZECORIOLIS.itemTypes[item.type]),
            value: item.system.itemModifiers[key].value,
            checked: false
          };
          sysData.itemModifiers.mysticPowers[key] = {
            id: key,
            name: item.name,
            attribute: game.i18n.localize("YZECORIOLIS.AttrEmpathy"),
            skill: null,
            type: game.i18n.localize(CONFIG.YZECORIOLIS.itemTypes[item.type]),
            value: item.system.itemModifiers[key].value,
            checked: false
          };
        }
        if (item.system.itemModifiers[key].mod === "itemModifierSkillMan") {
          sysData.itemModifiers.manipulation[key] = {
            id: key,
            name: item.name,
            attribute: game.i18n.localize("YZECORIOLIS.AttrEmpathy"),
            skill: game.i18n.localize("YZECORIOLIS.SkillManipulation"),
            type: game.i18n.localize(CONFIG.YZECORIOLIS.itemTypes[item.type]),
            value: item.system.itemModifiers[key].value,
            checked: false
          };
        }
        if (item.system.itemModifiers[key].mod === "itemModifierSkillCom") {
          sysData.itemModifiers.command[key] = {
            id: key,
            name: item.name,
            attribute: game.i18n.localize("YZECORIOLIS.AttrEmpathy"),
            skill: game.i18n.localize("YZECORIOLIS.SkillCommand"),
            type: game.i18n.localize(CONFIG.YZECORIOLIS.itemTypes[item.type]),
            value: item.system.itemModifiers[key].value,
            checked: false
          };
        }
        if (item.system.itemModifiers[key].mod === "itemModifierSkillCult") {
          sysData.itemModifiers.culture[key] = {
            id: key,
            name: item.name,
            attribute: game.i18n.localize("YZECORIOLIS.AttrEmpathy"),
            skill: game.i18n.localize("YZECORIOLIS.SkillCulture"),
            type: game.i18n.localize(CONFIG.YZECORIOLIS.itemTypes[item.type]),
            value: item.system.itemModifiers[key].value,
            checked: false
          };
        }
        if (item.system.itemModifiers[key].mod === "itemModifierSkillMys") {
          sysData.itemModifiers.mysticPowers[key] = {
            id: key,
            name: item.name,
            attribute: game.i18n.localize("YZECORIOLIS.AttrEmpathy"),
            skill: game.i18n.localize("YZECORIOLIS.SkillMysticPowers"),
            type: game.i18n.localize(CONFIG.YZECORIOLIS.itemTypes[item.type]),
            value: item.system.itemModifiers[key].value,
            checked: false
          };
        }
        // other roll related modifiers
        if (item.system.itemModifiers[key].mod === "itemModifierArmor") {
          sysData.itemModifiers.armor[key] = {
            id: key,
            name: item.name,
            attribute: null,
            skill: null,
            type: game.i18n.localize(CONFIG.YZECORIOLIS.itemTypes[item.type]),
            value: item.system.itemModifiers[key].value,
            checked: false
          };
        }
      }
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
        img: this.prototypeToken.randomImg
          ? this.img
          : this.prototypeToken.texture.src,
      },
      // img to be displayed next to the name on the test card - if it's a wildcard img, use the actor image
    };

    // If the test is coming from a token sheet
    if (this.token) {
      chatOptions.speaker.alias = this.token.name; // Use the token name instead of the actor name
      chatOptions.speaker.token = this.token._id;
      chatOptions.speaker.scene = canvas.scene._id;
      chatOptions.flags.img = this.token.texture.src; // Use the token image instead of the actor image
    } // If a linked actor - use the currently selected token's data if the actor id matches
    else {
      let speaker = ChatMessage.getSpeaker();
      if (speaker.actor == this._id) {
        chatOptions.speaker.alias = speaker.alias;
        chatOptions.speaker.token = speaker.token;
        chatOptions.speaker.scene = speaker.scene;
        chatOptions.flags.img = speaker.token
          ? canvas.tokens.get(speaker.token).document.texture.src
          : chatOptions.flags.img;
      }
    }

    return chatOptions;
  }

  _prepHPModifications() {
    // look through items for any HP-Modifications
    let bonus = 0;
    for (let t of this.items) {
      const tData = t.system.itemModifiers;
      bonus += Number(Object.keys(tData).reduce((counter,x) => {
        counter += (tData[x].mod === "itemModifierHP" && (t.type === 'injury' || t.type === 'talent' || t.system.equipped === true))
          ? tData[x].value
          : 0;
          return counter;
        }
      , 0));
    }
    return bonus;
  }

  _prepMPModifications() {
    // look through items for any MP-Modifications
    let bonus = 0;
    for (let t of this.items) {
      const tData = t.system.itemModifiers;
      bonus += Number(Object.keys(tData).reduce((counter,x) => {
        counter += (tData[x].mod === "itemModifierMP" && (t.type === 'injury' || t.type === 'talent' || t.system.equipped === true))
          ? tData[x].value
          : 0;
          return counter;
        }
      , 0));
    }
    return bonus;
  }

  _prepRadiationModifications() {
    // look through items for any Radiation-Modifications
    let bonus = 0;
    for (let t of this.items) {
      const tData = t.system.itemModifiers;
      bonus += Number(Object.keys(tData).reduce((counter,x) => {
        counter += (tData[x].mod === "itemModifierRad" && (t.type === 'injury' || t.type === 'talent' || t.system.equipped === true))
          ? tData[x].value
          : 0;
          return counter;
        }
      , 0));
    }
    return bonus;
  }

  _prepEncumbranceModifications() {
    // look through items for any Encumbrance-Modifications
    let bonus = 0;
    for (let t of this.items) {
      const tData = t.system.itemModifiers;
      bonus += Number(Object.keys(tData).reduce((counter,x) => {
        counter += (tData[x].mod === "itemModifierEnc" && (t.type === 'injury' || t.type === 'talent' || t.system.equipped === true))
          ? tData[x].value
          : 0;
          return counter;
        }
      , 0));
    }
    return bonus;
  }

  _prepMovementRateModifications() {
    // look through items for any MovementRate-Modifications
    let bonus = 0;
    for (let t of this.items) {
      const tData = t.system.itemModifiers;
      bonus += Number(Object.keys(tData).reduce((counter,x) => {
        counter += (tData[x].mod === "itemModifierMR" && (t.type === 'injury' || t.type === 'talent' || t.system.equipped === true))
          ? tData[x].value
          : 0;
          return counter;
        }
      , 0));
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
