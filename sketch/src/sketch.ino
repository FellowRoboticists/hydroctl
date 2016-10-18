#include "DHT.h"

#define USE_PACKET 1

#if USE_PACKET
#include "Packet.h"
#endif

#define DEBUG 0

// milliseconds of delay on the loop.
// Data collection is every 5 minutes
#define DELAY 60000

// Sensor output constants
#if ! USE_PACKET
#define START_BYTE 0x13

#define ALT_SENSOR_PACKET_LENGTH 18
uint8_t altSensorPacket [ALT_SENSOR_PACKET_LENGTH];
#endif

// Sensor identifier manifest constants
#define LIGHT_SENSOR 0x01
#define HUMIDITY_SENSOR_1 0x02
#define HUMIDITY_SENSOR_2 0x03
#define TEMPERATURE_SENSOR_1 0x04
#define TEMPERATURE_SENSOR_2 0x05

// Sensor settings
#define DHT_1_PIN 2 // Digital pin 2
// #define DHT_2_PIN 3 // Digital pin 3
#define LDR_PIN 0 // Analog pin 0
#define DHTTYPE DHT11

// Set up the temp/humidity sensors
DHT dht1(DHT_1_PIN, DHTTYPE);
// DHT dht2(DHT_2_PIN, DHTTYPE);

#if USE_PACKET
Packet packet;
#endif

void setup()
{
  Serial.begin(9600);

  dht1.begin();
  // dht2.begin();
}

void loop()
{
  int l = analogRead(LDR_PIN);

  float h1 = dht1.readHumidity();
  float t1 = dht1.readTemperature();
  float h2 = 0; // dht2.readHumidity();
  float t2 = 0; // dht2.readTemperature();

  float tf1 = convertFromCtoF(t1);
  float tf2 = convertFromCtoF(t2);

#if DEBUG
  Serial.print("Light = ");
  Serial.println(l);

  Serial.print("T1 = ");
  Serial.println(tf1);
  Serial.print("T2 = ");
  Serial.println(tf2);

  Serial.print("H1 = ");
  Serial.println(h1);
  Serial.print("H2 = ");
  Serial.println(h2);
#endif

#if ! DEBUG
#if USE_PACKET
  packet.reset();
  packet.setSensorValue(HUMIDITY_SENSOR_1, h1);
  packet.setSensorValue(HUMIDITY_SENSOR_2, h2);
  packet.setSensorValue(TEMPERATURE_SENSOR_1, tf1);
  packet.setSensorValue(TEMPERATURE_SENSOR_2, tf2);
  packet.setSensorValue(LIGHT_SENSOR, l);
  packet.completePacket();

  Serial.write(packet.getBuffer(), packet.length());
#else
  sendSensorValues(l, h1, tf1, h2, tf2);
#endif
#endif

  delay(DELAY);
}

float convertFromCtoF(float cValue) {
  return cValue * 1.8 + 32; // Convert fromn C to F
}

#if ! DEBUG
#if ! USE_PACKET
void sendSensorValues(
    uint16_t light, 
    uint16_t humidity1, 
    uint16_t temperature1, 
    uint16_t humidity2, 
    uint16_t temperature2) {
  altSensorPacket[0] = START_BYTE;
  altSensorPacket[1] = 0x0f;
  altSensorPacket[2] = HUMIDITY_SENSOR_1;
  altSensorPacket[3] = humidity1 >> 8;
  altSensorPacket[4] = humidity1 & 0x00ff;
  altSensorPacket[5] = HUMIDITY_SENSOR_2;
  altSensorPacket[6] = humidity2 >> 8;
  altSensorPacket[7] = humidity2 & 0x00ff;
  altSensorPacket[8] = TEMPERATURE_SENSOR_1;
  altSensorPacket[9] = temperature1 >> 8;
  altSensorPacket[10] = temperature1 & 0x00ff;
  altSensorPacket[11] = TEMPERATURE_SENSOR_2;
  altSensorPacket[12] = temperature2 >> 8;
  altSensorPacket[13] = temperature2 & 0x00ff;
  altSensorPacket[14] = LIGHT_SENSOR;
  altSensorPacket[15] = light >> 8;;
  altSensorPacket[16] = light & 0x00ff;

  // Calculate the checksum for the packet
  int total = 0;
  for (int i=0; i<ALT_SENSOR_PACKET_LENGTH - 1; i++) {
    total += altSensorPacket[i];
  }

  altSensorPacket[17] = -total; // Checksum

  Serial.write(altSensorPacket, ALT_SENSOR_PACKET_LENGTH);
}
#endif
#endif

