// TODO :
// [ ] : show a list of files for the event
// [ ] : show a list of todos for the event
// [ ] : show a map of the messe gelände
import { Control } from './Control.js'
import { EventData } from './EventData.js'

export class EventInfos {
    static async build({ eventData = EventData.Defaults, template = 'EventInfos', container = 'div' } = {}) {
        const control = await Control.build(template, eventData, container)
        return new EventInfos(control, eventData)
    }
    constructor(control, eventData) {
        this.control = control
        this.container = control.container
        this.eventData = eventData
    }
    async render(eventData) {
        const data = Object.assign({}, EventData.Defaults, this.eventData, eventData)
        const html = await this.control.render(data)
        return html
    }
}
