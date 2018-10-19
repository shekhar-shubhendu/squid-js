import * as jayson from "jayson"
import {Client} from "jayson"
import {URL} from "url"
import Logger from "../utils/Logger"

function add0xPrefix(key) {
    return key.startsWith("0x") ? key : "0x" + key
}

export default class ParityClient {

    private rpcClient: Client

    constructor(private url: string, private address: string, private password: string) {
        this.rpcClient = jayson.Client.http(new URL(this.url))
    }

    public async signKeyId(keyId): Promise<string> {
        return this.sendJsonRpcRequest(this.rpcClient,
            "secretstore_signRawHash",
            [this.address, this.password, add0xPrefix(keyId)])
            .then((result: string) => {
                Logger.log("fu", result)
                return result
            })

    }

    public generateDocumentKeyFromKey(serverKey) {
        return this.sendJsonRpcRequest(this.rpcClient,
            "secretstore_generateDocumentKey",
            [this.address, this.password, serverKey])
            .then((result: string) => {
                return result
            })

    }

    public encryptDocument(encryptedKey, document: string) {
        // `document` must be encoded in hex when sent to encryption
        return this.sendJsonRpcRequest(this.rpcClient, "secretstore_encrypt",
            [this.address, this.password, encryptedKey,
                add0xPrefix(new Buffer(document).toString("hex"))])
            .then((result: string) => {
                return result
            })
    }

    public decryptDocument(decryptedSecret, commonPoint, decryptShadows, encryptedDocument) {
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
            rpcClient.request(
                methodName,
                paramsList,
                (err, response) => {
                    const error = response.error || err
                    if (error) {
                        Logger.error("JSON RPC call failed:", error)
                        Logger.error(`Method ${methodName}`)
                        return reject(error)
                    }
                    return resolve(response.result.toString())
                })
        })
    }
}