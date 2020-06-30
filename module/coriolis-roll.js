
import { ChatMessageYZECoriolis } from './sidebar/chatmessage.js';

async function makeMessage(roll, desparateRoll, messageData, { rollMode = null } = {}) {
    // Prepare chat data
    messageData = mergeObject({
        user: game.user._id,
        type: CONST.CHAT_MESSAGE_TYPES.ROLL,
        sound: CONFIG.sounds.dice,

    }, messageData);
    messageData.roll = roll;

    const messageOptions = { rollMode, desparateRoll };
    return ChatMessageYZECoriolis.create(messageData, messageOptions);
};

export async function coriolisRoll(dataset, actor) {
    let actorData = actor.data.data;
    let errorObj = { 'error': 'YZECORIOLIS.ErrorsInvalidSkillRoll' };
    if (isValidRoll(dataset.rolltype, actorData, dataset, errorObj)) {
        let diceCount = getTotalDice(dataset.rolltype, actorData, dataset.attributekey, dataset.skillkey);
        let desparateRoll = false;
        if (diceCount <= 0) {
            diceCount = 2;
            desparateRoll = true;
        }
        let roll = new Roll(`${diceCount}d6`);
        let label = dataset.label ? `${dataset.label} Roll` : '';
        try {
            roll.roll();
            makeMessage(roll, desparateRoll, {
                speaker: ChatMessage.getSpeaker({
                    actor: actor
                }),
                flavor: label
            });
        } catch (err) {
            ui.notifications.error(err);
            throw new Error(err);
        }
    } else {
        ui.notifications.error(new Error(game.i18n.localize(errorObj.error)));
    }
}

function getTotalDice(rollType, actorData, attribute, skill) {
    let attributeValue = 0;
    let skillValue = 0;
    let modifier = 0;  // TODO: account for modifier
    switch (rollType) {
        case 'skill':
            attributeValue = actorData.attributes[attribute].value;
            skillValue = actorData.skills[skill].value;
            return attributeValue + skillValue + modifier;
        case 'advancedSkill':
            attributeValue = actorData.attributes[attribute].value;
            skillValue = actorData.skills[skill].value;
            return attributeValue + skillValue + modifier;
        case 'attribute':
            attributeValue = actorData.attributes[attribute].value;
            return attributeValue + modifier;

    }
    return 0;
}
/**
 * Returns true/false if roll they are attempting makes any sense. This isn't enforcing game rules.
 * This is enforcing input validation so the Roll API doesn't error.
 * This makes sure the rollType we are attempting has the valid data to make the roll.
 * @returns true/false and fills the errorObj as a string
 */
function isValidRoll(rollType, actorData, dataset, errorObj) {
    let attributeValue = 0;
    let skillValue = 0;
    // TODO: account for modifier somehow
    switch (rollType) {
        case 'skill':
            attributeValue = actorData.attributes[dataset.attributekey].value;
            skillValue = actorData.skills[dataset.skillkey].value;
            return attributeValue + skillValue > 0;
        case 'advancedSkill':
            attributeValue = actorData.attributes[dataset.attributekey].value;
            skillValue = actorData.skills[dataset.skillkey].value;
            if (skillValue <= 0) {
                errorObj.error = 'YZECORIOLIS.ErrorsInvalidAdvancedSkillRoll';
                return false;
            }
            return attributeValue + skillValue > 0;
        case 'attribute':
            attributeValue = actorData.attributes[dataset.attributekey].value;
            return attributeValue > 0;

    }
    errorObj.error = 'YZECORIOLIS.ErrorsInvalidSkillRoll';
    return false;
}