export const preloadHandlerbarsTemplates = async function () {

    const templatePaths = [

        // chat templates
        "systems/yzecoriolis/templates/roll.html"
    ];

    return loadTemplates(templatePaths);
}