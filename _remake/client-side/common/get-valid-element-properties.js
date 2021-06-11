function getValidElementProperties() {
  return [
    "alt",
    "autocapitalize",
    "autofocus",
    "checked",
    "className",
    "contentEditable",
    "for",
    "hidden",
    "href",
    "id",
    "innerHTML",
    "innerText",
    "isContentEditable",
    "lang",
    "outerText",
    "placeholder",
    "spellcheck",
    "src",
    "style",
    "textContent",
    "title",
    "type",
    "value",
  ];
}

// valid element properties with "@" prepended
const validPropertyCommands = getValidElementProperties().map(p => "@" + p);

// validPropertyCommands, @attr command, and maybe @search
export function isValidCommand({ commandName, includingSearchCommand = false }) {
  return (
    (includingSearchCommand && commandName === "@search") ||
    validPropertyCommands.includes(commandName) ||
    commandName.indexOf("@attr:") === 0
  );
}
