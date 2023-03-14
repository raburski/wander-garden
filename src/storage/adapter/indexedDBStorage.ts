import { Transforms, StorageAdapter } from "../types"
import { openDB, IDBPDatabase } from "idb"

const DEFAULT_PARAMETERS = {
  keyPath: 'id'
}

interface IndexedDBStore<Type> {
  getAll(): Promise<Type[]>
  put(object: Type): Promise<any>
  clear(): Promise<any>
}

class IndexedDBSingleton {
  versions: { [name: string]: number }
  dbs: { [name: string]: IDBPDatabase | undefined }
  stores: { [storeName: string]: IDBObjectStoreParameters }

  constructor() {
    this.versions = {}
    this.dbs = {}
    this.stores = {}
  }

  registerStore<T>(dbName: string, version: number, storeName: string, parameters: IDBObjectStoreParameters): IndexedDBStore<T> {
    if (this.versions[dbName] !== undefined && this.versions[dbName] !== version) {
      throw new Error(`${dbName} DB version inconsistent actoss stores! ${version} vs ${this.versions[dbName]}`)
    }
    this.versions[dbName] = version
    this.stores[storeName] = parameters
    return {
      getAll: () => this.db(dbName).then(db => db.getAll(storeName)),
      put: (object) => this.db(dbName).then(db => db.put(storeName, object)),
      clear: () => this.db(dbName).then(db => db.clear(storeName)),
    }
  }

  db(name: string): Promise<IDBPDatabase> {
    if (!this.dbs[name]) {
      const _stores = this.stores
      const _dbs = this.dbs
      return openDB(name, this.versions[name], {
        upgrade(db, oldVersion, newVersion, transaction, event) {
          console.log('UPGRADE DB TO ', newVersion)
          Object.keys(_stores).forEach(storeName => {
            if (!db.objectStoreNames.contains(storeName)) {
              db.createObjectStore(storeName, _stores[storeName])
            }
          })
        },
        blocked(currentVersion, blockedVersion, event) {
          // …
        },
        blocking(currentVersion, blockedVersion, event) {
          // …
        },
        terminated() {
          _dbs[name] = undefined
        },
      }).then(db => {
        this.dbs[name] = db
        return db
      })
    }
    return Promise.resolve(this.dbs[name]!)
  }
}

const indexedDBSingleton = new IndexedDBSingleton()

export default class IndexedDBStorageAdapter<Type> implements StorageAdapter<Type[]> {
    initialValue: Type[]
    store: IndexedDBStore<Type>

    constructor(initialValue: Type[], dbName: string, storeName: string, version: number = 5, parameters: IDBObjectStoreParameters = DEFAULT_PARAMETERS) {
        this.initialValue = initialValue
        this.store = indexedDBSingleton.registerStore<Type>(dbName, version, storeName, parameters)
    }
    get(): Promise<Type[]> {
      return this.store.getAll()
    }
    set(data: Type[]) {
      return this.clearAll().then(() => Promise.all(data.map(object => this.store.put(object))))
    }
    clearAll() {
      return this.store.clear()
    }
}