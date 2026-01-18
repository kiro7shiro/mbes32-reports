import { Control } from '../src/Control.js'
import { EventData } from '../src/EventData.js'
import { EventsGanttChart } from '../src/EventsGanttChart.js'
import { EventInfos } from '../src/EventInfos.js'
async function app() {
    // controls
    const menuBar = await Control.build('MenuBar', {}, '#menuBar', ['click', 'change'])
    const mergeFiles = await Control.build('MergeFiles', {}, '#mergeFiles')
    // events
    menuBar.on('aboutClick', function () {
        window.alert('kiro7shiro 2026')
    })
    mergeFiles.on('addFile', function (event) {
        console.log(event)
        const input = document.createElement('input')
        input.type = 'file'

        input.onchange = (e) => {
            const file = e.target.files[0]
            console.log(file)
            console.log(file.mozFullPath)
        }

        input.click()
    })
    const eventInfos = await EventInfos.build({ container: '#eventInfos' })
    const resp = await fetch(new URL('data', window.origin))
    const eventsData = (await resp.json()).map((d) => new EventData(d))
    const ganttChart = await EventsGanttChart.build(eventsData, {
        container: '#ganttChart',
        options: {
            container_height: 600,
            popup_on: 'hover',
            view_mode: 'Day'
        }
    })
    ganttChart.on('eventBarClick', async function (event) {
        const { detail: id } = event
        const { tasks: eventsData } = ganttChart.chart
        const eventData = eventsData.find(function (data) {
            return data.id === id
        })
        console.log(eventData)
        const resp = await fetch(new URL(`data/files/${eventData.matchcode}`, window.origin))
        const { files } = await resp.json()
        console.log(files)
        eventData.files = files
        await eventInfos.render(eventData)
    })
    window.app = { ganttChart, eventInfos, mergeFiles }
}

app()
