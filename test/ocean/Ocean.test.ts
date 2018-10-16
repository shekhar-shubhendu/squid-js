import * as assert from "assert"
import ConfigProvider from "../../src/ConfigProvider"
import ContractHandler from "../../src/keeper/ContractHandler"
import Account from "../../src/ocean/Account"
import Asset from "../../src/ocean/Asset"
import Ocean from "../../src/ocean/Ocean"
import Logger from "../../src/utils/Logger"
import config from "../config"

let ocean: Ocean
let accounts: Account[]

before(async () => {
    ConfigProvider.configure(config)
    await ContractHandler.deployContracts()
    ocean = await Ocean.getInstance(config)
    accounts = await ocean.getAccounts()
})

describe("Ocean", () => {

    describe("#getAccounts()", () => {

        it("should list accounts", async () => {

            const accs: Account[] = await ocean.getAccounts()

            assert(10 === accs.length)
            assert(0 === (await accs[5].getBalance()).ocn)
            assert("string" === typeof accs[0].getId())
        })

    })

    describe("#register()", () => {

        it("should register an asset", async () => {

            const publisher: Account = accounts[0]

            const name = "Test Asset 3"
            const description = "This asset is pure owange"
            const price = 100

            const asset = new Asset(name, description, price, publisher)

            const finalAsset: Asset = await ocean.register(asset)

            assert(finalAsset.getId().length === 66)
            assert(finalAsset.getId().startsWith("0x"))
            assert(finalAsset.publisher === publisher)
            assert(finalAsset.price === price)
        })
    })

    describe("#getOrdersByConsumer()", () => {

        it("should list orders", async () => {

            // todo
            const orders = await ocean.getOrdersByConsumer(accounts[1])
            Logger.log(orders)
        })

    })

})
