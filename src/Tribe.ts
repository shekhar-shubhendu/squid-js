import Web3Helper from "./keeper/Web3Helper";

export default class Tribe {

    public static getInstance(web3Helper: Web3Helper) {

        return new Tribe(web3Helper);
    }

    private web3Helper: Web3Helper;

    private constructor(web3Helper: Web3Helper) {

        this.web3Helper = web3Helper;
    }

    // did ddo for tribes/marketplaces
    public registerTribe() {
        return "";
    }

    public tribessList() {
        return "";
    }

    public resolveTribeDID() {
        // verify DDO
        return "DDO";
    }
}
