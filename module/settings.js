export const registerSystemSettings = function () {
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
    default: true,
    onChange: debouncedReload,
  });
};
