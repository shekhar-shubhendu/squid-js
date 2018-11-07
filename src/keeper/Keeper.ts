import OceanAuth from "./contracts/Auth"
import AccessConditions from "./contracts/conditions/AccessConditions"
import OceanMarket from "./contracts/Market"
import ServiceAgreement from "./contracts/ServiceAgreement"
import OceanToken from "./contracts/Token"
import Web3Provider from "./Web3Provider"

export default class Keeper {

    public static async getInstance() {

        if (Keeper.instance === null) {
            Keeper.instance = new Keeper()

            Keeper.instance.market = await OceanMarket.getInstance()
            Keeper.instance.auth = await OceanAuth.getInstance()
            Keeper.instance.token = await OceanToken.getInstance()
            Keeper.instance.serviceAgreement = await ServiceAgreement.getInstance()
            Keeper.instance.accessConditions = await AccessConditions.getInstance()
        }
        return Keeper.instance
    }

    private static instance: Keeper = null

    public token: OceanToken
    public market: OceanMarket
    public auth: OceanAuth
    public serviceAgreement: ServiceAgreement
    public accessConditions: AccessConditions

    public async getNetworkName(): Promise<string> {
        return Web3Provider.getWeb3().eth.net.getId()
            .then((networkId) => {
                let network: string = "unknown"

                switch (networkId) {
                    case 1:
                        network = "Main"
                        break
                    case 2:
                        network = "Morden"
                        break
                    case 3:
                        network = "Ropsten"
                        break
                    case 4:
                        network = "Rinkeby"
                        break
                    case 42:
                        network = "Kovan"
                        break
                    default:
                        network = "development"
                }
                return network
            })
    }
}
