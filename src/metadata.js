/* global fetch */
import Logger from './utils/logger'

export default class MetaData {
    constructor(providerUri) {
        this.assetsUrl = providerUri + '/assets'
    }

    getAssetDDO(assetDID) {
        return fetch(this.assetsUrl + `/metadata/${assetDID}`, { method: 'GET' })
            .then(res => res.json())
            .then(data => JSON.parse(data))
    }

    getAssetsMetadata() {
        return fetch(this.assetsUrl + '/metadata', { method: 'GET' })
            .then(res => res.json())
            .then(data => JSON.parse(data))
    }

    publishDataAsset(asset) {
        return fetch(this.assetsUrl + '/metadata',
            {
                method: 'POST',
                body: JSON.stringify(asset),
                headers: { 'Content-type': 'application/json' }
            })
            .then(response => {
                Logger.log('Success:', response)
                if (response.ok) {
                    Logger.log('Success:', response)
                    return true
                }
                Logger.log('Failed: ', response.status, response.statusText)
                return false
                // throw new Error(response.statusText ? response.statusText : `publish asset failed with status ${response.status}`)
            })
            .catch(error => {
                Logger.log(`Publish asset to ocean database could not be completed: ${error.message()}`)
                return false
            })
    }
    async publishDataAsset(assetMetadata, price) {
        // Register on-chain (in the keeper)
        const { market } = this.contracts
        const assetDID = await this.generateDID(assetMetadata)
        const result = await market.register(
            assetDID,
            price,
            { from: this.getCurrentAccount(), gas: this.defaultGas }
        )
        if (!result) {
            throw Error('Register asset in ocean keeper failed.')
        }
        // Register in oceandb
        const assetDDO = this.createAssetDDO(assetDID, assetMetadata)
        this.metadata.publishDataAsset(assetDID, assetDDO)
        return assetDDO
    }


}
