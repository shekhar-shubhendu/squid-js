import * as jayson from "jayson"
import {Client} from "jayson"
import {URL} from "url"
import Logger from "../utils/Logger"
import DocumentKeys from "./DocumentKeys"

function add0xPrefix(key) {
    return key.startsWith("0x") ? key : "0x" + key
}

export default class ParityClient {

    private address: string
    private password: string
    private rpcClient: Client

    constructor(config: { url: string, address: string, password: string }) {
        this.password = config.password
        this.address = config.address
        this.rpcClient = jayson.Client.http(new URL(config.url))
    }

    public async signKeyId(keyId): Promise<string> {
        return this.sendJsonRpcRequest(this.rpcClient,
            "secretstore_signRawHash",
            [this.address, this.password, add0xPrefix(keyId)])
            .then((result: string) => {
                return result
            })
    }

    public async generateDocumentKeyFromKey(serverKey: string): Promise<any> {
        return this.sendJsonRpcRequest(this.rpcClient,
            "secretstore_generateDocumentKey",
            [this.address, this.password, serverKey])
            .then((result: any) => {
                return {
                    commonPoint: result.common_point,
                    encryptedKey: result.encrypted_key,
                    encryptedPoint: result.encrypted_point,
                } as DocumentKeys
            })
    }

    public encryptDocument(encryptedKey, document: any): Promise<string> {
        // `document` must be encoded in hex when sent to encryption
        return this.sendJsonRpcRequest(this.rpcClient, "secretstore_encrypt",
            [this.address, this.password, encryptedKey,
                add0xPrefix(new Buffer(JSON.stringify(document)).toString("hex"))])
            .then((result: string) => {
                return result
            })
    }

    public decryptDocument(decryptedSecret: string, commonPoint: string,
                           decryptShadows: string, encryptedDocument: string): Promise<any> {
        return this.sendJsonRpcRequest(this.rpcClient,
            "secretstore_shadowDecrypt",
            [this.address, this.password, decryptedSecret,
                commonPoint, decryptShadows, encryptedDocument])
            .then((result: string) => {
                return result
            })
    }

    private sendJsonRpcRequest(rpcClient: Client, methodName: string, paramsList: any[]) {
        return new Promise((resolve, reject) => {
            rpcClient.request(methodName, paramsList,
                (err, response) => {
                    const error = response.error || err
                    if (error) {
                        Logger.error("JSON RPC call failed:", error)
                        Logger.error(`Method ${methodName}`)
                        return reject(error)
                    }
                    return resolve(response.result)
                })
        })
    }
}