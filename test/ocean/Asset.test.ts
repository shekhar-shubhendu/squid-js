import * as assert from "assert"
import ConfigProvider from "../../src/ConfigProvider"
import ContractHandler from "../../src/keeper/ContractHandler"
import Account from "../../src/ocean/Account"
import Asset from "../../src/ocean/Asset"
import Ocean from "../../src/ocean/Ocean"
import Order from "../../src/ocean/Order"
import ProviderProvider from "../../src/provider/ProviderProvider"
import config from "../config"
import MockProvider from "../MockProvider"

const testName = "Test Asset 2"
const testDescription = "This asset is pure owange"
const testPrice = 100
const timeout = 100000
const accessToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzM4NCJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE1Mzk3ODcxMDEsImV4cCI6NDcyNjk5NjcwNCwiYXVkIjoiIiwic3ViIjoiIiwic2VydmljZV9lbmRwb2ludCI6Imh0dHA6Ly9hZGFzZCIsInJlc291cmNlX2lkIjoiMTIzNDUifQ.2H3TRC3CAToVE9divSckwHi_HNvgOHKrtJPo8128qrKBHTk7YYb0UNfVCuYqwhGR"

let ocean: Ocean
let testAsset: Asset
let accounts: Account[]
let testPublisher: Account

before(async () => {
    ConfigProvider.configure(config)
    ProviderProvider.setProvider(MockProvider)

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
            const consumerAccount = accounts[5]
            const order: Order = await testAsset.purchase(consumerAccount, timeout)
            assert(order)
        })
    })

    describe("#consume()", () => {

        it("should consume an asset", async () => {
            const consumerAccount = accounts[5]
            await consumerAccount.requestTokens(testAsset.price)
            // place order - consumer
            const order: Order = await testAsset.purchase(consumerAccount, timeout)
            // commit order - provider
            await order.commit(accessToken)
            // pay order - consumer
            await order.pay(consumerAccount)
            const url = await testAsset.consume(order, consumerAccount)
            assert(url)
        })
    })
})
