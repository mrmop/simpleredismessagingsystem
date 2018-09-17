# A Simple Redis Node.js Based Messaging System

# Example usage:

# Send a message to a user of a specific game

http://localhost:8008/msg?t=<add your token>&game1=a&u=1234&c=s&d=message1

# Broadcast a message to a list of users of a specific game

http://localhost:8080/msg?t=<add your token>&game1=a&u=1234&_2345_3456c=s&d=message1

# Get all pending messages for a specific user of a specific game

http://localhost:8080/msg?t=<add your token>&game1=a&u=1234&c=g

End point parameters:

- t is verification token
- d is the message
- g is game
- u is user id
- m is for muliple user id's which is an underscore separated list of users for broadcast
- c is command which can be:
- 	- s command is set data
- 	- g command is get data


Created and provided by Mat Hopwood at http://www.drmop.com
