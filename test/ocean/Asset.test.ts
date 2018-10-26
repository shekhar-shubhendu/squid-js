import {assert} from "chai"
import AquariusProvider from "../../src/aquarius/AquariusProvider"
import ConfigProvider from "../../src/ConfigProvider"
import ContractHandler from "../../src/keeper/ContractHandler"
import Account from "../../src/ocean/Account"
import Asset from "../../src/ocean/Asset"
import Ocean from "../../src/ocean/Ocean"
import Order from "../../src/ocean/Order"
import config from "../config"
import AquariusMock from "../mocks/Aquarius.mock"

const testName = "Test Asset 2"
const testDescription = "This asset is pure owange"
const testPrice = 100
const timeout = 100000

let ocean: Ocean
let testAsset: Asset
let accounts: Account[]
let testPublisher: Account

describe("Asset", () => {

    before(async () => {
        ConfigProvider.setConfig(config)
        AquariusProvider.setAquarius(new AquariusMock(config))

        await ContractHandler.deployContracts()
        ocean = await Ocean.getInstance(config)
        accounts = await ocean.getAccounts()
        testPublisher = accounts[0]
        testAsset = new Asset(testName, testDescription, testPrice, testPublisher)

        await ocean.register(testAsset)
    })

    describe("#purchase()", () => {

        it("should purchase an asset", async () => {

            // todo
            const consumerAccount = accounts[5]
            const order: Order = await testAsset.purchase(consumerAccount, timeout)
            assert(order)
        })
    })
})
