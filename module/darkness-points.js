
export async function addDarknessPoints(points) {
    let dPoints = getDarknessPoints();
    dPoints.value += 1;
    await setDarknessPoints(dPoints);
    console.log('added points', dPoints);
    showDarknessPoints(dPoints.value);
}

export async function spendDarknessPoints(points) {
    let dPoints = getDarknessPoints();
    dPoints.value -= 1;
    if (dPoints.value < 0) {
        dPoints.value = 0;
    }
    console.log('spent points', dPoints);
    await setDarknessPoints(dPoints);
    showDarknessPoints(dPoints.value);
    //purposefully not announcing the spending of points.
}

function getDarknessPoints() {
    let dPoints = game.user.getFlag("yzecoriolis", "darknessPoints");
    if (!dPoints) {
        dPoints = {
            value: 0
        }
    }
    return dPoints;
}

async function setDarknessPoints(dPoints) {
    await game.user.unsetFlag("yzecoriolis", "darknessPoints", dPoints);
    await game.user.setFlag("yzecoriolis", "darknessPoints", dPoints);
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