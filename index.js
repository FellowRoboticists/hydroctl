#!/usr/bin/env node

// Command line client to read sensor values from Arduino

"use strict"

const RobotSerialInterface = require('robot-serial-iface').RobotSerialInterface
const winston = require('winston')

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
