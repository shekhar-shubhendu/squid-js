import Method from "../Method"

export default abstract class TemplateBase {
    public Methods: Method[]
    public templateName: string
    public fulfillmentOperator: number = 1
    public id: string = "0x00000000000000000000000000000000000000000000000000000000000000"
}
