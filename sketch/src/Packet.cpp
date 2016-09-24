#include "Packet.h"

// Some common constants that don't need to be public.
#define START_BYTE_LENGTH 1
#define LENGTH_BYTE_LENGTH 1
#define CHECKSUM_LENGTH 1

Packet::Packet() {
  reset();
}

void Packet::reset() {
  position = 0;
  buffer[position++] = START_BYTE;
  buffer[position++] = 0x00; // length
}

void Packet::setSensorValue(uint8_t sensor, uint16_t value) {
  buffer[position++] = sensor;
  buffer[position++] = value >> 8;
  buffer[position++] = value & 0x00ff;

  incrementPacketLength(3);
}

void Packet::completePacket() {
  calculateChecksum();
}

uint16_t Packet::length() {
  return buffer[PACKET_LENGTH_POS] 
    + START_BYTE_LENGTH 
    + LENGTH_BYTE_LENGTH 
    + CHECKSUM_LENGTH;
}

const uint8_t *Packet::getBuffer() {
  return buffer;
}

void Packet::incrementPacketLength(uint8_t length) {
  buffer[PACKET_LENGTH_POS] += length;
}


void Packet::calculateChecksum() {

  int length = buffer[PACKET_LENGTH_POS] + START_BYTE_LENGTH + LENGTH_BYTE_LENGTH;
  int total = 0;

  for (int i=0; i<length; i++) {
    total += buffer[i];
  }

  buffer[position] = -total; // Checksum
}
