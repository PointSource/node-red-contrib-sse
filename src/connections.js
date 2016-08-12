/** 
	A small modular that will keep keep the list of clients 
	listening for more events

	developed by Nima Yahyazade 6/14/2015
*/


module.exports = Connections;

function Connections(){
	this.clientMap = {};
	this.clientID = 0;
}

// Add new clients to the list
Connections.prototype.addConnection = function(client){
	// Add an id to client to know the id when it leaves
	client.clientID = this.clientID;
	this.clientMap[this.clientID] = client;
	this.clientID++;
}

Connections.prototype.removeConnection = function(clients){
	if(this.clientMap[clients.clientID]){
		delete this.clientMap[clients.clientID];
	}
}

Connections.prototype.printConnections = function(){
	return "List of connections include " +
		 Object.keys(this.clientMap).length+ " clients";
}

Connections.prototype.broadcastToAll = function(msg){
	//	this.printConnections();         debug
	for(var clientID in this.clientMap){
		this.clientMap[clientID].send(msg + "\n\n");
	}
}
