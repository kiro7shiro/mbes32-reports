export class EventData {
    static defaults= {}
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
        this.halls = data.halls.split(',').map((h) => h.trim()).filter(Boolean)
        this.status = data.status
        this.type = data.type
        this.kind = data.kind
        this.account = data.account
        this.manager = data.manager
        this.espk = data.espk
        this.times = {
            setup: Math.abs(this.eventStart.getTime() - this.start.getTime()),
            event: Math.abs(this.eventEnd.getTime() - this.eventStart.getTime()),
            duration: Math.abs(this.end.getTime() - this.start.getTime())
        }
    }
}
