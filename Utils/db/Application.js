import Adapter from './adapter'

class Application {

    openDatabase = async () => {
        try {
            await Adapter.init()
            const isDbCreated = await Adapter.isDBCreated()
            if(isDbCreated)
                return true

            await Adapter.drop()
            await Adapter.init()
            await Adapter.create()
            return true
        }
        catch(e) {
            return false
        }
    }

    dropDatabase = async () => {
        try {
            return await Adapter.drop()
        }
        catch(e) {
            return false
        }
    }

    insertSingleRecord = async (query) => {
        let aa = await Adapter.insertSingleRecordInTable(query , [])
        return aa
    }

    executeQuery = async (query) => {
        let result = await Adapter.executeGeneralQuery(query , [])
        return result
    }

    clearCart = async () => {
        let res = await Adapter.executeGeneralQuery(`DELETE FROM CART`)
        return res
    }
}

const instance = new Application()
export default instance