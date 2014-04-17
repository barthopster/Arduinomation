// Credentials
var username = "ardnmtn";
var password = "hautomation";
var timeInterval = 1000 * 5;

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
	{
		arduinoID = socket.id;
		
		// Send current time every minute
		setInterval(function sendTime()
		{
		  var currentDate = new Date();
		  io.sockets.socket(arduinoID).emit('time', currentDate.getHours() + ","
                + currentDate.getMinutes()  + "," 
                + currentDate.getSeconds() + ","  
                + currentDate.getDate() + ","  
                + (currentDate.getMonth() + 1) + "," 
                + currentDate.getFullYear());
		}, timeInterval);
	}
	else
	{
		var lightCommandData = data.split(':');
		if (lightCommandData[0] == "0")
			light1 = lightCommandData[1];
		if (lightCommandData[0] == "1")
			light2 = lightCommandData[1];
		if (lightCommandData[0] == "2")
			light3 = lightCommandData[1];
		if (lightCommandData[0] == "3")
			light4 = lightCommandData[1];
			
		socket.broadcast.emit('accepted', { 'lightID' : lightCommandData[0],
											'on' : lightCommandData[1] });
	}
  });
  
  socket.on('disconnect', function ()
  {
	socket.emit('Alright then...', 'Bye bye.');
  });
});