/*

DID Tools to parse/create and convert  DID and ID

*/

import * as Web3 from "web3"
import {URL} from "whatwg-url"

const OCEAN_DID_METHOD = "op"

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
            result.idHex = Web3.utils.toHex("0x" + result.id)
        }
    }
    return result
}

export function isDIDValid(did: string): boolean {
    const result = didParse(did)
    return result && result.idHex != null
}
