#!/usr/bin/env node

// Command line client to read sensor values from Arduino

"use strict"

const RobotSerialInterface = require('robot-serial-iface').RobotSerialInterface
const winston = require('winston')

winston.level = process.env.LOG_LEVEL || 'info'

winston.log('debug', 'Starting the robot serial interface')
let robot = new RobotSerialInterface()

robot.on('batch', (values) => {
  winston.log('debug', 'All the sensor values: %j', values)
})

// Force the thing to emit in batch events.
robot.emitBatch()

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
