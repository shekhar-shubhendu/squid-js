import Logger from "../utils/Logger"
import ParityClient from "./ParityClient"
import SecretStoreClient from "./SecretStoreClient"

export default class SecretStore {

    private partiyClient: ParityClient
    private secretStoreClient: SecretStoreClient

    constructor(config: { secretStoreUrl: string, parityUrl: string, address: string, password: string }) {

        this.partiyClient = new ParityClient(config.parityUrl, config.address, config.password)
        this.secretStoreClient = new SecretStoreClient(config.secretStoreUrl)
    }

    public async generateServerKey(serverKeyId: string): Promise<string> {

        const serverKeyIdSig = await this.partiyClient.signKeyId(serverKeyId)

        Logger.log("serverKeyId:", serverKeyId, "serverKeyIdSig:", serverKeyIdSig)

        const key = await this.secretStoreClient.generateServerKey(serverKeyId, serverKeyIdSig)

        Logger.log("key:", key)

        return key
    }

    public async storeDocumentKey(serverKeyId: string, documentKeyId): Promise<string> {

        const serverKeyIdSig = await this.partiyClient.signKeyId(serverKeyId)
        const documentKeyIdSig = await this.partiyClient.signKeyId(documentKeyId)

        Logger.log("serverKeyId:", serverKeyId, "serverKeyIdSig:", serverKeyIdSig)

        const key = await this.secretStoreClient.storeDocumentKey(
            serverKeyId, serverKeyIdSig,
            documentKeyId, documentKeyIdSig,
        )

        Logger.log("key:", key)

        return key
    }

    public async retrieveDocumentKey(serverKeyId: string): Promise<string> {

        const serverKeyIdSig = await this.partiyClient.signKeyId(serverKeyId)

        Logger.log("serverKeyId:", serverKeyId, "serverKeyIdSig:", serverKeyIdSig)

        const key = await this.secretStoreClient.retrieveDocumentKey(serverKeyId, serverKeyIdSig)

        Logger.log("key:", key)

        return key
    }

}
