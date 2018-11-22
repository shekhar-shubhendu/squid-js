/*

DIDResolver module to resolve Ocean DID's off the block chain

*/

import DIDRegistry from "./keeper/contracts/DIDRegistry"
// import Web3Provider from "./keeper/Web3Provider"
// import * as Web3 from "web3"


class DIDResolved {
    public items: string[]
    public value: string
    
    public constructor() {
        this.items = []
    }
    
    public addData(data: string, value: string) {
        this.items.push(data)
    }
}

/*
 * 
 * Resolve a DID to an URL/DDO or later an internal/extrenal DID
 * :param did: 32 byte value or DID string to resolver, this is part of the ocean DID did:op:<32 byte value>
 * :param max_hop_count: max number of hops allowed to find the destination URL/DDO
 * :return DIDResolved object: URL or DDO of the resolved DID
 * :return null: if the DID cannot be resolved
 * :raises TypeError: on non 32byte value as the DID
 * :raises TypeError: on any of the resolved values are not string/DID bytes.
 * :raises OceanDIDCircularReference: on the chain being pointed back to itself.
 * :raises OceanDIDNotFound: if no DID can be found to resolve.
 * 
 */
export default class DIDResolver {
    
    public didRegistry
    public constructor(didRegistry: DIDRegistry) {
        this.didRegistry = didRegistry
    }
    
    public resolve(did: string, maxHopCount?: number): DIDResolved {
        
        return new DIDResolved()
    }
}
