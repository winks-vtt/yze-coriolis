export const preloadHandlerbarsTemplates = async function () {
  const templatePaths = [
    // chat templates
    "systems/yzecoriolis/templates/sidebar/roll.html",
    "systems/yzecoriolis/templates/sidebar/dice-results.html",
    "systems/yzecoriolis/templates/sidebar/darkness-points-chat.html",
    // sheet templates
    "systems/yzecoriolis/templates/actor/parts/actor-bio.html",
    "systems/yzecoriolis/templates/actor/parts/actor-talents.html",
    "systems/yzecoriolis/templates/actor/parts/actor-stats.html",
    "systems/yzecoriolis/templates/actor/parts/actor-gear.html",
    "systems/yzecoriolis/templates/actor/parts/ship-crew.html",
    "systems/yzecoriolis/templates/actor/parts/ship-modules.html",
  ];

  return loadTemplates(templatePaths);
};
