import {assert} from "chai"
import AquariusProvider from "../../src/aquarius/AquariusProvider"
import ConfigProvider from "../../src/ConfigProvider"
import ContractHandler from "../../src/keeper/ContractHandler"
import AccessStatus from "../../src/models/AccessStatus"
import Account from "../../src/ocean/Account"
import Asset from "../../src/ocean/Asset"
import Ocean from "../../src/ocean/Ocean"
import Order from "../../src/ocean/Order"
import config from "../config"
import AquariusMock from "../mocks/Aquarius.mock"
import * as AccessToken from "../testdata/AccessToken.json"

const testName = "Order Test Asset"
const testDescription = "This asset is pure owange"
const testPrice = 100
const timeout = 1000000

let ocean: Ocean
let testAsset: Asset
let accounts: Account[]
let testPublisher: Account
let testConsumer: Account

describe("Order", () => {

    before(async () => {
        ConfigProvider.setConfig(config)
        AquariusProvider.setAquarius(new AquariusMock(config))
        await ContractHandler.deployContracts()
        ocean = await Ocean.getInstance(config)
        accounts = await ocean.getAccounts()
        testPublisher = accounts[0]
        testConsumer = accounts[1]
        // register an asset to play around with
        testAsset = new Asset(testName, testDescription, testPrice, testPublisher)
        await ocean.register(testAsset)
    })

    describe("#pay()", async () => {

        it("should pay for an order", async () => {

            const order: Order = await testAsset.purchase(testConsumer, timeout)
            assert(order)

            await order.commit(AccessToken.toString())
            await testConsumer.requestTokens(testAsset.price)
            const paymentId: string = await order.pay(testConsumer)
            assert(paymentId)
        })

    })

    describe("#commit()", async () => {

        it("should commit the order", async () => {

            const order: Order = await testAsset.purchase(testConsumer, timeout)
            assert(order)

            await order.commit(AccessToken.toString())
        })
    })

    describe("#getStatus()", async () => {

        it("should get status Requested on new order", async () => {

            const order: Order = await testAsset.purchase(testConsumer, timeout)
            assert(order)

            const status: AccessStatus = await order.getStatus()
            assert(status === AccessStatus.Requested)
        })

        it("should get status Delivered on commited order", async () => {

            const order: Order = await testAsset.purchase(testConsumer, timeout)
            assert(order)

            await order.commit(AccessToken.toString())

            const status: AccessStatus = await order.getStatus()
            assert(status === AccessStatus.Delivered)
        })
    })

    describe("#consume()", () => {

        it("should consume an asset", async () => {
            const consumerAccount = accounts[5]
            await consumerAccount.requestTokens(testAsset.price)
            // place order - consumer
            const order: Order = await testAsset.purchase(consumerAccount, timeout)
            // commit order - provider
            await order.commit(AccessToken.toString())
            // pay order - consumer
            await order.pay(consumerAccount)
            const url = await order.consume(consumerAccount)
            assert(url)
        })
    })
})
