var store = {
  state: {
    newItemTemplates: {},
    initialRun: true,
  },
  isMultiTenant() {
    return isTruthy(process.env.REMAKE_MULTI_TENANT);
  },
  // NODE_ENV is set to "development" when `npm run dev` is run
  isDevelopmentMode() {
    return process.env.NODE_ENV === "development";
  },
  isAutoReloadEnabled() {
    return !isTruthy(process.env.DISABLE_LIVE_RELOAD) && this.isDevelopmentMode();
  },
  isGeneratingUniqueIdsEnabled() {
    return isTruthy(process.env.GENERATE_UNIQUE_IDS);
  },
  addNewItemRenderFunction({ name, func, appName } = {}) {
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
  getNewItemRenderFunction({ name, appName }) {
    let newItemTemplates = this.state.newItemTemplates;

    if (!this.state.isMultiTenant) {
      appName = "_app";
    }

    if (newItemTemplates[appName] && newItemTemplates[appName][name]) {
      return newItemTemplates[appName][name];
    }
  },
  isInitialRun() {
    return this.state.initialRun;
  },
  setNotInitialRun() {
    this.state.initialRun = false;
  },
};

function isTruthy (optionToTest) {
  let truthyValues = ["true", true];
  return truthyValues.includes(optionToTest);
}

export default store;
