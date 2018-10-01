import ContractHandler from "../src/keeper/ContractHandler";
import Keeper from "../src/keeper/Keeper";
import Web3Helper from "../src/keeper/Web3Helper";
import Config from "../src/models/Config";
import Logger from "../src/utils/Logger";

let keeper: Keeper;

before(async () => {
    const config: Config = {nodeUri: "http://localhost:8545"} as Config;
    const web3Helper = new Web3Helper(config);
    await ContractHandler.deployContracts(web3Helper);
    keeper = await Keeper.getInstance(config, web3Helper);
});

describe("Keeper", () => {

    it("should keep", async () => {

        const balance = await keeper.token.getTokenBalance("0xB0EdD05A5874c5c1Fcd6bCB4E52143fB7134b7EE");

        Logger.log(balance);
    });
});
