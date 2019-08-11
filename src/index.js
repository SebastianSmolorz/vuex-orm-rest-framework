import 'core-js/fn/string/includes'
import _Actions from './Actions'
import RestFrameworkApi from './Apis'
import { applyActions } from './utils'

export const plugin = {
  install (components, Api) {
    if (!Api) {
      throw new Error('Must supply a RestFramework instance')
    }
    applyActions(Api, components.Model)
  }
}
export const RestFramework = RestFrameworkApi
export const Actions = _Actions
export const VuexOrmRestFrameworkPlugin = plugin
