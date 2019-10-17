var store = {
  state: {
    isMultiTenant: false,
    newItemTemplates: {}
  },
  isMultiTenant () {
    return this.state.isMultiTenant;
  },
  enableMultiTenantArchitecture () {
    this.state.isMultiTenant = true;
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