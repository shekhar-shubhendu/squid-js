import Keeper from "../keeper/Keeper";

export default class Asset {

    private keeper: Keeper;

    constructor(keeper: Keeper) {
        this.keeper = keeper;
    }

    public isAssetActive(assetId: string): Promise<boolean> {
        const {market} = this.keeper;
        return market.isAssetActive(assetId);
    }

}
