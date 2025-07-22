function isCustomJournal(entity) {
  const importPath = entity.getFlag("yzecoriolis", "customJournal");
  if (!importPath) {
    return false;
  }
  return true;
}

export class coriolisJournalSheet extends JournalSheet {
  /**
   * Activate a named TinyMCE text editor
   * @param {string} name             The named data field which the editor modifies.
   * @param {object} options          TinyMCE initialization options passed to TextEditor.create
   * @param {string} initialContent   Initial text content for the editor area.
   */
  activateEditor(name, options = {}, initialContent = "") {
    let customOptions = { ...options };
    if (isCustomJournal(this.document)) {
      customOptions.body_class = "coriolis-official-body";
    }
    super.activateEditor(name, customOptions, initialContent);
  }
}

/// handles injecting coriolis classes into journal entries so that compendiums
/// can use them for custom styling
// eslint-disable-next-line no-unused-vars
Hooks.on("renderJournalEntrySheet", (app, html, options) => {
  if (app.document && isCustomJournal(app.document)) {
    $(html)
      .find(".entryContent")
      .parents(".journal-entry-content")
      .addClass("coriolis-core");
  }
});

// const JournalPageSheetV1 = foundry.appv1.sheets.JournalPageSheet;
// Hooks.on("renderJournalEntryPageSheet", (app, html) => {
//   console.log("rendering sheet 2", app, html);
//   if (app instanceof JournalPageSheetV1) {
//     //do some thing
//     console.log("found another sheet", app, html);
//   }
// });
