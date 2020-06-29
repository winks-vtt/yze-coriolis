
export class ChatMessageYZECoriolis extends ChatMessage {

    _onCreate(data, options, userId) {
        super._onCreate(data, options, userId);
        this.initializeData();
    }

    initializeData() {
        if (this.initialized) {
            return;
        }
        let localRoll = this.roll;
        let successes = 0;
        localRoll.parts.forEach(part => {
            part.rolls.forEach(r => {
                if (r.roll === 6) {
                    successes++;
                }
            })
        });
        this.outcome = {
            limitedSuccess: successes > 0 && successes < 3,
            criticalSuccess: successes >= 3,
            failure: successes === 0,
            successes: successes
        }
        this.initialized = true;
    }

    async render() {
        this.initializeData();

        this.outcome.tooltip = await renderTemplate('systems/yzecoriolis/templates/sidebar/dice-results.html', this.getTooltipData(this.roll));
        // Determine some metadata
        const data = duplicate(this.data);
        const isWhisper = this.data.whisper.length;
        const isVisible = this.isContentVisible;

        let mergedData = mergeObject(this.outcome, data);

        // Construct message data
        const messageData = {
            message: mergedData,
            user: game.user,
            successes: this.outcome.successes,
            author: this.user,
            alias: this.alias,
            cssClass: [
                this.data.type === CONST.CHAT_MESSAGE_TYPES.IC ? "ic" : null,
                this.data.type === CONST.CHAT_MESSAGE_TYPES.EMOTE ? "emote" : null,
                isWhisper ? "whisper" : null,
                this.data.blind ? "blind" : null
            ].filter(c => c !== null).join(" "),
            isWhisper: this.data.whisper.some(id => id !== game.user._id),
            whisperTo: this.data.whisper.map(u => {
                let user = game.users.get(u);
                return user ? user.name : null;
            }).filter(n => n !== null).join(", ")
        };

        // Enrich some data for dice rolls
        if (this.isRoll) {
            mergedData.content = await renderTemplate('systems/yzecoriolis/templates/sidebar/roll.html', this.outcome);
            //TODO: update rendering
            // Conceal some private roll information
            if (!isVisible) {
                data.content = await this.roll.render({ isPrivate: !isVisible });
                data.flavor = `${this.user.name} privately rolled some dice`;
                messageData.isWhisper = false;
                messageData.alias = this.user.name;
            }
        }

        // Define a border color
        if (this.data.type === CONST.CHAT_MESSAGE_TYPES.OOC) {
            messageData.borderColor = this.user.color;
        }

        // Render the chat message
        let html = await renderTemplate(CONFIG.ChatMessage.template, messageData);
        html = $(html);

        // Call a hook for the rendered ChatMessage data
        Hooks.call("renderChatMessage", this, html, messageData);
        return html;
    }

    getTooltipData(roll) {
        const data = {
            formula: roll.formula,
            total: this.outcome.successes
        };

        // Prepare dice parts
        data["parts"] = roll.dice.map(d => {
            let minRoll = Math.min(...d.sides),
                maxRoll = Math.max(...d.sides);

            // Generate tooltip data
            return {
                formula: d.formula,
                total: this.outcome.successes,
                faces: d.faces,
                rolls: d.rolls.map(r => {
                    return {
                        result: (r.roll === maxRoll) ? d._getTooltip(r.roll) : '&nbsp;',
                        showNum: r.roll === maxRoll,
                        classes: [
                            d.constructor.name.toLowerCase(),
                            "d" + d.faces,
                            r.rerolled ? "rerolled" : null,
                            (r.roll === maxRoll) ? "max" : null,
                            (r.roll === maxRoll) ? "success" : null
                        ].filter(c => c).join(" ")
                    }
                })
            };
        });
        console.log('tooltip data', data);
        return data;
    }
}