import Axios from 'axios'

export default class RestFramework {
  constructor ({ database, axiosConfig, axios }) {
    if (!database) {
      throw new Error('Must supply Vuex-ORM database to RestFramework config')
    }
    this.database = database
    if (axios) {
      this.client = axios
      this.baseURL = axios.defaults.baseURL
    } else if (axiosConfig) {
      this.client = Axios.create(axiosConfig)
      this.baseURL = axiosConfig.baseURL
    } else {
      throw new Error('Must supply either axiosConfig of axios instance')
    }
    this.apis = {}
  }

  addApi (model, api) {
    this.apis[model.entity] = { model, api }
  }
}

export class ModelApi {
  constructor ({ model, methodConfs, baseApi }) {
    this.model = model
    this.actions = []
    this.methods = {}
    this.baseApi = baseApi
    this.client = this.baseApi.client
    this.modelBaseURL = this.setModelBaseURL()
    this._initActions(methodConfs)
    this.baseApi.addApi(model, this)
  }

  get baseURL () {
    return this.baseApi.baseURL
  }

  dispatch () {
    return this.methods
  }

  setModelBaseURL () {
    if (this.model.methodConf.baseURL) {
      return this.model.methodConf.baseURL
    } else {
      return this.model.entity
    }
  }

  _initActions (methodConfs) {
    for (const key in methodConfs) {
      const methodConf = methodConfs[key]
      const Action = methodConf.action
      const actionInstance = new Action(key, this, methodConf.url)
      if (methodConf.overrides) {
        for (const method in methodConf.overrides) {
          actionInstance[method] = methodConf.overrides[method].bind(actionInstance)
        }
      }
      this.actions[key] = actionInstance
      this.methods[key] = this.actions[key].call.bind(actionInstance)
    }
  }
}
