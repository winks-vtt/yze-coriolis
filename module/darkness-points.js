
export async function addDarknessPoints(points) {
    let dPoints = getDarknessPoints();
    dPoints.value += 1;
    await setDarknessPoints(dPoints);
    console.log('added points', dPoints);
}

export async function spendDarknessPoints(points) {
    let dPoints = getDarknessPoints();
    dPoints.value -= 1;
    if (dPoints.value < 0) {
        dPoints.value = 0;
    }
    console.log('spent points', dPoints);
    await setDarknessPoints(dPoints);
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