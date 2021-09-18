import SQLite from 'react-native-sqlite-storage'
import Schema from './schema'
import { DBConfig } from './config'

SQLite.DEBUG(false)
SQLite.enablePromise(true)

class DBAdapter {
    async init() {
        try {
            this.instance = await SQLite.openDatabase(DBConfig.path, DBConfig.version, DBConfig.name, DBConfig.maxSize)
        } catch (e) {
            return this.onError(e)
        }
    }

    onError = error => {
        return false
    }

    onData = data => {
        return data
    }

    async drop() {
        try {
            await SQLite.deleteDatabase(Config.path)
            this.instance = null
        } catch (e) {
            return this.onError(e)
        }
    }

    async isDBCreated() {
        try {
            await this.instance.executeSql('select * from cart where 1', []);
            return true
        } catch (e) {
            return false
        }
    }


    async clearDb() {
        try {
            await this.instance.executeSql('DELETE FROM CART', [])
            return true
        } catch (e) {
            return false
        }
    }

    async create() {
        try {
            const queries = Schema.split('#')
            for(let i = 0 ; i < queries.length ; ++i)
                await this.execute(queries[i] , [])
        }
        catch(e) {
            return this.onError(e)
        }
    }

    async insertSingleRecordInTable(query) {
        try {
            let result = await this.instance.executeSql(query , [])
            return result
        }
        catch(e) {
            return false
        }
    }

    async executeGeneralQuery(query) {
        try {
            let result = await this.instance.executeSql(query , [])
            let returnValue = result[0].rows
            return returnValue
        }
        catch(e) {
            return false
        }
    }

    async execute(query , data) {
        try {
            await this.instance.transaction(txn => {
                txn.executeSql(query , data , (tx,res) => {
                    return res
                })
            })
        }
        catch(e) {
            return this.onError(e)
        }
    }
}

const adapter = new DBAdapter
export default adapter