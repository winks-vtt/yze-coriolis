
export async function addDarknessPoints(points) {
    console.log('added points');
    let dPoints = getDarknessPoints();
    dPoints.value += 1;
    await setDarknessPoints(dPoints);
}

export async function spendDarknessPoints(points) {
    console.log('spent points');
    let dPoints = getDarknessPoints();
    dPoints.value -= 1;
    if (dPoints.value < 0) {
        dPoints.value = 0;
    }
    await setDarknessPoints(dPoints);
}

function getDarknessPoints() {
    let user = game.users.get(game.user.id);
    let dPoints = user.getFlag("yzecoriolis", "darknessPoints");
    if (!dPoints) {
        dPoints = {
            value: 0
        }
    }
    return dPoints;
}

async function setDarknessPoints(dPoints) {
    let user = game.users.get(game.user.id);
    await user.setFlag("yzecoriolis", "darknessPoints", dPoints);
}