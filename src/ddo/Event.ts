import EventHandlers from "./EventHandlers"

export default class Event {
    public name: string
    public actorType: string[]
    public handlers: EventHandlers
}
