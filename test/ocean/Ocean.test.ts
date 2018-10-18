import {assert} from "chai"
import ConfigProvider from "../../src/ConfigProvider"
import ContractHandler from "../../src/keeper/ContractHandler"
import Account from "../../src/ocean/Account"
import Asset from "../../src/ocean/Asset"
import Ocean from "../../src/ocean/Ocean"
import Order from "../../src/ocean/Order"
import config from "../config"

let ocean: Ocean
let accounts: Account[]
let testAsset: Asset
let testPublisher: Account

const name = "Test Asset 3"
const description = "This asset is pure owange"
const price = 100
const timeout = 100000000

before(async () => {
    ConfigProvider.configure(config)
    await ContractHandler.deployContracts()
    ocean = await Ocean.getInstance(config)
    accounts = await ocean.getAccounts()

    testPublisher = accounts[0]
    testAsset = new Asset(name, description, price, testPublisher)
})

describe("Ocean", () => {

    describe("#getInstance()", () => {

        it("should list accounts", async () => {

            const ocn = Ocean.getInstance(config)

            assert(ocn)
        })

    })

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

            const assetId: string = await ocean.register(testAsset)

            assert(assetId.length === 66)
            assert(assetId.startsWith("0x"))
        })

    })

    describe("#getOrdersByConsumer()", () => {

        it("should list orders", async () => {

            const testConsumer = accounts[1]
            const asset: Asset = new Asset("getOrdersByConsumer test", description, price, testPublisher)

            await ocean.register(asset)

            const order: Order = await asset.purchase(testConsumer, timeout)
            const orders = await ocean.getOrdersByAccount(testConsumer)

            assert(orders.length === 1)
            assert(orders[0].getId() === order.getId())

        })

    })

})
