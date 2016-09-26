#!/usr/bin/env node

// Command line client to read sensor values from Arduino

"use strict"

const rrd = require('rrdtools')
const fs = require('fs')
const RobotSerialInterface = require('robot-serial-iface').RobotSerialInterface
const winston = require('winston')

const rrdDataFile = 'readings.rrd'
const STEP = 300
const ENOENT = 2

winston.level = process.env.LOG_LEVEL || 'info'

winston.log('debug', 'Starting the robot serial interface')
let robot = new RobotSerialInterface()

robot.on('light', (light) => {
  winston.log('debug', 'Light value: %d', light)
})

robot.on('humidity1', (h) => {
  winston.log('debug', 'Humidity 1 value %d', h)
})

robot.on('humidity2', (h) => {
  winston.log('debug', 'Humidity 2 value %d', h)
})

robot.on('temperature1', (t) => {
  winston.log('debug', 'Temperature 1 value %d', t)
})

robot.on('temperature2', (t) => {
  winston.log('debug', 'Temperature 2 value %d', t)
})

function createRRDFile(fileName) {
  return new Promise((resolve, reject) => {
    rrd.create(
      rrdDataFile,
      STEP,
      now,
      [
       'DS:inside-temp:GAUGE:600:-35:120',
       'DS:outside-temp:GAUGE:600:-35:120',
       'DS:inside-humidity:GAUGE:600:0:100',
       'DS:outside-humidity:GAUGE:600:0:100',
       'DS:inside-light:GAUGE:600:0:1000',
       'RRA:MIN:0.5:12:1440',
       'RRA:MAX:0.5:12:1440',
       'RRA:AVERAGE:0.5:1:1440'
     ], 
     (err) => {
       if (err) return reject(err)
       resolve()
     })
  })
}

function ensureRRDFileExists(fileName) {
  return new Promise((resolve, reject) => {
    fs.stat(fileName, (err, stat) => {
      if (err) {
        if (err.code === ENOENT) {
          createRRDFile(fileName)
            .then(resolve)
            .catch(reject)
        } else {
          reject(err)
        }
      } else {
        resolve()
      }
    })
  })
}

ensureRRDFileExists(rrdDataFile)
  .then(() => {
    // Get the robot started 
    robot.start(
      '/dev/ttyACM0',
      {
        baudrate: 9600
      },
      [
        {
          name: 'light',
          startByte: 0x01,
          numBytes: 2
        },
        {
          name: 'humidity1',
          startByte: 0x02,
          numBytes: 2
        },
        {
          name: 'humidity2',
          startByte: 0x03,
          numBytes: 2
        },
        {
          name: 'temperature1',
          startByte: 0x04,
          numBytes: 2
        },
        {
          name: 'temperature2',
          startByte: 0x05,
          numBytes: 2
        }
      ]
    )
  })
