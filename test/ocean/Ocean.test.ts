import {assert} from "chai"
import AquariusProvider from "../../src/aquarius/AquariusProvider"
import SearchQuery from "../../src/aquarius/query/SearchQuery"
import ConfigProvider from "../../src/ConfigProvider"
import DDO from "../../src/ddo/DDO"
import MetaData from "../../src/ddo/MetaData"
import Account from "../../src/ocean/Account"
import Ocean from "../../src/ocean/Ocean"
import SecretStoreProvider from "../../src/secretstore/SecretStoreProvider"
import config from "../config"
import TestContractHandler from "../keeper/TestContractHandler"
import AquariusMock from "../mocks/Aquarius.mock"
import SecretStoreMock from "../mocks/SecretStore.mock"

let ocean: Ocean
let accounts: Account[]
let testPublisher: Account

describe("Ocean", () => {

    before(async () => {
        ConfigProvider.setConfig(config)
        AquariusProvider.setAquarius(new AquariusMock(config))
        SecretStoreProvider.setSecretStore(new SecretStoreMock(config))
        await TestContractHandler.prepareContracts()
        ocean = await Ocean.getInstance(config)
        accounts = await ocean.getAccounts()

        testPublisher = accounts[0]
    })

    describe("#getInstance()", () => {

        it("should get an instance of cean", async () => {

            const oceanInstance: Ocean = await Ocean.getInstance(config)

            assert(oceanInstance)
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

    describe("#registerAsset()", () => {

        it("should register an asset", async () => {

            const metaData: MetaData = new MetaData()
            const ddo: DDO = await ocean.registerAsset(metaData, testPublisher)

            assert(ddo)
            assert(ddo.id.startsWith("did:op:"))
        })
    })

    describe("#searchAssets()", () => {

        it("should search for assets", async () => {

            const query = {
                offset: 100,
                page: 0,
                query: {
                    value: 1,
                },
                sort: {
                    value: 1,
                },
                text: "Office",
            } as SearchQuery

            const assets: any[] = await ocean.searchAssets(query)

            assert(assets)
        })

    })

    describe("#searchAssetsByText()", () => {

        it("should search for assets", async () => {
            const text = "office"
            const assets: any[] = await ocean.searchAssetsByText(text)

            assert(assets)
        })

    })
})
