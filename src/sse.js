/** 
	A small modular that will keep a map of clients listening for more events

	developed by Nima Yahyazade 6/14/2015
*/

var SSE = require('sse')
  , http = require('http')
  , Connections = require('./connections.js');



//============================================================================
/**
	Overriding the sshClient module
	this was done in order to manage a cross-origin request
	through EventSource

	added :
		'Access-Control-Allow-Origin': '*'
*/
var sseClient = SSE.Client;
sseClient.prototype.initialize = function() {
  this.req.socket.setNoDelay(true);
  this.res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });
  this.res.write(':ok\n\n');
};

module.exports= function(RED) {
    // will be called when the node is created
    function CreateSSENode(config){
      
      RED.nodes.createNode(this,config);

      // create a new connection and add a listener for listening event
      var connections = new Connections();
      addSSEsupport(RED.server, connections);

      var node = this;
      // on input broad cast the massage to all clients
      this.on('input', function(msg){
      	connections.broadcastToAll(msg.payload);
      	node.send({payload:connections.printConnections()});
      });


    }
  RED.nodes.registerType("sse", CreateSSENode);
}

	  


//============================================================================
/**
	Adds the sse support to the given server. also removes
		the client when it leaves the connection

	Param:
		Server has to be an instance of http.server
		clientList an instance of Connections object
*/
function addSSEsupport(server, clientList){
	var sse = new SSE(server);
	sse.on('connection', function(client){
		clientList.addConnection(client);	// add the client to the list
		//clientList.printConnections(); debug

		/* need to know when the client has closed the connection */
    	client.on('close', function(){
    		console.log("close requested cliendID: "+this.clientID);
 			
 			/* remove the client from client list */
 			clientList.removeConnection(this);
    	});
	});
}



