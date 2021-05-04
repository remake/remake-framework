/* 

  SHOW-IF PLUGIN
  --------------
  Conditionally show elements depending on the values of the keys on their ancestors.
  
  How to use: 
  ===========
  1. Run this code when the page loads
  2. Run this code whenever a new elements that has a show-if attribute is added to the page (or if you want: simply whenever the page changes)
  
  How it works:
  =============
  Scans your page for `show-if` attributes, parses out their values, and creates stylesheets for the page based on them. If the function is run more than once, it won't process elements that have been processed before.
  
  Example:
  ========
  <div key:tab="personal-projects">
    <div class="tabs">
      <div class="tab" update:tab="personal-projects">Personal Projects</div>
      <div class="tab" update:tab="my-projects">My Projects</div>
      <div class="tab" update:tab="other-projects">Other Projects</div>
    </div>
    <hr>
    <div class="content">
      <div show-if="tab=personal-projects tab=my-projects">Personal and my projects content</div>
      <div show-if="tab=other-projects">Other projects content</div>
      <div show-if="tab=other-projects">Other projects content</div>
    </div>
  </div>
  
  Tips
  ====
  - Has support for showing elements as `display: flex`. Just use `flex-show-if` instead of `show-if`
 
*/
export default function processShowIfAttributes() {
  var showIfElems = Array.from(document.querySelectorAll("[show-if],[flex-show-if]"));
  // don't process elements more than once
  var filterOutProcessed = showIfElems.filter(el => !el._processedByShowIf);

  // will be: ["tab=personal-projects", "tab=my-projects", "tab=other-projects"]
  var keyValuesStrings = [];
  filterOutProcessed.forEach(el => {
    if (el.hasAttribute("show-if")) {
      keyValuesStrings = keyValuesStrings.concat(el.getAttribute("show-if").split(" "));
    }
    if (el.hasAttribute("flex-show-if")) {
      keyValuesStrings = keyValuesStrings.concat(el.getAttribute("flex-show-if").split(" "));
    }
    el._processedByShowIf = true;
  });

  // e.g ["tab=personal-projects", "tab=my-projects", "tab=other-projects"]
  var uniqueValues = Array.from(new Set(keyValuesStrings));

  if (uniqueValues.length) {
    // e.g. ["tab", ["personal-projects", "my-projects"]]
    var keysAndValuesSeparate = uniqueValues.map(str => str.split("="));
    var showIfStyles = keysAndValuesSeparate
      .map(
        val =>
          `[key\\:${val[0]}="${val[1]}"] [show-if~="${val[0]}=${val[1]}"], [temporary\\:key\\:${val[0]}="${val[1]}"] [show-if~="${val[0]}=${val[1]}"] {display: block;} `
      )
      .join("");
    showIfStyles += showIfStyles.replace(/show-if/g, "flex-show-if").replace(/block/g, "flex");
    var styleHtml = `<style>[show-if], [flex-show-if] {display: none;} ${showIfStyles}</style>`;
    document.head.insertAdjacentHTML("beforeend", styleHtml);
  }
}
