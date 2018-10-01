import KeeperBase from './keeper/keeper-base'

export default class Tribe extends KeeperBase {
    constructor(web3Helper) {
        super(web3Helper)

        return (async () => {
            return this
        })()
    }

    // did ddo for tribes/marketplaces
    registerTribe() {
        return ''
    }

    tribessList() {
        return ''
    }

    resolveTribeDID() {
        // verify DDO
        return 'DDO'
    }
}
