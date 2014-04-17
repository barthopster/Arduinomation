// Credentials
var username = "ardnmtn";
var password = "hautomation";
var timeInterval = 1000 * 60;

var light0 = false;
var light1 = false;
var light2 = false;
var light3 = false;

var io = require('socket.io').listen(8181);
var arduinoID;

// Send current time every minute
setInterval(function sendTime()
{
  var currentDate = new Date();
  io.sockets.socket(arduinoID).emit('time', 'Time:'
		+ currentDate.getHours() + ','
		+ currentDate.getMinutes()  + ',' 
		+ currentDate.getSeconds() + ',' 
		+ currentDate.getDate() + ','  
		+ (currentDate.getMonth() + 1) + ',' 
		+ currentDate.getFullYear());
}, timeInterval);
		
io.sockets.on('connection', function (socket)
{ 
  // Connected is acknowledged, start the login process
  socket.on('login', function (data)
  {
	var credentialsArray = data.split('&');
	if (credentialsArray[0].split('=')[1] == username && credentialsArray[1].split('=')[1] == password)
	{
		socket.emit('authorised', { 'light0': light0,
								   'light1': light1,
								   'light2': light2,
								   'light3': light3 });
	}
	else
		socket.emit('unauthorised', 'Authorisation failed');
  });
  
  socket.on('lightcommand', function (data)
  {
	if (data['lightID'] == 'light0')
		light0 = data['on'];
	if (data['lightID'] == 'light1')
		light1 = data['on'];
	if (data['lightID'] == 'light2')
		light2 = data['on'];
	if (data['lightID'] == 'light3')
		light3 = data['on'];
		
	socket.emit('accepted', { 'lightID' : data['lightID'],
							  'on' : data['on'] });
							  
	io.sockets.socket(arduinoID).emit(data['on'] == true ? data['lightID'] + 'on' : data['lightID'] + 'off');
  });
  
  socket.on('message', function (data)
  {
	if (data == 'Say welcome')
	{
		arduinoID = socket.id;
	}
	else
	{
		var lightCommandData = data.split(':');
		var lightCommandBoolean = lightCommandData[1] == "true" ? true : false;
		
		if (lightCommandData[0] == "light0")
			light0 = lightCommandBoolean;
		if (lightCommandData[0] == "light1")
			light1 = lightCommandBoolean;
		if (lightCommandData[0] == "light2")
			light2 = lightCommandBoolean;
		if (lightCommandData[0] == "light3")
			light3 = lightCommandBoolean;
		
		socket.broadcast.emit('accepted', { 'lightID' : lightCommandData[0],
											'on' : lightCommandBoolean });
	}
  });
  
  socket.on('disconnect', function ()
  {
	socket.emit('Alright then...', 'Bye bye.');
  });
});