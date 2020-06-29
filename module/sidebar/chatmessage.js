
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
        this.successes = 0;
        localRoll.parts.forEach(part => {
            part.rolls.forEach(r => {
                if (r.roll === 6) {
                    this.successes++;
                }
            })
        });
        this.outcomes = {
            limitedSuccess: this.successes > 0 && this.successes < 3,
            criticalSuccess: this.successes >= 3,
            failure: this.successes === 0,
        }
        this.initialized = true;
    }

    async render() {
        this.initializeData();

        this.outcomes.tooltip = await this.roll.getTooltip();
        // Determine some metadata
        const data = duplicate(this.data);
        const isWhisper = this.data.whisper.length;
        const isVisible = this.isContentVisible;

        let mergedData = mergeObject(this.outcomes, data);
        console.log('rendering my custom class', mergedData);

        // Construct message data
        const messageData = {
            message: mergedData,
            user: game.user,
            successes: this.successes,
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
            console.log('chat message roll!');

            mergedData.content = await renderTemplate('systems/yzecoriolis/templates/sidebar/roll.html', this.outcomes);
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
}