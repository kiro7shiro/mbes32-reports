#!/usr/bin/env node
const path = require('path')
const express = require('express')
const crypto = require('crypto')

const app = express()
app.use(express.json())
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.locals.settings = {
    eventsFile: path.join(__dirname, '../data/events.xlsx'),
    eventsConfig: path.join(__dirname, '../data/eventsConfig.json'),
    eventsBlacklist: [
        function (data) {
            return Object.keys(data).length === 0
        },
        function (data) {
            return data.matchcode === undefined
        },
        function (data) {
            return data.kind === 'Wartung'
        },
        function (data) {
            const duration = data.end - data.start
            const days = Math.floor(duration / (1000 * 60 * 60 * 24))
            return days >= 364
        }
    ],
    eventDataParsers: [
        function (data) {
            data.id = crypto.randomUUID()
            data.setup = data.setup ?? data.start
            data.eventStart = data.eventStart ?? data.start
            data.eventEnd = data.eventEnd ?? data.start
            data.dismantle = data.dismantle ?? data.start
            data.end = data.end ?? data.start
            data.halls = data.halls ? data.halls.split(',').map((h) => h.trim()) : []
            data.times = {
                setup: Math.abs(data.start.getTime() - data.setup.getTime()),
                event: Math.abs(data.eventStart.getTime() - data.eventEnd.getTime()),
                duration: Math.abs(data.start.getTime() - data.end.getTime())
            }
            return data
        }
    ]
}
app.use('/src', express.static(path.join(__dirname, 'src')))
app.use('/data', require('../api/eventsData.js'))
app.use('/controls', require('../api/controls.js'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, '../node_modules/frappe-gantt/dist')))

module.exports = app
