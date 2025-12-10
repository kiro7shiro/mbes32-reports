import { Control } from '../src/Control.js'
import { EventData } from '../src/EventData.js'
import { EventsGanttChart } from '../src/EventsGanttChart.js'
import { EventInfos } from '../src/EventInfos.js'
async function app() {
	const menuBar = await Control.build('MenuBar', {}, '#menuBar', ['click', 'change'])
	menuBar.on('aboutClick', function (event) {
		console.log(event)
	})
	menuBar.on('uploadFile', async function (event) {
		const { detail: uploadFile } = event
		console.log(uploadFile.files)
	})
	menuBar.on('downloadFile', function (event) {
		console.log(event)
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
	window.app = { ganttChart, eventInfos }
}

app()
