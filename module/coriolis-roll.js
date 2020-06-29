
import { ChatMessageYZECoriolis } from './sidebar/chatmessage.js';

async function makeMessage(roll, messageData, { rollMode = null } = {}) {
    // Prepare chat data
    messageData = mergeObject({
        user: game.user._id,
        type: CONST.CHAT_MESSAGE_TYPES.ROLL,
        sound: CONFIG.sounds.dice,

    }, messageData);
    messageData.roll = roll;

    const messageOptions = { rollMode };
    return ChatMessageYZECoriolis.create(messageData, messageOptions);
};

export async function coriolisRoll(dataset, actor) {
    let actorData = actor.data.data;
    if (dataset.roll && isValidRoll(dataset.rolltype, actorData, dataset)) {
        let roll = new Roll(dataset.roll, actorData);
        let label = dataset.label ? `${dataset.label} Roll` : '';
        try {
            roll.roll();
            makeMessage(roll, {
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
        ui.notifications.error(new Error(game.i18n.localize('YZECORIOLIS.ErrorsInvalidSkillRoll')));
    }
}

function isValidRoll(rollType, actorData, dataset) {
    let attributeValue = 0;
    let skillValue = 0;
    switch (rollType) {
        case 'skill':
            attributeValue = actorData.attributes[dataset.attributekey].value;
            skillValue = actorData.skills[dataset.skillkey].value;
            return attributeValue + skillValue > 0;
        case 'attribute':
            attributeValue = actorData.attributes[dataset.attributekey].value;
            return attributeValue > 0;

    }
    return false;
}