import KeeperBase from './keeper/keeper-base'
import MetaData from './metadata'

export default class Service extends KeeperBase {
    constructor(web3Helper, market) {
        super(web3Helper)
        this.market = market
        return (async () => {
            return this
        })()
    }

    serviceMetadata(assetDID) {
        return ''
    }
    serviceTribe() {
        return ''
    }

    createDDO(did, metadata) {
        return {
            '@context': 'https://w3id.org/did/v1',
            id: did,
            publicKey: [],
            authentication: [],
            service: [],
            metadata: metadata
        }
    }

    resolveDID(did) {
        const providerURL = this.market.resolveDID(did)
        const metadataGuy = new MetaData(providerURL)
        return metadataGuy.getAssetDDO(did)
    }
}
