var store = {
  state: {
    isMultiTenant: false,
    newItemRenderFunctions: {}
  },
  isMultiTenant () {
    return this.state.isMultiTenant;
  },
  enableMultiTenantArchitecture () {
    this.state.isMultiTenant = true;
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