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
    }
  }
}
