//TODO: refactor this to use a singleton game item.
export async function addDarknessPoints(points) {
    let dPoints = getDarknessPoints();
    dPoints += points;
    await setDarknessPoints(dPoints);
    console.log('added points', dPoints);
    showDarknessPoints(dPoints);
    //TODO: announceDP
}

export async function spendDarknessPoints(points) {
    let dPoints = getDarknessPoints();
    dPoints -= points;
    if (dPoints < 0) {
        dPoints = 0;
    }
    console.log('spent points', dPoints);
    await setDarknessPoints(dPoints);
    showDarknessPoints(dPoints);
    //purposefully not announcing the spending of points.
}

function getDarknessPoints() {
    return game.settings.get("yzecoriolis", "darknessPoints");
}

async function setDarknessPoints(dPoints) {
    await game.settings.set("yzecoriolis", "darknessPoints", dPoints);
}
/**
 * whispers the current darkness points to the GM.
 * @param  {} totalPoints
 */
async function showDarknessPoints(totalPoints) {
    let gmList = game.users.filter(user => user.isGM);
    let messageData = {
        user: game.user._id,
        speaker: ChatMessage.getSpeaker({ user: game.user }),
        whisper: gmList
    };

    const dpData = {
        gmUsername: game.user.name,
        totalPoints: totalPoints
    };

    messageData.content = await renderTemplate('systems/yzecoriolis/templates/sidebar/darkness-points-chat.html', dpData);
    return ChatMessage.create(messageData);
}