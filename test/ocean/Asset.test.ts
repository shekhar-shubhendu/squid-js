import * as assert from "assert"
import ConfigProvider from "../../src/ConfigProvider"
import ContractHandler from "../../src/keeper/ContractHandler"
import Account from "../../src/ocean/Account"
import Asset from "../../src/ocean/Asset"
import Ocean from "../../src/ocean/Ocean"
import config from "../config"

const testName = "Test Asset 2"
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
    testAsset = new Asset(testName, testDescription, testPrice, testPublisher)

    await ocean.register(testAsset)
})

describe("Asset", () => {

    describe("#isActive()", () => {

        it("should return true on new asset", async () => {

            const isAssetActive = await testAsset.isActive()
            assert(true === isAssetActive)
        })

        it("should return false on unknown asset", async () => {

            const isAssetActive = await new Asset(testName, testDescription, testPrice, testPublisher)
                .isActive()
            assert(false === isAssetActive)
        })
    })

    describe("#purchase()", () => {

        it("should purchase an asset", async () => {

            // todo
            await testAsset.purchase(accounts[5], 10000)
        })
    })

    describe("#purchase()", () => {

        it("should purchase an asset", async () => {
            // todo
            // await testAsset.finalizePurchaseAsset()
        })
    })
})
