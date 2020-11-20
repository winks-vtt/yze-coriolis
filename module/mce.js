export function setupMCE() {
    let orig = TextEditor.create;
    TextEditor.create = (options, content) => {
        // I hope to find a better way... I don't want to globally change all
        // tinyMCE instances, but only the one in the notes tab on yze character
        // sheets. But the content is in an iFrame and the iFrame doesn't seem
        // to have any metadata to help me exclude styling. W0o monkey patching!
        let isCharNote = options.target.dataset.edit === 'data.notes';
        if (isCharNote) {
            let newCSS = CONFIG.TinyMCE.content_css.slice();
            newCSS.push('systems/yzecoriolis/css/yzecoriolismce.css');
            options.content_css = newCSS.map(c => ROUTE_PREFIX ? `/${ROUTE_PREFIX}${c}` : c).join(",");
        }
        return orig(options, content);
    }
}