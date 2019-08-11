import axios from 'axios'
import moxios from 'moxios'
import sinon from 'sinon'
import RestFramework from '../src/Apis'
import { applyActions } from '../src/utils'
import {
  Create,
  Delete,
  Fetch,
  Retrieve,
  Update
} from '../src/Actions'


let Axios
let Api

function setup (Model, axiosConfig = { baseURL: 'https://foo.com/' } ) {
    Axios = axios.create(axiosConfig)
    moxios.install(Axios)
    Api = new RestFramework({
      database: { entities: [{ name: 'users', model: Model }] },
      axios: Axios
    })
    applyActions(Api)
    return Api
}

describe('Actions', () => {
  let Model
  let spyInsertOrUpdate
  let spyInsert
  let spyDelete
  let spyUpdate
  beforeEach(() => {
    spyInsertOrUpdate = sinon.spy()
    spyInsert = sinon.spy()
    spyDelete = sinon.spy()
    spyUpdate = sinon.spy()
    Model = {
      insertOrUpdate: spyInsertOrUpdate,
      insert: spyInsert,
      delete: spyDelete,
      update: spyUpdate,
      methodConf: {
        baseURL: 'users',
        methods: {
          fetch: { action: Fetch, url: '/' },
          retrieve: { action: Retrieve, url: '/:id' },
          create: { action: Create, url: '/' },
          delete: { action: Delete, url: '/:id' },
          update: { action: Update, url: '/:id/:foo' },
          updateMulti: {
            action: Create,
            url: '/',
            overrides: {
              persist: function ({ params, data }) {
                return this.model.update({ where: params.ids, data })
              }
            }
          }
        }
      }
    }
    Api = setup(Model)
  })

  afterEach(() => {
    moxios.uninstall(Axios)
  })

  test('Fetch', (done) => {
    const responseData = [
      { "id": 1, "name": "Leanne Graham" },
      { "id": 2, "name": "Ervin Howell" }
    ]
    moxios.stubRequest('https://foo.com/users/?foo=bar&bar=foo',
      {
        status: 200,
        response: responseData
      }
    )
    Model.api().fetch({ params: { foo: 'bar', bar: 'foo' } }).then(() => {
      expect(spyInsertOrUpdate.calledOnce).toBe(true)
      expect(spyInsertOrUpdate.firstCall.args[0].data).toEqual(responseData)
      done()
    })
  })

  test('Retrieve', (done) => {
    const requestData = {
      "name": "Leanne Graham"
    }
    const responseData = {
      "id": 1, ...requestData
    }
    moxios.stubRequest('https://foo.com/users/1?foo=bar&bar=foo',
      {
        status: 200,
        response: responseData
      }
    )
    Model.api().retrieve({
      url: { id: 1 },
      params: { foo: 'bar', bar: 'foo' }
    }).then(() => {
      expect(spyInsertOrUpdate.calledOnce).toBe(true)
      expect(spyInsertOrUpdate.firstCall.args[0].data).toEqual(responseData)
      done()
    })
  })

  test('Create', (done) => {
    const requestData = {
      "name": "Leanne Graham"
    }
    const responseData = {
      "id": 1, ...requestData
    }
    moxios.stubRequest('https://foo.com/users/?foo=bar&bar=foo',
      {
        status: 200,
        response: responseData
      }
    )
    Model.api().create({
      url: { id: 1 },
      params: { foo: 'bar', bar: 'foo' },
      data: requestData
    }).then(() => {
      expect(spyInsert.calledOnce).toBe(true)
      expect(spyInsert.firstCall.args[0].data).toEqual(responseData)
      done()
    })
  })

  test('Delete', (done) => {
    moxios.stubRequest('https://foo.com/users/1?foo=bar&bar=foo',
      {
        status: 200,
        response: {}
      }
    )
    Model.api().delete({
      url: { id: 1 },
      params: { foo: 'bar', bar: 'foo' }
    }).then(() => {
      expect(spyDelete.calledOnce).toBe(true)
      expect(spyDelete.firstCall.args[0]).toEqual(1)
      done()
    })
  })

  test('Update', (done) => {
    const requestData = {
      "name": "Leanne Graham"
    }
    const responseData = {
      "id": 1, ...requestData
    }
    moxios.stubRequest('https://foo.com/users/1/bar',
      {
        status: 200,
        response: responseData
      }
    )
    Model.api().update({
      url: { id: 1, foo: 'bar' },
      data: requestData
    }).then(() => {
      expect(spyInsertOrUpdate.calledOnce).toBe(true)
      expect(spyInsertOrUpdate.firstCall.args[0].data).toEqual(responseData)
      done()
    })
  })

  test('UpdateMulti readme example', (done) => {
    const requestData = {
      "status": "deactivated"
    }
    const ids = [1, 2, 3]
    moxios.stubRequest('https://foo.com/users/?ids%5B0%5D=1&ids%5B1%5D=2&ids%5B2%5D=3',
      {
        status: 200,
        response: requestData
      }
    )
    Model.api().updateMulti({
      params: { ids },
      data: requestData
    }).then(() => {
      expect(spyUpdate.calledOnce).toBe(true)
      expect(spyUpdate.firstCall.args[0]).toEqual(
        {
          where: ids,
          data: {
            status: 'deactivated'
        }
        })
        done()
    })
  })
})

describe('Overrides', () => {
  let Model
  let spy = sinon.spy()
  beforeEach(() => {
    Model = {
      methodConf: {
        baseURL: 'users',
        methods: {
          update: {
            action: Update,
            url: '/:id',
            overrides: {
              persist: spy
            }
          }
        }
      }
    }
    Api = setup(Model)
  })
  test('Overrides', (done) => {
    const requestData = {
      "name": "Leanne Graham"
    }
    const responseData = {
      "id": 1, ...requestData
    }
    moxios.stubRequest('https://foo.com/users/1',
      {
        status: 200,
        response: responseData
      }
    )
    Model.api().update({
      url: { id: 1 },
      data: requestData,
      params: {}
    }).then(() => {
      expect(spy.firstCall.args[0]).toStrictEqual({
        url: { id: 1 },
        data: responseData,
        params: {}
      })
      done()
    })
  })
})



