function getValidElementProperties () {
  return ["id", "className", "type", "src", "href", "value", "checked", "innerText", "innerHTML", "style", "title", "alt", "for", "placeholder"];
}

// valid element properties with "@" prepended
const validPropertyCommands = getValidElementProperties().map(p => "@" + p);

// validPropertyCommands, @attr command, and maybe @search
export function isValidCommand ({commandName, includingSearchCommand = false}) {
  return (includingSearchCommand && commandName === "@search") || validPropertyCommands.includes(commandName) || commandName.indexOf("@attr:") === 0;
}