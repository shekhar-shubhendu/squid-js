import Query from "./Query"
import Sort from "./Sort"

export default class SearchQuery {
    public offset: number = 100
    public page: number = 0
    public query: Query = {
        value: 1,
    } as Query
    public sort: Sort = {
        value: 1,
    } as Sort
    public text: string = "Office"
}
