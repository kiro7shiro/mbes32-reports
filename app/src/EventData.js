export class EventData {
    constructor(data) {
        this.id = crypto.randomUUID()
        this.matchcode = data.matchcode
        this.name = data.name
        this.start = new Date(data.start)
        this.setup = new Date(data.setup ?? data.start)
        this.eventStart = new Date(data.eventStart ?? data.setup)
        this.eventEnd = new Date(data.eventEnd ?? data.eventStart)
        this.dismantle = new Date(data.dismantle ?? data.eventEnd)
        this.end = new Date(data.end ?? data.dismantle)
        if (typeof data.halls !== 'string') data.halls = ''
        this.halls = data.halls.split(',').map((h) => h.trim())
        this.type = data.type
        this.kind = data.kind
        this.times = {
            setup: Math.abs(this.start.getTime() - this.setup.getTime()),
            event: Math.abs(this.eventStart.getTime() - this.eventEnd.getTime()),
            duration: Math.abs(this.start.getTime() - this.end.getTime())
        }
    }
}
