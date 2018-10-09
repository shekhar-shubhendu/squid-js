import Keeper from "../keeper/Keeper"

export default class OceanBase {

    protected keeper: Keeper

    constructor(keeper: Keeper) {
        this.keeper = keeper
    }
}