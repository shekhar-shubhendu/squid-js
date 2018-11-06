import Method from "../Method"

export default abstract class TemplateBase {
    public Methods: Method[]
    public templateName: string
    public id: string = "0x00000000000000000000000000000000000000000000000000000000000000"

    constructor(id?: string) {
        this.id = id
    }
}
