import * as assert from "assert"
import ConfigProvider from "../../src/ConfigProvider"
import ContractHandler from "../../src/keeper/ContractHandler"
import Account from "../../src/ocean/Account"
import Asset from "../../src/ocean/Asset"
import Ocean from "../../src/ocean/Ocean"
import Order from "../../src/ocean/Order"
import Logger from "../../src/utils/Logger"
import config from "../config"

const testName = "Test Asset 333"
const testDescription = "This asset is pure owange"
const testPrice = 100

let ocean: Ocean
let testAsset: Asset
let accounts: Account[]
let testPublisher: Account

before(async () => {
    ConfigProvider.configure(config)
    await ContractHandler.deployContracts()
    ocean = await Ocean.getInstance(config)
    accounts = await ocean.getAccounts()
    testPublisher = accounts[0]
    // register an asset to play around with
    testAsset = new Asset(testName, testDescription, testPrice, testPublisher)
    await ocean.register(testAsset)
})

describe("Order", () => {

    describe("#pay()", () => {

        it("should pay for the order", async () => {

            const order: Order = await testAsset.purchase(accounts[0], 10000)
            assert(order)

            const paymentId: string = await order.pay(accounts[0])
            Logger.log("paymentId", paymentId)
        })

    })

})
