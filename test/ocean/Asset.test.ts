import {assert} from "chai"
import ConfigProvider from "../../src/ConfigProvider"
import ContractHandler from "../../src/keeper/ContractHandler"
import Account from "../../src/ocean/Account"
import Asset from "../../src/ocean/Asset"
import Ocean from "../../src/ocean/Ocean"
import Order from "../../src/ocean/Order"
import ProviderProvider from "../../src/provider/ProviderProvider"
import config from "../config"
import ProviderMock from "../mocks/Provider.Mock"

const testName = "Test Asset 2"
const testDescription = "This asset is pure owange"
const testPrice = 100
const timeout = 100000

let ocean: Ocean
let testAsset: Asset
let accounts: Account[]
let testPublisher: Account

before(async () => {
    ConfigProvider.configure(config)
    ProviderProvider.setProvider(ProviderMock)

    await ContractHandler.deployContracts()
    ocean = await Ocean.getInstance(config)
    accounts = await ocean.getAccounts()
    testPublisher = accounts[0]
    testAsset = new Asset(testName, testDescription, testPrice, testPublisher)

    await ocean.register(testAsset)
})

describe("Asset", () => {

    describe("#purchase()", () => {

        it("should purchase an asset", async () => {

            // todo
            const consumerAccount = accounts[5]
            const order: Order = await testAsset.purchase(consumerAccount, timeout)
            assert(order)
        })
    })
})
