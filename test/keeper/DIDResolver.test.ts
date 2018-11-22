
import {assert} from "chai"
import ConfigProvider from "../../src/ConfigProvider"
import DIDRegistry from "../../src/keeper/contracts/DIDRegistry"
import Web3Provider from "../../src/keeper/Web3Provider"
import ValueType from "../../src/models/ValueType"
import Account from "../../src/ocean/Account"
import IdGenerator from "../../src/ocean/IdGenerator"
import Ocean from "../../src/ocean/Ocean"
//import Logger from "../src/utils/Logger"
import config from "../config"
import TestContractHandler from "./TestContractHandler"
import DIDResolver from "../../src/DIDResolver"
import * as DIDTools from "../../src/DID"

let ocean: Ocean
let didRegistry: DIDRegistry


describe("DIDResolver", () => {

    before(async () => {
        ConfigProvider.setConfig(config)
        await TestContractHandler.prepareContracts()
        ocean = await Ocean.getInstance(config)
        didRegistry = await DIDRegistry.getInstance()
    })

    describe("register and resolve", () => {

        it("should register an attribute as a new DID and resolve", async () => {
            const testId = IdGenerator.generateId()
            
            const did = DIDTools.idToDID(testId)
            const didId = DIDTools.DIDToId(did)
            const ownerAccount: Account = (await ocean.getAccounts())[0]
            const providerKey = Web3Provider.getWeb3().utils.fromAscii("provider")
            const data = "my nice provider, is nice"
            const receipt = await didRegistry.registerAttribute(didId, ValueType.DID, providerKey,
                data, ownerAccount.getId())
            assert(receipt.status)
            assert(receipt.events.DIDAttributeRegistered)

            const didResolver = new DIDResolver(didRegistry)
            didResolver.resolve(did)

        })
        
    })


})

