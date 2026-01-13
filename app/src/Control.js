const isSelector = /^[#.]/
export class Control {
    static async build(template, data, container = 'div', events = ['click']) {
        if (isSelector.test(container)) {
            container = document.querySelector(container)
        } else if (typeof container === 'string') {
            container = document.createElement(container)
        }
        const control = new Control(template, data, container, events)
        await control.render(data)
        return control
    }
    static buildOptions(defaults, options) {
        return { ...defaults, ...Object.fromEntries(Object.entries(options).filter(([key, value]) => value !== undefined)) }
    }
    constructor(template, data, container, events = ['click']) {
        this.template = template
        this.data = data
        this.container = container
        // events
        for (const event of events) {
            this.container.addEventListener(event, function (event) {
                const { target } = event
                if (target.hasAttribute('data-event') && target.hasAttribute('data-action')) {
                    const eventType = target.getAttribute('data-event')
                    if (eventType !== event.type) return
                    const action = target.getAttribute('data-action')
                    this.dispatchEvent(new CustomEvent(action, { detail: target }))
                }
            })
        }
    }
    on(event, handler) {
        this.container.addEventListener(event, handler)
    }
    off(event, handler) {
        this.container.removeEventListener(event, handler)
    }
    dispatchEvent(event) {
        this.container.dispatchEvent(event)
    }
    show() {
        this.container.style.display = 'block'
    }
    hide() {
        this.container.style.display = 'none'
    }
    async render(data = null) {
        if (data === null) {
            data = this.data
        } else {
            this.data = data
        }
        const url = new URL(`controls/${this.template}`, window.origin)
        const resp = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        if (!resp.ok) {
            const errorHtml = await resp.text()
            const error = document.createElement('div')
            error.innerHTML = errorHtml
            const pre = error.querySelector('pre')
            throw new Error(`Failed to fetch ${url.pathname}\n${resp.statusText}\n${pre.innerText}`)
            
        }
        const html = await resp.text()
        this.container.innerHTML = html
        return html
    }
}
