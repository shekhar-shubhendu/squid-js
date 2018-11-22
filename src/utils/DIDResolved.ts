/*

DIDResolver module to resolve Ocean DID's off the block chain

*/

// import DIDRegistry from "../keeper/contracts/DIDRegistry"
import DIDRecord from "../models/DIDRecord"
// import ValueType from "../models/ValueType"

// import * as Web3 from "web3"
import * as DIDTools from "../utils/DIDTools"

export default class DIDResolved {
    public items: DIDRecord[]
    public value: string

    public constructor() {
        this.items = []
    }

    public addData(data: DIDRecord) {
        this.items.push(data)
    }
    public hopCount(): number {
        return this.items.length
    }
    public getLastItem(): DIDRecord {
        let result: DIDRecord = null
        if ( this.items.length > 0 ) {
            result = this.items[this.items.length - 1]
        }
        return result
    }

    public isURL(): boolean {
        const item = this.getLastItem()
        return item && item.valueType === "URL"
    }

    public isDDO(): boolean {
        const item = this.getLastItem()
        return item && item.valueType === "DDO"
    }

    public isDID(): boolean {
        const item = this.getLastItem()
        return item && (item.valueType === "DID"  || item.valueType === "DIDRef")
    }

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
    
    public isDIDIdVisited(didId: string): boolean {
        for ( let item of this.items) {
            if ( item.didId === didId ) {
                return true
            }
        }
        return false
    }
}
