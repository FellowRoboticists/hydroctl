hydroctl
========

This project provides the necessary code to capture light, temperature and humidity values from sensors for
my hydroponics project.

There are two primary pieces to this project:

1. An arduino sketch to capture the sensor values and push the readings to the serial port.
2. A NodeJs daemon that will camp out on the serial port and capture the sensor readings.

The idea here is for the Arduino to capture two sets of temp/humidity readings: inside and outside. It will also capture light intensity.

Currently, the NodeJS daemon simply captures the serial readings and logs them. Eventually, the NodeJs daemon will create an RRD (round robin database) to capture the values.

Onward and upward.
