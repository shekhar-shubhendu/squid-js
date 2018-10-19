import fetch from "node-fetch"
import Logger from "../utils/Logger"

function removeLeading0xPrefix(key) {
    return key.startsWith("0x") ? key.replace("0x", "") : key
}

export default class SecretStoreClient {

    constructor(private url: string, private threshold?: number) {
        this.url = url
        this.threshold = threshold || 1
    }

    public async generateServerKey(serverKeyId: string, serverKeyIdSig: string): Promise<string> {

        const url = [
            this.url, "shadow", serverKeyId,
            removeLeading0xPrefix(serverKeyIdSig),
            this.threshold,
        ].join("/")

        const result = await fetch(url, {
            method: "POST",
        })
            .then((response) => {
                if (response.ok) {
                    return response.json()
                }
                throw Error(`Unable to generate Server Key ${response.statusText}`)
            })
            .catch((error) => {
                throw Error(`Unable to generate Server Key: ${error.message}`)
            })

        if (!result) {
            throw Error(`Unable to generate Server Key`)
        }

        return result
    }

    /*
    curl -X POST http://localhost:8082/shadow/
    0000000000000000000000000000000000000000000000000000000000000000/
    de12681e0b8f7a428f12a6694a5f7e1324deef3d627744d95d51b862afc13799251831b3611ae436c452b54cdf5c4e78b361a396ae183e8b4c34519e895e623c00/
    368244efaf441c2dabf7a723355a97b3b86f27bdb2827ae6f34ddece5132efd37af4ba808957b7113b4296bc4ae9ec7be38f9de6bae00504e775883a50d4658a/
    b7ad0603946987f1a154ae7f074e45da224eaa83704aac16a2d43a675d219654cf087b5d7aacce0790a65abbc1a495b26e71a5c6e9a4a71b543bf0048935bc13
     */

    public async storeDocumentKey(serverKeyId: string, serverKeyIdSig: string,
                                  commonPoint: string, encryptedPoint: string) {
        const url = [this.url, "shadow", serverKeyId, removeLeading0xPrefix(serverKeyIdSig),
            removeLeading0xPrefix(commonPoint), removeLeading0xPrefix(encryptedPoint)]
            .join("/")

        Logger.log("url", url)
        const result = await fetch(url, {
            method: "POST",
        })
            .then((response) => {
                if (response.ok) {
                    return response
                }
                throw Error(`Unable to store document Keys ${response.statusText}`)
            })
            .catch((error) => {
                throw Error(`Unable to store document keys: ${error.message}`)
            })

        if (!result) {
            throw Error(`Unable to store document Keys`)
        }

        return result
    }

    public async retrieveDocumentKey(documentKeyId, documentKeyIdSig) {

        const url = [
            this.url, documentKeyId,
            removeLeading0xPrefix(documentKeyIdSig),
        ].join("/")

        Logger.log(url)

        const result = await fetch(url, {
            method: "GET",
        })
            .then((response) => {

                if (response.ok) {
                    return response.json()
                }
                throw Error(`Unable to retrieve decryption Keys ${response.statusText}`)
            })
            .catch((e) => {
                throw Error(`Unable to retrieve decryption keys: ${e.message}`)
            })

        if (!result) {
            throw Error(`Unable to retrieve decryption Keys`)
        }

        // results should have (decrypted_secret, common_point, decrypt_shadows)
        return JSON.parse(result)
    }
}
