import Event from "./Event"
import Parameter from "./Parameter"

export default class Condition {
    public contractName: string = "AccessCondition"
    public methodName: string = "lockPayment"
    public timeout: number = 0
    public conditionKey: string = "0x12122434"
    public parameters: Parameter[]
    public events: Event[]
    public dependencies: string[] = []
    public dependencyTimeoutFlags: number[] = []
    public isTerminalCondition: boolean = false
}
