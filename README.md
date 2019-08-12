# Vuex-ORM Axios Rest Framework

Vuex-ORM plugin to enable syncing data to a server using Axios. Define your models, configure some api actions and let the plugin do the...REST

### Requirements
 1. Vuex
 2. Vuex-orm


### Installation

```npm install --save vuex-orm-rest-framework``` 

### Quickstart

```
// store.js
import { YourModel } from './models'
import {
  VuexOrmRestFrameworkPlugin,
  RestFramework
} from 'vuex-orm-rest-framework'


// Vuex/Vuex-ORM setup
Vue.use(Vuex)
const database = new VuexORM.Database()
database.register(YourModel)


// Configure your base api instance.
const Api = new RestFramework({
  database,
  axiosConfig: {
    baseURL: 'https://jsonplaceholder.typicode.com/',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    validateStatus: function (status) {
      return status < 400
    }
    ...rest of your axios config (see https://github.com/axios/axios#request-config)
  }
})

// Modify axios instance if desired
Api.client.interceptors.request.use(function (config) {
    console.log('intercept')
    return config;
  }, function (error) {
    // Do something with request error
    return Promise.reject(error);
  });


// Register plugin with Vuex-ORM
VuexORM.use(VuexOrmRestFramework, Api)
```

```
// models.js
 import { Actions } from 'vuex-orm-rest-framework'

class YourModel extends Model {
  static entity = 'users'

  static fields () {
    return {
      id: this.attr(null),
      name: this.attr('')
    }
  }
  
  static methodConf = {
    baseURL: 'users',
    methods: {
      fetch: {
        action: Actions.Fetch,
        url: '/',
      },
      create: {
        url: '/',
        action: Actions.Create,
      },
      update: {
        url: '/:id',
        action: Actions.Update,
      },
      retrieve: {
        url: '/:id',
        action: Actions.Retrieve,
      },
      delete: {
        url: '/:id',
        action: Actions.Delete,
      }
    }
  }
}
```

Now you are able to access the methods defined in your model methodConf like so:

``` 
// MyComponent.vue
import { YourModel } from './models' 
YourModel.api().fetch() 
```

### Terminology

Action - an api call which results in vuex data being modified.

URL parameters - parameter in a url like an id e.g. server.com/user/{id}

Query parameters - url encoded query params e.g. ?foo=bar 

### API actions

By default there are 5 actions available:
 * Fetch (GET)
 * Retrieve (GET)
 * Delete (DELETE)
 * Create (POST)
 * Update (PUT)
 
To define an api action for a model provide a methodConf on your model.
 
 ```
 import { Actions } from 'vuex-orm-rest-framework'
 class YourModel extends Model {
 static entity = 'users'
 
 ...
 
 static methodConf = {
   baseURL: 'users',
    methods: {
      fetch: {
        url: '/',
        action: Actions.Fetch
      },
      update: {
        url: '/:id',
        action: Actions.Update
      }
      ...
    }
  }
 ```
 
 ##### Urls
 Using the quick start config, urls for an action are built up as follows:
 
 ```
 https://jsonplaceholder.typicode.com/          +         users            +            /
 VuexOrmRestFrameworkPlugin.axiosConfig.baseURL + Model.methodConf.baseURL + Model.methodConf.methods.{action}.url
 ```
 You may notice ```:id``` in the update action url. This will get replaced when you provide
 a url object to your action call.
 
 ### Using actions
 
 To call the action, simply import the model into your Vue component and access it via
 your model's api() method:
 
 ``` YourModel.api().update() ```
 
 #### Requests
 
 Data, URL & query params: 
   
  ``` 
           YourModel.api().update(
             {
               url: { 'id': 1 }, // this replaces :id in your action url
               data: { name: 'Steve' }, // self-explanatory
               params: { 'foo': 'bar' } // query parameters
             },
             { 
               // additional axios config
               headers: { 'Authorization': 'Bearer xyz123' } 
             } 
           )
  ```


#### Responses

Calling actions will return an object containing the response and instances affected by the api call.

e.g. 
``` 
const response = YourModel.api().create({data: { name: 'Steve' }}) 

console.log(response.response)
// returns an axios response:
// { data: {…}, status: 201, statusText: "Created", headers: {…}, config: {…}, request: XMLHttpRequest }

console.log(response.objects)
// returns created Vuex-ORM objects:
// {"users":[{"id":11,"name":"Steve","username":"","email":""}]}
```


### Action lifecycle

 1. call
 2. beforeDispatch
 3. getEndpoint
 4. dispatch
 5. onSuccess/onError 
 6. persist (insert/delete/update)
 7. afterDispatch

Feel free to check the source code for arguments. All these methods can be overridden in your methodConf like so:

```
      ...
      update: {
        url: '/:id',
        action: Actions.Update,
        overrides: {
          onError (error) {
            // custom behaviour
          }
        }
      }
      ...
```

### Customs actions

Using existing actions as a template, you can define any number of custom actions.
Just add a new entry to your model methodConf and override desired methods.

Take this slightly awkward example:

You have some UI with a selectable list of users and a submit button. Selected users are deactivated.
To accomplish this you use an endpoint that takes multiple ids from query parameters 
and updates the corresponding user objects' status via a POST request, 
returning a 200 response and the updated data (status).

By default, the `Create` action uses POST but insertOrUpdate to persist whatever data is returned from the server.
You want to use the query params you sent up in `where`, to use Vuex-ORM's `update` method.
To do this you need to override `persist` as follows:

```
      updateMulti: {
        action: Create,
        url: '/',
        overrides: {
          persist: function ({ params, data, url }) {
            console.log('Overriden persist')
            return this.model.update({ where: params.ids, data })
          }
        }
      }
```



### Browser compatibility
This plugin supports all major browsers including IE 11

### Coming Soon
 * Generic actions - PatchAction, PostAction
 * Pagination
 * Entity-level api context e.g. loading, errors

