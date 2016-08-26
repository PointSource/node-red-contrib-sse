var sse = require('simple-sse'),
    http = require('http');

/**
 * The exported module for the Node-RED package to pick up 
 * the sse node. It will register the sse node type.
 * @param  {object} RED Required parameter for Node-RED
 */
module.exports = function(RED) {
    /**
     * @name CreateSSENode
     * @description Will create the sse node and setup all the variable. 
     * It will register.
     * a http listener on the path and room inputed to the node.
     * @param {object} config Configuration passed in from Node-RED library
     */
    function CreateSSENode(config) {
        // Do the initialization for Node-RED
        RED.nodes.createNode(this, config);
        var node = this;

        // Initialize variables using the user inputs
        var room = config.room;
        var path = config.path + "/" + config.room;
        var retry = config.retrySet !== undefined ? config.retry : undefined;
        var accessAllowControlOrigin =
            config.accessControlSet !== undefined ? config.accesscontrol : undefined;
        var clientNums = 0;
        sse.heartbeat = config.heartbeat;

        // Set up the status Icon at the beginning
        updateNode();

        // The route for specific path and room
        RED.httpNode.get(path, function(req, res) {
            if (accessAllowControlOrigin) {
              res.setHeader('Access-Control-Allow-Origin', accessAllowControlOrigin)
            }
            clientNums++;
            // create client sse
            var client = sse.add(req, res);

            // set sse retry
            if (retry && retry > 0) {
                sse.setRetry(client, config.retry);
            }

            // add to the room
            sse.join(client, config.room);

            // update the status Icon
            updateNode();

            req.connection.addListener("close", function() {
                clientNums--;
                updateNode();
            });
        });

        // On input broadcast the massage to all clients
        this.on('input', function(msg) {
            if (msg.event) {
                sse.broadcast(room, msg.event, msg.payload);
            }
            sse.broadcast(room, msg.payload);
        });

        // When closing remove the route listener
        this.on("close", function() {
            RED.httpNode._router.stack.forEach(function(route, i, routes) {
                if (route.route &&
                    route.route.path === path &&
                    route.route.methods['get']) {
                    routes.splice(i, 1);
                }
            });
        });

        /**
         * @name updateNode
         * @description Will update the status Icon of the node based on 
         * number of clients
         */
        function updateNode() {
            if (clientNums === 0) { // No client connected
                node.status({
                    fill: "red",
                    shape: "ring",
                    text: "disconnected"
                });
            } else {
                node.status({
                    fill: "green",
                    shape: "dot",
                    text: clientNums + " client(s) connected"
                });
            }
        }
    }

    RED.nodes.registerType("sse", CreateSSENode);
}
