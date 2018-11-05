import {assert} from "chai"
import AquariusConnectorProvider from "../../src/aquarius/AquariusConnectorProvider"
import AquariusProvider from "../../src/aquarius/AquariusProvider"
import ConfigProvider from "../../src/ConfigProvider"
import DDO from "../../src/ddo/DDO"
import ContractHandler from "../../src/keeper/ContractHandler"
import Account from "../../src/ocean/Account"
import Asset from "../../src/ocean/Asset"
import Ocean from "../../src/ocean/Ocean"
import ServiceAgreement from "../../src/ocean/ServiceAgreement"
import SecretStoreProvider from "../../src/secretstore/SecretStoreProvider"
import config from "../config"
import AquariusMock from "../mocks/Aquarius.mock"
import AquariusConnectorMock from "../mocks/AquariusConnector.mock"
import SecretStoreMock from "../mocks/SecretStore.mock"

const testName = "Test Asset 2"
const testDescription = "This asset is pure owange"
const testPrice = 100

let ocean: Ocean
let testAsset: Asset
let accounts: Account[]
let testPublisher: Account
let ddo: DDO

describe("Asset", () => {

    before(async () => {
        ConfigProvider.setConfig(config)
        AquariusProvider.setAquarius(new AquariusMock(config))
        SecretStoreProvider.setSecretStore(new SecretStoreMock(config))
        await ContractHandler.deployContracts()
        ocean = await Ocean.getInstance(config)
        accounts = await ocean.getAccounts()
        testPublisher = accounts[0]
        testAsset = new Asset(testName, testDescription, testPrice, testPublisher)

        ddo = await ocean.register(testAsset)

        // @ts-ignore
        AquariusConnectorProvider.setConnector(new AquariusConnectorMock(ddo))
    })

    describe("#purchase()", () => {

        it("should purchase an asset", async () => {

            const consumerAccount = accounts[5]
            const serviceAgreement: ServiceAgreement = await testAsset.purchase(consumerAccount)
            assert(serviceAgreement)
        })

        it("should purchase an asset from two different customers", async () => {

            const consumerAccount1 = accounts[5]
            const serviceAgreement1: ServiceAgreement = await testAsset.purchase(consumerAccount1)
            assert(serviceAgreement1)

            const consumerAccount2 = accounts[6]
            const serviceAgreement2: ServiceAgreement = await testAsset.purchase(consumerAccount2)
            assert(serviceAgreement2)
        })
    })
})
