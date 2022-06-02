export const registerSystemSettings = function () {
  /*
   * reloads the sheet after a certain setting is applied
   */
  const debouncedReload = foundry.utils.debounce(
    () => window.location.reload(),
    100
  );

  /**
   * Track the system version upon which point a migration was last applied
   */
  game.settings.register("yzecoriolis", "systemMigrationVersion", {
    name: "System Migration Version",
    scope: "world",
    config: false,
    type: String,
    default: "0",
  });

  // register the darkness points for the world
  game.settings.register("yzecoriolis", "darknessPoints", {
    name: game.i18n.localize("YZECORIOLIS.DarknessPoints"),
    scope: "world",
    config: false,
    type: Number,
    default: 0,
  });

  game.settings.register("yzecoriolis", "maxEPTokensAllowed", {
    name: game.i18n.localize("YZECORIOLIS.SettingMaxEnergyPoints"),
    scope: "world",
    config: true,
    type: Number,
    default: 10,
  });

  game.settings.register("yzecoriolis", "firstLaunch", {
    name: "Onboarding",
    scope: "world",
    config: false,
    type: Boolean,
    default: false,
  });

  game.settings.register("yzecoriolis", "AlwaysShowFeatures", {
    name: game.i18n.localize("YZECORIOLIS.SettingAlwaysShowFeatures"),
    hint: game.i18n.localize("YZECORIOLIS.SettingAlwaysShowFeaturesHint"),
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
    onChange: debouncedReload,
  });

  game.settings.register("yzecoriolis", "RollInfoAttribute", {
    name: game.i18n.localize("YZECORIOLIS.SettingRollInfoAttribute"),
    hint: game.i18n.localize("YZECORIOLIS.SettingRollInfoAttributeHint"),
    scope: "world",
    config: true,
    type: String,
    choices: {
      "no": game.i18n.localize("YZECORIOLIS.SettingRollInfoNo"),
      "pc": game.i18n.localize("YZECORIOLIS.SettingRollInfoPC"),
      "npc": game.i18n.localize("YZECORIOLIS.SettingRollInfoNPC"),
      "all": game.i18n.localize("YZECORIOLIS.SettingRollInfoAll")
      },
    default: "no",
    onChange: applyRollInfoSetting,
  });

  game.settings.register("yzecoriolis", "RollInfoSkill", {
    name: game.i18n.localize("YZECORIOLIS.SettingRollInfoSkill"),
    hint: game.i18n.localize("YZECORIOLIS.SettingRollInfoSkillHint"),
    scope: "world",
    config: true,
    type: String,
    choices: {
      "no": game.i18n.localize("YZECORIOLIS.SettingRollInfoNo"),
      "pc": game.i18n.localize("YZECORIOLIS.SettingRollInfoPC"),
      "npc": game.i18n.localize("YZECORIOLIS.SettingRollInfoNPC"),
      "all": game.i18n.localize("YZECORIOLIS.SettingRollInfoAll")
      },
    default: "no",
    onChange: applyRollInfoSetting,
  });

  game.settings.register("yzecoriolis", "RollInfoWeapon", {
    name: game.i18n.localize("YZECORIOLIS.SettingRollInfoWeapon"),
    hint: game.i18n.localize("YZECORIOLIS.SettingRollInfoWeaponHint"),
    scope: "world",
    config: true,
    type: String,
    choices: {
      "no": game.i18n.localize("YZECORIOLIS.SettingRollInfoNo"),
      "pc": game.i18n.localize("YZECORIOLIS.SettingRollInfoPC"),
      "npc": game.i18n.localize("YZECORIOLIS.SettingRollInfoNPC"),
      "all": game.i18n.localize("YZECORIOLIS.SettingRollInfoAll")
      },
    default: "no",
    onChange: applyRollInfoSetting,
  });

  game.settings.register("yzecoriolis", "RollInfoExplosive", {
    name: game.i18n.localize("YZECORIOLIS.SettingRollInfoExplosive"),
    hint: game.i18n.localize("YZECORIOLIS.SettingRollInfoExplosiveHint"),
    scope: "world",
    config: true,
    type: String,
    choices: {
      "no": game.i18n.localize("YZECORIOLIS.SettingRollInfoNo"),
      "pc": game.i18n.localize("YZECORIOLIS.SettingRollInfoPC"),
      "npc": game.i18n.localize("YZECORIOLIS.SettingRollInfoNPC"),
      "all": game.i18n.localize("YZECORIOLIS.SettingRollInfoAll")
      },
    default: "no",
    onChange: applyRollInfoSetting,
  });

  game.settings.register("yzecoriolis", "RollInfoArmor", {
    name: game.i18n.localize("YZECORIOLIS.SettingRollInfoArmor"),
    hint: game.i18n.localize("YZECORIOLIS.SettingRollInfoArmorHint"),
    scope: "world",
    config: true,
    type: String,
    choices: {
      "no": game.i18n.localize("YZECORIOLIS.SettingRollInfoNo"),
      "pc": game.i18n.localize("YZECORIOLIS.SettingRollInfoPC"),
      "npc": game.i18n.localize("YZECORIOLIS.SettingRollInfoNPC"),
      "all": game.i18n.localize("YZECORIOLIS.SettingRollInfoAll")
      },
    default: "no",
    onChange: applyRollInfoSetting,
  });
};

export function applyRollInfoSetting() {
  Handlebars.registerHelper("RollInfoAttr", function () {
    return game.settings.get("yzecoriolis", "RollInfoAttribute");
  });

  Handlebars.registerHelper("RollInfoSkill", function () {
    return game.settings.get("yzecoriolis", "RollInfoSkill");
  });

  Handlebars.registerHelper("RollInfoWeapon", function () {
    return game.settings.get("yzecoriolis", "RollInfoWeapon");
  });

  Handlebars.registerHelper("RollInfoExplosive", function () {
    return game.settings.get("yzecoriolis", "RollInfoExplosive");
  });

    Handlebars.registerHelper("RollInfoArmor", function () {
    return game.settings.get("yzecoriolis", "RollInfoArmor");
  });
}
