export const registerSystemSettings = function () {

    // Register a world setting
    game.settings.register("yzecoriolis", "rollModifierRange", {
        name: "The range of the role modifier",
        hint: "reduce this parameter to unclutter the roll dialog",
        scope: "client",      // This specifies a world-level setting
        config: true,        // This specifies that the setting appears in the configuration view
        type: Number,
        range: {             // If range is specified, the resulting setting will be a range slider
            min: 3,
            max: 10,
            step: 1
        },
        default: 5,         // The default value for the setting
        onChange: value => { // A callback function which triggers when the setting is changed
            console.log(value)
        }
    });

    /**
     * Track the system version upon which point a migration was last applied
     */
    game.settings.register("yzecoriolis", "systemMigrationVersion", {
        name: "System Migration Version",
        scope: "world",
        config: false,
        type: Number,
        default: 0
    });

    // register the darkness points for the world
    game.settings.register("yzecoriolis", "darknessPoints", {
        name: game.i18n.localize('YZECORIOLIS.DarknessPoints'),
        scope: "world",
        config: false,
        type: Number,
        default: 0
    });
};