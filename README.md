# node-red-contrib-sse

## Install

To install run: 

`npm install node-red-contrib-sse --save`

## Description

This is a wrapper around [simple-sse](https://www.npmjs.com/package/simple-sse).
It will allow sending sever sent event to the client.

It will use HttpIn node and will initialize a listener on the given path. The 
path can be any valid URL path such as "/sse" or "/mynode/serversentevent".

Each path is divided to different rooms. For example if the given path is "/sse"
and the room is "room1", then clients would be able to start listening to events 
on this room by making a GET request on the path "/sse/room1".

You can use multiple nodes to listen on the same path but different rooms.

