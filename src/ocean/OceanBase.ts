export default abstract class OceanBase {

    protected id = "0x00"

    constructor(id?) {
        if (id) {
            this.id = id
        }
    }

    public getId() {
        return this.id
    }

    public setId(id) {
        this.id = id
    }
}
