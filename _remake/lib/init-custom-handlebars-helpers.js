import RemakeStore from "./remake-store";

export function initCustomHandlebarsHelpers ({Handlebars}) {

  // forEachItem

  Handlebars.registerHelper('forEachItem', function(context, options) {
    RemakeStore.addNewItemRenderFunction({
      name: options.hash.itemName, 
      func: options.fn
    });

    // contextItem has the data passed into the helper
    let overallRender = context.map(contextItem => {
      
      // move the context item inside the provided name
      let data = {};
      if (options.hash.itemName) {
        data[options.hash.itemName] = contextItem;
      }

      // render the inner template
      let renderedItem = options.fn(data);

      return renderedItem;
    }).join("");
    
    return overallRender;
  });

}



