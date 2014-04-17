#include <NewRemoteTransmitter.h>
#include "SocketIOClient.h"
#include "Ethernet.h"
#include "SPI.h"
#include <string.h>

// Used for the KAKU remote functionality
const long transmitterAddress = 12877286;
const int transmitterPin = 7;
const int transmitterPeriod = 254;

NewRemoteTransmitter transmitter(transmitterAddress, transmitterPin, transmitterPeriod);

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
  int lightNumber;
  
  // Light 1
  if(strstr(data, "1")) {
    lightNumber = 0;
  }
  
  // Light 2
  if(strstr(data, "2")) {
    lightNumber = 1;
  }
  
  // Light 3
  if(strstr(data, "3")) {
    lightNumber = 2;
  }
  
  // Light 4
  if(strstr(data, "4")) {
    lightNumber = 3;
  }
  
  // Turn on the light
  if(strstr(data, "on")) {
    transmitter.sendUnit(lightNumber, true);
  } else { // Turn off
    transmitter.sendUnit(lightNumber, false);
  }
}

void timeUpdate(char *timeString)
{
  char *p = timeString;
  char *str;
  byte second, minute, hour, day, month;
  short year;
  if ((str = strtok_r(p, ",", &p)) != NULL)
    hour = atoi(str);
  if ((str = strtok_r(p, ",", &p)) != NULL)
    minute = atoi(str);
  if ((str = strtok_r(p, ",", &p)) != NULL)
    second = atoi(str);
  if ((str = strtok_r(p, ",", &p)) != NULL)
    day  = atoi(str);
  if ((str = strtok_r(p, ",", &p)) != NULL)
    month = atoi(str);
  if ((str = strtok_r(p, ",", &p)) != NULL)
    year = atoi(str);

  setTime(hour,minute,second,day,month,year);
}
