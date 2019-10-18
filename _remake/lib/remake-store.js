var store = {
  state: {
    newItemTemplates: {}
  },
  isMultiTenant () {
    return process.env.REMAKE_MULTI_TENANT === "true";
  },
  isDevelopmentMode () {
    return process.env.NODE_ENV === "development";
  },
  addNewItemRenderFunction({name, func, appName} = {}) {
    if (!name || !func) {
      return;
    }

    if (!this.state.isMultiTenant) {
      appName = "_app";
    }

    if (!this.state.newItemTemplates[appName]) {
      this.state.newItemTemplates[appName] = {};
    }

    this.state.newItemTemplates[appName][name] = func;
  },
  getNewItemRenderFunction({name, appName}) {
    let newItemTemplates = this.state.newItemTemplates;

    if (!this.state.isMultiTenant) {
      appName = "_app";
    }

    if (newItemTemplates[appName] && newItemTemplates[appName][name]) {
      return newItemTemplates[appName][name];
    }
  }
};

export default store;