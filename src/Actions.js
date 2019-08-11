import qs from 'qs'

export class Action {
  constructor (name, api, url) {
    this.name = name
    this.url = url
    this.model = api.model
    this.api = api
  }

  beforeDispatch () {
  }

  afterDispatch () {
  }

  persist () {}

  onSuccess (requestData, response) {
    return this.persist({ ...requestData, data: response.data })
  }

  onError (error) {
    throw new Error(error)
  }

  dispatch () {
    return new Error('dispatch is abstract')
  }

  transformUrl (urlTemplate, urlParams, queryParams) {
    let url = urlTemplate
    if (urlTemplate.includes(':')) {
      for (const key in urlParams) {
        if (urlParams.hasOwnProperty(key)) {
          url = url.replace(`:${key}`, urlParams[key])
        }
      }
    }
    if (queryParams && Object.keys(queryParams).length > 0) {
      url += '?' + qs.stringify(queryParams)
    }
    return url
  }

  getEndpoint (urlParams, queryParams) {
    const endpoint = this.transformUrl(this.url, urlParams, queryParams)
    return this.api.baseURL + this.api.modelBaseURL + endpoint
  }

  async call (requestData = {}, config = {}) {
    this.beforeDispatch(requestData)
    const response = await this.dispatch(requestData, config)
    this.afterDispatch(requestData, response)
    return response
  }
}

export class Fetch extends Action {
  persist ({ data }) {
    return this.model.insertOrUpdate({ data })
  }

  async dispatch ({ url = {}, params = {} }, config) {
    let response
    try {
      response = await this.api.client.get(this.getEndpoint(url, params), config)
    } catch (error) {
      return this.onError(error)
    }
    const objects = await this.onSuccess({ url, params }, response)
    return { objects, response }
  }
}

export class Retrieve extends Action {
  persist ({ url, data }) {
    return this.model.insertOrUpdate({ where: url.id, data })
  }

  async dispatch ({ url, params = {} }, config) {
    let response
    try {
      response = await this.api.client.get(this.getEndpoint(url, params), config)
    } catch (error) {
      return this.onError(error)
    }
    const objects = await this.onSuccess({ url, params }, response)
    return { objects, response }
  }
}

export class Update extends Action {
  persist ({ data }) {
    return this.model.insertOrUpdate({ data })
  }

  async call (requestData, config) {
    if (!requestData.data) {
      throw new Error(`Must supply data to create calls`)
    }
    return super.call(requestData, config)
  }

  async dispatch ({ url, params = {}, data }, config) {
    let response
    try {
      response = await this.api.client.put(
        this.getEndpoint(url, params),
        data,
        config
      )
    } catch (error) {
      return this.onError(error)
    }
    const objects = await this.onSuccess({ url, params }, response)
    return { objects, response }
  }
}

export class Create extends Update {
  persist ({ data }) {
    return this.model.insert({ data })
  }

  async dispatch ({ url, params = {}, data }, config) {
    let response
    try {
      response = await this.api.client.post(
        this.getEndpoint(url, params),
        data,
        config
      )
    } catch (error) {
      return this.onError(error)
    }
    const objects = await this.onSuccess({ url, params }, response)
    return { objects, response }
  }
}

export class Delete extends Action {
  persist ({ url }) {
    return this.model.delete(url.id)
  }

  async dispatch ({ url, params = {} }, config) {
    let response
    try {
      response = await this.api.client.delete(
        this.getEndpoint(url, params),
        config
      )
    } catch (error) {
      return this.onError(error)
    }
    const objects = await this.onSuccess({ url, params }, response)
    return { objects, response }
  }
}
export default {
  Fetch,
  Retrieve,
  Create,
  Update,
  Delete
}
