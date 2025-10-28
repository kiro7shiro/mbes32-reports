import { EventsGanttChart } from '../src/EventsGanttChart.js'
import { EventInfos } from '../src/EventInfos.js'
async function test() {
    const eventInfos = await EventInfos.build({ container: '#eventInfos' })
    const resp = await fetch(new URL('data', window.origin))
    const eventsData = await resp.json()
    const ganttChart = await EventsGanttChart.build(eventsData, {
        container: '#ganttChart',
        options: {
            container_height: 600,
            popup_on: 'hover',
            view_mode: 'Week'
        }
    })
    ganttChart.on('eventBarClick', async function (event) {
        const { detail: id } = event
        const { tasks: eventsData } = ganttChart.chart
        const eventData = eventsData.find(function (data) {
            return data.id === id
        })
        console.log(eventData)
        await eventInfos.render(eventData)
    })
    window.app = { ganttChart, eventInfos }
}

test()
