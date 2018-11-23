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

export default class DIDResolver {

    public didRegistry
    public constructor(didRegistry: DIDRegistry) {
        this.didRegistry = didRegistry
    }

    /*
     *
     * Resolve a DID to an URL/DDO or later an internal/extrenal DID
     *
     * :param did: 32 byte value or DID string to resolver, this is part of the ocean DID did:op:<32 byte value>
     * :param max_hop_count: max number of hops allowed to find the destination URL/DDO
     *
     * :return DIDResolved object: URL or DDO of the resolved DID
     * :return null: if the DID cannot be resolved
     *
     */
    public async resolve(did: string, maxHopCount?: number): Promise<DIDResolved> {

        maxHopCount = maxHopCount ? maxHopCount : 0

        let didId = DIDTools.didToId(did)
        const resolved = new DIDResolved()

        let data: DIDRecord = await this.getDID(didId)
        while ( data && (maxHopCount === 0 || resolved.hopCount() < maxHopCount) ) {
            // need to search after the result
            if ( resolved.isDIDIdVisited(data.didId) ) {
                // error circular ref
                // TODO: raise an error
                break
            }
            resolved.addData(data)

            didId = null
            if (data.valueType === ValueType.URL || data.valueType === ValueType.DDO ) {
                data = null
                break
            } else {
                if ( data.value.match(/^[0-9a-fA-FxX]+/) ) {
                    // get the hex value of the chain
                    didId = Web3.utils.toHex("0x" + data.value.replace(/^0x/, "")).substring(2)
                } else if ( data.value.match(/^did:op/) ) {
                    // if the DID value is another Ocean DID then get the id
                    didId = DIDTools.didToId(data.value)
                } else {
                    // somethings wrong with this value, so stop
                    break
                }
                // only look if we have another id to find
                if ( didId ) {
                    data = await this.getDID(didId)
                } else {
                    data = null
                }
            }
        }
        return resolved
    }

    /*
     * Internal method to get the actual DID record
     *
     * :param didId: 32 byte id to find
     *
     * :return DIDRecord of the found DID, if not then return null
     */
    private async getDID(didId): Promise<DIDRecord> {

        let record: DIDRecord = null

        const blockNumber: number = await this.didRegistry.getUpdateAt(didId)
        const filterOwner: string = await this.didRegistry.getOwner(didId)
        assert(blockNumber > 0 )

        // filter on the blockNumber, owner and didId
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
            // only get the last event, since this should be the latest
            const event = events[events.length - 1]
            record = {
                didId: event.returnValues.did,
                blockNumber: event.returnValues.updateAt,
                owner: event.returnValues.owner,
                // crazy.. convert from a string number -> enum string -> enum number ( sigh )
                valueType:  ValueType[ValueType[event.returnValues.valueType]],
                key: event.returnValues.key,
                value: event.returnValues.value,
            } as DIDRecord
        }
        return record
    }
}
