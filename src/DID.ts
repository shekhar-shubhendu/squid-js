/*

DID Tools to parse/create and convert  DID and ID

*/

import * as Web3 from "web3"
import {URL} from "whatwg-url"

const OCEAN_DID_METHOD = "op"

/*
 * This function generates all types of DID's including ocean DID's
 * 
 * :param didId: string to of the 'id' part of the DID
 * :param path: option path part of the DID
 * :param fragment: option fragment of the DID
 * :param method: option method of the DID, defaults to 'op'
 * 
 * :return string generated DID, in the format did:<method>:<didId>[/<path>][#<fragment>]
 */
export function didGenerate(didId: string, path?: string, fragment?: string, method?: string) {
    method = method === undefined ? OCEAN_DID_METHOD : method
    method = method.toLowerCase().replace(/[^a-z0-9]/g, "")
    didId = didId.replace(/[^a-zA-Z0-9-.]/g, "")
    const did = ["did:", method, ":", didId]
    if (path) {
        did.push("/")
        did.push(path)
    }
    if ( fragment ) {
        did.push("#")
        did.push(fragment)
    }
    return did.join("")
}

interface IDIDParse {
    method: string,
    id: string,
    path?: string,
    fragment?: string,
    idHex?: string,
}

/*
 * The function didParse will parse all types of DID's including Ocean DID
 * If this is a Ocean DID the function will return record with the value
 * `idHex` set to a hex string ( without the leading 0x ).
 * :param did: did string to parse
 * :return ParseRecord
 *      method - method of DID
 *      id - id of the DID
 *      path - path of the DID or null
 *      fragment - fragment of the DID or null
 *      idHex - id as hex string without the leading '0x' or null for non Ocean DID's
 */
export function didParse(did: string): IDIDParse {

    let result: IDIDParse = null
    if ( typeof did !== "string" ) {
        throw TypeError("DID must be a string")
    }
    const match = did.match(/^did:([a-z0-9]+):([a-zA-Z0-9-.]+)(.*)/)
    if ( match ) {

        const url = new URL(match[3], "http://localhost")

        result = {
            method: match[1],
            id: match[2],
            path: url.pathname,
            fragment: url.hash,
            idHex: null,
        }
        if ( result.method === OCEAN_DID_METHOD && result.id.match(/^[0-9A-Fa-f]{1,64}$/) ) {
            result.idHex = Web3.utils.toHex("0x" + result.id).substring(2)
        }
    }
    return result
}

/*
 * Validate a Ocean DID, return true if valid, else false
 * 
 * :param did: string to validate as an Ocean DID
 * :return true if the DID is valid
 */
export function isDIDValid(did: string): boolean {
    const result = didParse(did)
    return result && result.idHex != null
}

/*
 * Function to convert a hex id string to an Ocean DID
 * 
 * :param id: can be a hex string with or without the leading '0x'
 * :param method: if empty, default to 'op'
 * :return a valid DID
 * :return '0' for a 0 DID 
 */
export function idToDID(id: string, method?:string): string {
    method = method === undefined ? OCEAN_DID_METHOD : method
    method = method.toLowerCase().replace(/[^a-z0-9]/g, "")

    // remove any leading 0x
    id = id.replace(/^0x/, "")
    
    // return an empty DID if == 0
    if ( id.match(/^0+$/) ) {
        return "0"
    }
    return "did:" + method + ":" + Web3.utils.toHex("0x" + id).substring(2)
}

/*
 * Function to convert an Ocean DID to an Ocean Id
 * 
 * :param did: string of the did to convert to an Ocean id
 * 
 * :return a hex string, without the leading '0x'
 * :return null if the DID is invalid
 */
export function DIDToId(did: string): string {
    const result = didParse(did)
    if (result && result.idHex ) {
        return result.idHex
    }
    return null
}

export function DIDToIdBytes(did: string): Uint8Array {
    const result = didParse(did)
    if (result && result.idHex) {
        return Web3.utils.hexToBytes("0x" + result.idHex)
    }
    return null
}
