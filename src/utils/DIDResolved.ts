/*

DIDResolver module to resolve Ocean DID's off the block chain

*/

import DIDRecord from "../models/DIDRecord"
import ValueType from "../models/ValueType"
import * as DIDTools from "../utils/DIDTools"

export default class DIDResolved {
    public items: DIDRecord[]
    public value: string

    public constructor() {
        this.items = []
    }
    /*
     * Add the DIDRecord to the collection of visited DID's
     *
     * :param data: DIDRecord to add
     */
    public addData(data: DIDRecord): void {
        this.items.push(data)
    }

    /*
     * Number of hops performed
     * :return hop count
     */
    public hopCount(): number {
        return this.items.length
    }

    /* Get the last DID record added by the resolver
     *
     * :return DIDRecord of the last resolved item
     */
    public getLastItem(): DIDRecord {
        let result: DIDRecord = null
        if ( this.items.length > 0 ) {
            result = this.items[this.items.length - 1]
        }
        return result
    }

    /*
     * :return true if the resolved result is a URL
     */
    public isURL(): boolean {
        const item = this.getLastItem()
        return item && item.valueType === "URL"
    }

    /*
     * :return true if the resolved result is an on chain DDO
     */
    public isDDO(): boolean {
        const item = this.getLastItem()
        return item && item.valueType === "DDO"
    }

    /*
     * :return true if the resolved result is another DID
     */
    public isDID(): boolean {
        const item = this.getLastItem()
        return item && (item.valueType === "DID"  || item.valueType === "DIDRef")
    }

    /*
     * :return the stored key value for this DID resolved record
     */
    public getKey(): string {
        const item = this.getLastItem()
        if ( item ) {
            return item.key
        }
        return null
    }

    /*
     * :return the owner of the resolved record
     */
    public getOwner(): string {
        const item = this.getLastItem()
        if ( item ) {
            return item.owner
        }
        return null
    }

    /*
     * :return the ValueType ( URL, DDO, DID, DIDRef )
     */
    public getValueType(): ValueType {
        const item = this.getLastItem()
        if ( item ) {
            return item.valueType
        }
        return null
    }

    /*
     * :return the value of the resolved record, if it's a DID
     * this call will return an ocean DID instead of in internal Id.
     */
    public getValue(): string {
        const item = this.getLastItem()
        let result: string = null
        if ( item ) {
            if ( item.valueType === "DID" ) {
                result = DIDTools.idToDID(item.value)
            } else {
                result = item.value
            }
        }
        return result
    }

    /*
     * Used by the resolver to check to see if the DID record has been
     * visited before, to stop circular links.
     *
     * :param didId: 32 byte id that has been visited
     *
     * :return true if this 32 byte value is already in the list of DID records
     */
    public isDIDIdVisited(didId: string): boolean {
        for ( const item of this.items) {
            if ( item.didId === didId ) {
                return true
            }
        }
        return false
    }
}
