#ifndef PACKET_H
#define PACKET_H

#define PACKET_LENGTH 18
#define PACKET_LENGTH_POS 0x01

#define START_BYTE 0x13

/**
 * This class encapsulates the concept of a sensor packet to be
 * sent over a serial port. It takes care of the appropriate 
 * encoding and checksum calculations.
 */
class Packet {

  private:
    // The buffer containing the bytes in the packet.
    uint8_t buffer[PACKET_LENGTH];
    // The current position of writing into the packet.
    uint16_t position;

  public:
    /**
     * Default constructor for a packet. Ensures that everything
     * is initialized correctly.
     */
    Packet();

    /**
     * Clears out the packet buffer and prepares for creating
     * another packet.
     */
    void reset();

    /**
     * Encodes a sensor value into the packet.
     *
     * @param sensor the manifest constant for the type of sensor value.
     * @param value the value of the sensor to encode.
     */
    void setSensorValue(uint8_t sensor, uint16_t value);

    /**
     * Does the bookwork to prepare a packet for transmission. Includes
     * generating the checksum for the packet.
     */
    void completePacket();

    /**
     * Returns the length of the packet buffer.
     *
     * @return length in bytes
     */
    uint16_t length();

    /**
     * Returns a const reference to the packet buffer.
     *
     * @return pointer to the packet buffer
     */
    const uint8_t *buffer();

  private:
    // Increments the current writing position of the packet buffer.
    void incrementPacketLength(uint8_t length);
    // Calculates the checksum for the packet buffer given its 
    // current contents.
    void calculateChecksum();
};

#endif
