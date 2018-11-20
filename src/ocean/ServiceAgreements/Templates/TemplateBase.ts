import Method from "../Method"

export default abstract class TemplateBase {
    public Methods: Method[]
    public templateName: string
    public fulfilmentOperator: number = 0
    public id: string = "0x00000000000000000000000000000000000000000000000000000000000000"
}
