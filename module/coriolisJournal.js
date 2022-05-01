function isCustomJournal(entity) {
  const importPath = entity.getFlag("yzecoriolis", "customJournal");
  if (!importPath) {
    return false;
  }
  return true;
}

export class coriolisJournalSheet extends JournalSheet {
  activateListeners(html) {
    super.activateListeners(html);
    // we add a css class here to denote core journal entries so we can style
    // specifically against them without altering the main journal style.
    if (isCustomJournal(this.document)) {
      html.find(".entryContent").parents(".editable").addClass("coriolis-core");
    } else {
      // if this is a normal journal entry (i.e. player or gm created), test if it is editable, then wrap into Coriolis
      // classes to make them look nice
      const editableElements = html.find(".window-content .editable");
      // only if the class has not been included
      if (!editableElements.hasClass("coriolis-core")) {
        editableElements.addClass("coriolis-core");
        editableElements.find(".editor-content").wrap("<div class=\"entryBGVTT\"><div class=\"entryContainer\"><div class=\"entryContent\"></div></div></div>");
      }
    }
  }
}
