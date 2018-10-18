import ContractWrapperBase from "../../src/keeper/ContractWrapperBase"

export default class ContractWrapperBaseMock extends ContractWrapperBase {
    public async initMock() {
        this.init()
    }

    public async callMock(name: string, args: any[], from?: string) {
        return this.call(name, args, from)
    }

    public async sendMock(name: string, from: string, args: any[]) {
        return this.sendTransaction(name, from, args)
    }
}
