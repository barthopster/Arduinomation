// Credentials
var username = "ardnmtn";
var password = "hautomation";

var light1 = false;
var light2 = false;
var light3 = false;
var light4 = false;

var io = require('socket.io').listen(8181);
var arduinoID;

io.sockets.on('connection', function (socket)
{ 
  // Connected is acknowledged, start the login proces
  socket.on('login', function (data)
  {
	var credentialsArray = data.split('&');
	if (credentialsArray[0].split('=')[1] == username && credentialsArray[1].split('=')[1] == password)
	{
		socket.emit('authorised', { 'light1': light1,
								   'light2': light2,
								   'light3': light3,
								   'light4': light4 });
	}
	else
		socket.emit('unauthorised', 'Authorisation failed');
  });
  
  socket.on('lightcommand', function (data)
  {
	if (data['lightID'] == 'light1')
		light1 = data['on'];
	if (data['lightID'] == 'light2')
		light2 = data['on'];
	if (data['lightID'] == 'light3')
		light3 = data['on'];
	if (data['lightID'] == 'light4')
		light4 = data['on'];
		
	socket.emit('accepted', { 'lightID' : data['lightID'],
							  'on' : data['on'] });
							  
	io.sockets.socket(arduinoID).emit(data['on'] == true ? data['lightID'] + 'on' : data['lightID'] + 'off');
  });
  
  socket.on('message', function (data)
  {
	if (data == 'Say welcome')
		arduinoID = socket.id;
  });
  
  socket.on('disconnect', function ()
  {
	socket.emit('Alright then...', 'Bye bye.');
  });
});