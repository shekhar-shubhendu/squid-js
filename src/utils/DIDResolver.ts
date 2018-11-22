/*

    DIDResolver module to resolve Ocean DID's off the block chain

*/
import {assert} from "chai"
import DIDRecord from "../models/DIDRecord"
import DIDResolved from "./DIDResolved"

import DIDRegistry from "../keeper/contracts/DIDRegistry"
import ValueType from "../models/ValueType"

import * as Web3 from "web3"
import * as DIDTools from "../utils/DIDTools"

/*
 *
 * Resolve a DID to an URL/DDO or later an internal/extrenal DID
 * :param did: 32 byte value or DID string to resolver, this is part of the ocean DID did:op:<32 byte value>
 * :param max_hop_count: max number of hops allowed to find the destination URL/DDO
 * :return DIDResolved object: URL or DDO of the resolved DID
 * :return null: if the DID cannot be resolved
 *
 */
export default class DIDResolver {

    public didRegistry
    public constructor(didRegistry: DIDRegistry) {
        this.didRegistry = didRegistry
    }

    public async resolve(did: string, maxHopCount?: number): Promise<DIDResolved> {

        maxHopCount = maxHopCount ? maxHopCount : 0

        let didId = DIDTools.didToId(did)
        const resolved = new DIDResolved()
        let data: DIDRecord = await this.getDID(didId)
        while ( data && (maxHopCount === 0 || resolved.hopCount() < maxHopCount) ) {
            resolved.addData(data)
            if (data.valueType === "URL" || data.valueType === "DDO" ) {
                data = null
                break
            } else {
                if ( data.value.match(/^[0-9a-fA-Fx]+/) ) {
                    // get the hex value of the chain
                    didId = Web3.utils.toHex("0x" + data.value.replace(/^0x/, "")).substring(2)
                } else if ( data.value.match(/^did:op/) ) {
                    // if the DID value is another Ocean DID then get the id
                    didId = DIDTools.didToId(data.value)
                } else {
                    // check for unusall values in the 'DID' record, http, ftp, {xxx
                    data = null
                    break
                }
                data = await this.getDID(didId)
            }
        }
        return resolved
    }

    public async getDID(didId): Promise<DIDRecord> {

        let record: DIDRecord = null

        const blockNumber: number = await this.didRegistry.getUpdateAt(didId)
        const filterOwner: string = await this.didRegistry.getOwner(didId)
        assert(blockNumber > 0 )

        // filter on the blockNumber only
        const filterOptions = {
            fromBlock: blockNumber,
            toBlock: blockNumber,
            filter: {
                did: Web3.utils.toHex("0x" + didId),
                owner: filterOwner,
            },
        }
        const events = await this.didRegistry.getEventData("DIDAttributeRegistered", filterOptions)
        if ( events && events.length > 0 ) {
            const event = events[events.length - 1]
            record = {
                didId: event.returnValues.did,
                blockNumber: event.returnValues.updateAt,
                owner: event.returnValues.owner,
                valueType: ValueType[event.returnValues.valueType],
                key: event.returnValues.key,
                value: event.returnValues.value,

            } as DIDRecord
        }
        return record
    }
}
