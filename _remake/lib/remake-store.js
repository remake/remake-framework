var store = {
  state: {
    multiTenant: false,
    newItemRenderFunctions: {}
  },
  isMultiTenant () {
    return this.state.multiTenant;
  },
  enableMultiTenantArchitecture () {
    this.state.multiTenant = true;
  },
  addNewItemRenderFunction({name, func} = {}) {
    if (name && func) {
      this.state.newItemRenderFunctions[name] = func;
    }
  },
  getNewItemRenderFunction({name}) {
    if (name && this.state.newItemRenderFunctions[name]) {
      return this.state.newItemRenderFunctions[name];
    }
  }
};

export default store;