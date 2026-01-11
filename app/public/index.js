import { Control } from '../src/Control.js'
import { EventData } from '../src/EventData.js'
import { EventsGanttChart } from '../src/EventsGanttChart.js'
import { EventInfos } from '../src/EventInfos.js'
async function app() {
    // controls
    const menuBar = await Control.build('MenuBar', {}, '#menuBar', ['click', 'change'])
    const mergeFiles = await Control.build('MergeFiles', {}, '#mergeFiles', ['click', 'change'])
    const [labelFile1, labelFile2] = document.querySelectorAll('#mergeFiles input[type="text"]')
    mergeFiles.files = []
    mergeFiles.hide()
    // events
    menuBar.on('aboutClick', function (event) {
        window.alert('kiro7shiro 2026')
    })
    menuBar.on('mergeFiles', mergeFiles.show.bind(mergeFiles))
    mergeFiles.on('close', mergeFiles.hide.bind(mergeFiles))
    mergeFiles.on('cancel', mergeFiles.hide.bind(mergeFiles))
    mergeFiles.on('file1', function (event) {
        const [file] = event.detail.files
		console.log(file)
        labelFile1.value = file.name
		mergeFiles.files.push(file)
    })
    mergeFiles.on('file2', function (event) {
        const [file] = event.detail.files
		console.log(file)
        labelFile2.value = file.name
		mergeFiles.files.push(file)
    })
    mergeFiles.on('ok', function (event) {
		console.log(mergeFiles)
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
        await eventInfos.render(eventData)
    })
    window.app = { ganttChart, eventInfos, mergeFiles }
}

app()
