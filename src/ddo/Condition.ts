import Parameter from "./Parameter"

export default class Condition {
    public name: string = "lockPayment"
    public timeout: number = 0
    public conditionKey: string
    public parameters: Parameter[]
}
