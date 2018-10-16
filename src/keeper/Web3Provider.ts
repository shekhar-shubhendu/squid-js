import * as Web3 from "web3"
import ConfigProvider from "../ConfigProvider"
import Logger from "../utils/Logger"

Logger.log("using web3", Web3.version)

export default class Web3Provider {

    public static getWeb3() {
        if (Web3Provider.web3 === null) {
            const config = ConfigProvider.getConfig()
            const web3Provider = config.web3Provider || new Web3.providers.HttpProvider(config.nodeUri)
            Web3Provider.web3 = new Web3(Web3.givenProvider || web3Provider)
        }
        return Web3Provider.web3
    }

    private static web3: Web3 = null
}
