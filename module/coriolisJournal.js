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

  activateListeners(html) {
    super.activateListeners(html);
    // we add a css class here to denote core journal entries so we can style
    // specifically against them without altering the main journal style.
    if (isCustomJournal(this.document)) {
      html.find(".entryContent").parents(".editable").addClass("coriolis-core");
    }
  }
}
