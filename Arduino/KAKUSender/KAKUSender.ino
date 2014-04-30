#include <NewRemoteTransmitter.h>
#include <NewRemoteReceiver.h>
#include "SocketIOClient.h"
#include "Ethernet.h"
#include "SPI.h"
#include <Time.h>
#include <string.h>

// Used for the KAKU remote functionality
const long transmitterAddress = 12877286;
const int transmitterPin = 7;
const int transmitterPeriod = 260;

// Used for smart lights
const byte ldrPin = A0;
const short numValues = 4;
const short timeFrameBefore = 30; // 0.5 Hour before
const short timeFrameAfter = 150; // 2.5 Hour after
const unsigned long interval = 1000;

// Smart learning variables
short lightThresholds[numValues];
short lightThreshold = 200;
short minutes[numValues];
short minutesThreshold = 18 * 60;
byte timeArrayPosition = 0;

// Used to make the smartcheck be periodly
unsigned long lastCheck;

// Used check if the lights are already turned on for that evening
unsigned short lastDay = 0;

// KAKU Transmitter
NewRemoteTransmitter transmitter(transmitterAddress, transmitterPin, transmitterPeriod);

// Ethernet details
byte mac[] = { 
  0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED };
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

  // Init the receiver
  NewRemoteReceiver::init(0, 2, catchReceivedCode);
}

void loop() {
  smartCheck();
  client.monitor();
}

// Websocket message handler
void onData(SocketIOClient client, char *data) {
  if (strstr(data, "time")) {
    timeUpdate(data + 5);
  } 
  else {
    int lightNumber;

    // Light 1
    if (strstr(data, "0")) {
      lightNumber = 0;
    }

    // Light 2
    if (strstr(data, "1")) {
      lightNumber = 1;
    }

    // Light 3
    if (strstr(data, "2")) {
      lightNumber = 2;
    }

    // Light 4
    if (strstr(data, "3")) {
      lightNumber = 3;
    }

    // First disable the receiver
    NewRemoteReceiver::disable();

    // Turn on the light
    if (strstr(data, "on")) {
      transmitter.sendUnit(lightNumber, true);
      // Enable this to update SmartValue updating, untested
      // updateSmartValues();
    } 
    else { // Turn off
      transmitter.sendUnit(lightNumber, false);
    }

    // Enable the receiver again
    NewRemoteReceiver::enable();
  }
}

// Callback function is called only when a valid code is received.
void catchReceivedCode(NewRemoteCode receivedCode) {

  // Disable the receiver
  NewRemoteReceiver::disable();

  // Take action only if the transmitter address is correct
  if (receivedCode.address == transmitterAddress) {
    char lightCommand[16];
    sprintf(lightCommand, "light%01u:%s", receivedCode.unit, receivedCode.switchType == NewRemoteCode::off ? "false" : "true");

    client.send(lightCommand);

    // Enable this to update SmartValue updating, untested
    // updateSmartValues();
  }

  // Enable the receiver again
  NewRemoteReceiver::enable();
}

// Check for turing on the light using the smart function
// It check if it didnt already turned the light on,
// after that the it is checked if it is dark,
// after that it is checked if the moment is within the timeframe
// and finally the lights are turned on
void smartCheck() {
  unsigned long curTime = millis();
  if ((day() != lastDay)&&(curTime > (lastCheck + interval) || lastCheck < curTime)) {
    lastCheck = curTime;
    //Serial.println("Check");
    short currentLightValue = analogRead(ldrPin);
    if (currentLightValue <= lightThreshold) {
      // Serial.println("Dark");

      short curTimeMinutes = hour() * 60 + minute();
      if (curTimeMinutes > (minutesThreshold - timeFrameBefore) && curTimeMinutes < (minutesThreshold + timeFrameAfter)) {
        Serial.println("Lights on");
        lastDay = day();
        NewRemoteReceiver::disable();
        for (int i = 0; i < 4; i++) {
          transmitter.sendUnit(i, true);
          char lightCommand[16];
          sprintf(lightCommand, "light%01u:%s", i, "true");
          client.send(lightCommand);
        }
        NewRemoteReceiver::enable();
      }
    }
  }
}

// Adds current values to the smartlearning
// It calculate the averages of the LDR measurements and time measure ments
// These are used for turning the light on
// Currently not used because of lack of time
void updateSmartValues() {
  short timeMinutes = hour() * 60 + minute();
  short LDRLight = analogRead(ldrPin);

  // Add the new values
  if (timeArrayPosition >= numValues)
    timeArrayPosition = 0;
  minutes[timeArrayPosition] = timeMinutes;
  lightThresholds[timeArrayPosition] = LDRLight;

  // Set the new place in the array to add the values
  timeArrayPosition++;

  // Calculate new on/off moments and thresholds
  for (int i = 0; i < numValues; i++) {
    minutesThreshold += minutes[i];
    lightThreshold += lightThresholds[i];
  }
  minutesThreshold /= numValues;
  lightThreshold /= numValues;
}

// Sets the current date to the data in the string
// The used format is "hours,minutes,seconds,day,month,year"
void timeUpdate(char *timeString) {
  Serial.print("Update time to: ");
  Serial.println(timeString+28);

  char *p = timeString+28;
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

  setTime(hour, minute, second, day, month, year);
}

