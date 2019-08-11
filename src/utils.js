import { ModelApi } from './Apis'

export function applyActions (Api, Model) {
  Api.database.entities.map(entity => {
    const methodConfs = entity.model.methodConf.methods
    const modelApi = new ModelApi({
      methodConfs,
      baseApi: Api,
      model: entity.model
    })
    Object.assign(entity.model, { api: modelApi.dispatch.bind(modelApi) })
  })
}
