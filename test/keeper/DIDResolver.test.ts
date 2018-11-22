
import {assert} from "chai"
import ConfigProvider from "../../src/ConfigProvider"
import DIDRegistry from "../../src/keeper/contracts/DIDRegistry"
import Web3Provider from "../../src/keeper/Web3Provider"
import ValueType from "../../src/models/ValueType"
import Account from "../../src/ocean/Account"
import IdGenerator from "../../src/ocean/IdGenerator"
import Ocean from "../../src/ocean/Ocean"
import config from "../config"
import TestContractHandler from "./TestContractHandler"

import * as DIDTools from "../../src/utils/DIDTools"

import DIDResolver from "../../src/utils/DIDResolver"

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
            const didId = DIDTools.didToId(did)
            const ownerAccount: Account = (await ocean.getAccounts())[0]
            const providerKey = Web3Provider.getWeb3().utils.fromAscii("provider")
            const testURL = "http://localhost:5000"
            const receipt = await didRegistry.registerAttribute(didId, ValueType.URL, providerKey,
                testURL, ownerAccount.getId())
            assert(receipt.status)
            assert(receipt.events.DIDAttributeRegistered)

            const didResolver = new DIDResolver(didRegistry)
            assert(didResolver)
            
            const didResolved = await didResolver.resolve(did)
            assert(didResolved)
            assert(didResolved.isURL())
            assert(didResolved.getValue() == testURL)

        })
        it("should register chain of attributes and resolve", async () => {
            const didList: string[] = []
            const chainLength = 10
            const testURL = "http://localhost:5000"
            const ownerAccount: Account = (await ocean.getAccounts())[0]
            const providerKey = Web3Provider.getWeb3().utils.fromAscii("provider")

            for ( let index = 0; index < chainLength; index ++ ) {
                let did = DIDTools.idToDID(IdGenerator.generateId())
                didList.push(did)
            }
            
            for ( let index = 0; index < chainLength - 1; index ++ ) {
                let didId = DIDTools.didToId(didList[index])
                let nextDIDId = DIDTools.didToId(didList[index + 1])
                let receipt = await didRegistry.registerAttribute(didId, ValueType.DID, providerKey,
                    nextDIDId, ownerAccount.getId())
                assert(receipt)
            }
            const didId = DIDTools.didToId(didList[didList.length - 1])
            const receipt = await didRegistry.registerAttribute(didId, ValueType.URL, providerKey,
                testURL, ownerAccount.getId())
            assert(receipt)
        
            const didResolver = new DIDResolver(didRegistry)
            assert(didResolver)
            
            // resolve from the first DID in the chain
            const didResolved = await didResolver.resolve(didList[0])
            assert(didResolved)
            assert(didResolved.isURL())
            assert(didResolved.getValue() == testURL)

        })

    })

})
