import * as v4 from "uuid/v4"

export default class IdGenerator {
    public static generateId(): string {
        const id = `${v4()}${v4()}`
        return id.replace(/-/g, "")
    }

    public static generatePrefixedId() {
        return "0x" + this.generateId()
    }
}
