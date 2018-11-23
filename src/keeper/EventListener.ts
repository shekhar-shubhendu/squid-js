import Event from "./Event"

export default class EventListener {

    private static events: Event[] = []

    public subscribe(contractName: string,
                     eventName: string,
                     filter: any): Event {

        const event = new Event(contractName, eventName, filter)
        EventListener.events.push(event)

        return event
    }

    public unsubscribe(event): boolean {

        EventListener.events = EventListener.events.splice(
            EventListener.events.findIndex((e) => e === event),
            1)

        return true
    }
}
