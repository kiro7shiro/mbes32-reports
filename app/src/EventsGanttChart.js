import { Control } from './Control.js'

export class EventsGanttChart {
	static async build(eventsData, { template = 'EventsGanttChart', container = 'div', events = ['click'], options = {} } = {}) {
		const control = await Control.build(template, {}, container, events)
		return new EventsGanttChart(control, eventsData, { options })
	}
	static createGradient(eventData, { colors = ['#F00', '#0F0', '#FF0'], opacity = 1 } = {}) {
		const { setup, event, duration } = eventData.times
		const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient')
		gradient.id = `${eventData.id}_gradient`
		const setupStop = setup / duration
		const eventStop = (setup + event) / duration
		const stops = [
			{ offset: 0, color: colors[0] },
			{ offset: setupStop, color: colors[0] },
			{ offset: setupStop, color: colors[1] },
			{ offset: eventStop, color: colors[1] },
			{ offset: eventStop, color: colors[2] },
			{ offset: 1, color: colors[2] }
		]
		stops.forEach(({ offset, color }) => {
			const stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop')
			stop.setAttribute('offset', `${offset * 100}%`)
			stop.setAttribute('stop-color', color)
			stop.setAttribute('stop-opacity', `${opacity}`)
			gradient.appendChild(stop)
		})
		return gradient
	}
	static createProgressGradient(eventData, { colors = ['#F00', '#0F0', '#FF0'], opacity = 1 } = {}) {
		const { setup, event, duration } = eventData.times
		const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient')
		gradient.id = `${eventData.id}_gradient`
		const today = duration * (eventData.progress / 100)
		const setupStop = setup / duration
		const eventStop = (setup + event) / duration
		const stops = []
		if (today < setup) {
			stops.push({ offset: 0, color: colors[0] })
			stops.push({ offset: 1, color: colors[0] })
		} else if (today > setup && today < event) {
			stops.push({ offset: 0, color: colors[0] })
			stops.push({ offset: setupStop, color: colors[0] })
			stops.push({ offset: setupStop, color: colors[1] })
			stops.push({ offset: 1, color: colors[1] })
		} else if (today > event) {
			stops.push({ offset: 0, color: colors[0] })
			stops.push({ offset: setupStop, color: colors[0] })
			stops.push({ offset: setupStop, color: colors[1] })
			stops.push({ offset: eventStop, color: colors[1] })
			stops.push({ offset: eventStop, color: colors[2] })
			stops.push({ offset: 1, color: colors[2] })
		}
		stops.forEach(({ offset, color }) => {
			const stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop')
			stop.setAttribute('offset', `${offset * 100}%`)
			stop.setAttribute('stop-color', color)
			stop.setAttribute('stop-opacity', `${opacity}`)
			gradient.appendChild(stop)
		})
		return gradient
	}
	static getProgress(eventData) {
		const now = Date.now()
		const start = new Date(eventData.start).getTime()
		const end = new Date(eventData.end).getTime()
		if (start > now) return 0
		if (end <= now) return 100
		const todayDiff = end - now
		const duration = end - start
		return 100 - (todayDiff / duration) * 100
	}
	constructor(control, eventsData, { options = {} } = {}) {
		this.control = control
		this.container = control.container
		this.chart = new Gantt(control.container, eventsData, options)
		const { $container: ganttContainer, $header: header, $svg: svg, $side_header: sideHeader, $today_button: todayButton } = this.chart
		this.container = ganttContainer
		// customize appearance
		svg.style.display = 'none'
		const now = new Date()
		for (const eventData of this.chart.tasks) {
			// calc and update progress
			this.chart.update_task(eventData.id, { progress: EventsGanttChart.getProgress(eventData) })
			// insert gradients
			const gradient = EventsGanttChart.createProgressGradient(eventData)
			const liteGradient = EventsGanttChart.createGradient(eventData, { opacity: 0.33 })
			liteGradient.id = `${eventData.id}_lite_gradient`
			svg.insertAdjacentElement('afterbegin', gradient)
			svg.insertAdjacentElement('afterbegin', liteGradient)
			// set progress style
			const bar = document.querySelector('.bar-wrapper[data-id="' + eventData.id + '"] .bar')
			const barProgress = document.querySelector('.bar-wrapper[data-id="' + eventData.id + '"] .bar-progress')
			const text = document.querySelector('.bar-wrapper[data-id="' + eventData.id + '"] .bar-label')
			const end = new Date(eventData.end)
			if (end.getTime() < now.getTime()) {
				bar.style.fill = `url(#${eventData.id}_lite_gradient)`
				barProgress.style.fill = `none`
			} else {
				bar.style.fill = `url(#${eventData.id}_lite_gradient)`
				barProgress.style.fill = `url(#${eventData.id}_gradient)`
			}
			// set label
			text.innerHTML = eventData.matchcode
		}
		svg.style.display = 'block'
		// set table style
		header.classList.add('w3-theme')
		todayButton.classList.add('w3-theme', 'w3-hover-white')
		sideHeader.classList.add('w3-theme')
		const upperTextLabels = header.querySelectorAll('.upper-text')
		for (const label of upperTextLabels) {
			label.classList.add('w3-theme')
		}
		// event handlers
		ganttContainer.addEventListener('click', this.handleGanttChartClick.bind(this))
	}
	handleGanttChartClick(event) {
		const task = event.target.closest('.bar-wrapper')
		if (!task) return
		this.container.dispatchEvent(new CustomEvent('eventBarClick', { detail: task.dataset.id }))
	}
	on(event, handler) {
		this.container.addEventListener(event, handler)
	}
	off(event, handler) {
		this.container.removeEventListener(event, handler)
	}
}
