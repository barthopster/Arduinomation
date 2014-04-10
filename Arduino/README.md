Arduinomation
=============

A project, based on home automation, for turning on the lights using an Arduino, a remote light system like KlikAanKlikUit or ELRO, a NodeJS server application and a web frontend.

This is the Arduino part. For taking care that the Arduino communicates with the server part, the Ethernet functionality is used in combination with billroy's SocketIO library (https://github.com/billroy/socket.io-arduino-client).
An ordinary radio transmitter (and receiver, for your own ease) at 433,92MHz is used as "remote". Fuzzillogic's 433MhzForArduino library (https://bitbucket.org/fuzzillogic/433mhzforarduino) has been used to make everything working correctly.

See http://arduinomation.barthopster.nl for a live example.