// [ ] : show a map of the messe gelände
import { Control } from './Control.js'

export class EventInfos {
    static defaults = {
        matchcode: 'event-infos-matchcode',
        id: 'event-infos-id',
        name: 'event-infos-name',
        start: new Date(),
        end: new Date(),
        halls: []
    }
    static async build({ infos = EventInfos.defaults, template = 'EventInfos', container = 'div' } = {}) {
        const control = await Control.build(template, infos, container)
        return new EventInfos(control, infos)
    }
    constructor(control, infos) {
        this.control = control
        this.container = control.container
        this.infos = infos
    }
    async render(infos) {
        const data = Object.assign({}, EventInfos.defaults, this.infos, infos)
        const html = await this.control.render(data)
        return html
    }
}
