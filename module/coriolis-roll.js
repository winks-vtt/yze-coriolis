

/**
 * takes in rendering options, rollData and:
 * 1. does the roll
 * 2. evaluates the roll
 * 3. takes the results and shows them in a chat message.
 * @param  {} chatOptions the options used to display the roll result in chat.
 * @param  {} rollData contains all data necessary to make a roll in Coriolis.
 */
export async function coriolisRoll(chatOptions, rollData) {
    let errorObj = { 'error': 'YZECORIOLIS.ErrorsInvalidSkillRoll' };
    const isValid = isValidRoll(rollData, errorObj);
    if (!isValid) {
        ui.notifications.error(new Error(game.i18n.localize(errorObj.error)));
        return;
    }

    let totalDice = getTotalDice(rollData);
    if (totalDice <= 0) {
        totalDice = 2; // desparation roll where both will have to be successes to be considered a success.
    }
    let roll = new Roll(`${totalDice}d6`);
    roll.roll();
    await showDiceSoNice(roll, chatOptions.rollMode);
    const result = evaluateCoriolisRoll(rollData, roll);
    await showChatMessage(chatOptions, result);
}
/**
 *
 * returns if this is a valid Roll or not and an error describing why it isn't.
 * @param  {} rollData
 * @param  {} errorObj
 * @returns true / false
 */
function isValidRoll(rollData, errorObj) {
    // TODO: account for modifier somehow
    const skill = rollData.skill;
    const attribute = rollData.attribute;
    switch (rollData.rollType) {
        case 'skill':
            return attribute + skill > 0;
        case 'advancedSkill':
            if (skill <= 0) {
                errorObj.error = 'YZECORIOLIS.ErrorsInvalidAdvancedSkillRoll';
                return false;
            }
            return attribute + skill > 0;
        case 'attribute':
            return attribute > 0;
    }
    errorObj.error = 'YZECORIOLIS.ErrorsInvalidSkillRoll';
    return false;
}
/**
 * takes the result of the role and associated roll data and returns a result object.
 * @param  {rollType, skill, attribute, modifier} rollData
 * @param  {} roll
 * @returns {limitedSuccess,criticalSuccess,failure, roll, rollData} returns the results plus the initial rollData and roll object in case you wish to push.
 */
export function evaluateCoriolisRoll(rollData, roll) {
    let successes = 0;
    roll.dice.forEach(part => {
        part.rolls.forEach(r => {
            if (r.roll === 6) {
                successes++;
            }
        })
    });
    const isDesparation = getTotalDice(rollData) <= 0;
    let result = {
        desparationRoll: isDesparation,
        successes: successes,
        limitedSuccess: isDesparation ? successes === 2 : (successes > 0 && successes < 3),
        criticalSuccess: successes >= 3,
        failure: isDesparation ? successes < 2 : successes === 0,
        rollData: rollData,
        roll: roll
    };

    return result;
}

function getTotalDice(rollData) {
    let attributeValue = rollData.attribute;
    let skillValue = rollData.skill;
    let modifier = rollData.modifier;  // TODO: account for modifier
    switch (rollData.rollType) {
        case 'skill':
            return attributeValue + skillValue + modifier;
        case 'advancedSkill':
            return attributeValue + skillValue + modifier;
        case 'attribute':
            return attributeValue + modifier;
    }
    return 0;
}

async function showChatMessage(chatMsgOptions, resultData) {
    let tooltip = await renderTemplate('systems/yzecoriolis/templates/sidebar/dice-results.html', getTooltipData(resultData));
    let chatData = {
        title: 'Roll',
        results: resultData,
        tooltip: tooltip
    };

    chatMsgOptions["flags.data"] = {
        rollData: chatData.rollData
    };
    return renderTemplate(chatMsgOptions.template, chatData).then(html => {
        chatMsgOptions['content'] = html;
        return ChatMessage.create(chatMsgOptions, false);
    });
}

function getTooltipData(results) {
    const data = {
        formula: results.roll.formula,
        total: results.successes
    };

    // Prepare dice parts
    data["parts"] = results.roll.dice.map(d => {
        let maxRoll = Math.max(...d.sides);

        // Generate tooltip data
        return {
            formula: d.formula,
            total: results.successes,
            faces: d.faces,
            rolls: d.rolls.map(r => {
                return {
                    result: '&nbsp;',
                    showNum: r.roll === maxRoll,
                    classes: [
                        d.constructor.name.toLowerCase(),
                        "d" + d.faces,
                        "dice-" + r.roll,
                        "dice-face",
                        r.rerolled ? "rerolled" : null,
                        (r.roll === maxRoll) ? "success" : null
                    ].filter(c => c).join(" ")
                }
            })
        };
    });
    return data;
}

/**
 * Add support for the Dice So Nice module
 * @param {Object} roll
 * @param {String} rollMode
 */
async function showDiceSoNice(roll, rollMode) {
    if (game.modules.get("dice-so-nice") && game.modules.get("dice-so-nice").active) {
        let whisper = null;
        let blind = false;
        switch (rollMode) {
            case "blindroll": //GM only
                blind = true;
            case "gmroll": //GM + rolling player
                let gmList = game.users.filter(user => user.isGM);
                let gmIDList = [];
                gmList.forEach(gm => gmIDList.push(gm.data._id));
                whisper = gmIDList;
                break;
            case "roll": //everybody
                let userList = game.users.filter(user => user.active);
                let userIDList = [];
                userList.forEach(user => userIDList.push(user.data._id));
                whisper = userIDList;
                break;
        }
        await game.dice3d.showForRoll(roll, game.user, true, whisper, blind);
    }
}