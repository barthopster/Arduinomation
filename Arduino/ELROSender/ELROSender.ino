#include <RemoteReceiver.h>
#include "SocketIOClient.h"
#include "Ethernet.h"
#include "SPI.h"
#include <string.h>

// Used for the ElRO remote functionality
const int transmitterAddress = 12;
const int transmitterPin = 7;
const int transmitterPeriod = 320;
const int transmitterTimes = 320;

NewRemoteTransmitter transmitter(transmitterPin, transmitterPeriod, transmitterTimes);

// Ethernet details
byte mac[] = { 0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED };
char hostname[] = "ardnmtn.barthopster.nl";
int port = 8181;

SocketIOClient client;

void setup() {
  Serial.begin(57600);
  
  // Init the Ethernet shield
  Ethernet.begin(mac);
  
  // Connect!
  if (!client.connect(hostname, port))
    Serial.println("Not connected.");
  
  // Catch any received data
  client.setDataArrivedDelegate(onData);
  
  // Second handshake
  client.send("Say welcome");
}

void loop() {
  client.monitor();
}

// Websocket message handler
void onData(SocketIOClient client, char *data) {
  char lightChar;
  
  // Light 1
  if(strstr(data, "1")) {
    lightChar = 'A';
  }
  
  // Light 2
  if(strstr(data, "2")) {
    lightChar = 'B';
  }
  
  // Light 3
  if(strstr(data, "3")) {
    lightChar = 'C';
  }
  
  // Light 4
  if(strstr(data, "4")) {
    lightChar = 'D';
  }
  
  // Turn on the light
  if(strstr(data, "on")) {
    transmitter.sendUnit(lightNumber, true);
  } else { // Turn off
    transmitter.sendUnit(lightNumber, false);
  }
}
