var cluster = require("cluster");

if (cluster.isMaster)
{
	var cpu_count = require('os').cpus().length;
	console.log("cpu_count = " + cpu_count);

	// Fork workers.
	for (var t = 0; t < cpu_count; t++)
	{
		cluster.fork();
	}

	cluster.on("exit", (worker, code, signal) => {
		//console.log("worker ${worker.process.pid} died, restarting");
		cluster.fork();
	});
}
else
{
	//console.log("worker ${worker.process.pid} started");

	var express = require("express");
	var app = express();
	var bodyParser = require("body-parser");
	var cors = require("cors");
	var redis = require("redis");

	var red = redis.createClient();
	red.select(1, function() { /* ... */ });
	red.on("error", (err) =>
	{
		console.log("Redis error: " + err);
	});

	app.set("port", (process.env.PORT || 8010));
	app.use(bodyParser.json());
	app.use(cors());

	app.listen(app.get("port"), function()
	{
	});

	app.get("/msys", function(request, response)
	{
		// t is verification token
		// d is the message
		// g is game
		// u is user id or underscore separated list of users for broadcast
		// c is command which can be:
		// 	- s command is set data
		// 	- g command is get data
		// Example usage for localhost
		//http://localhost:8001/msg?t=<add your token>&game1=a&u=1234&c=s&d=message1
		//http://localhost:8001/msg?t=<add your token>&game1=a&u=1234&c=g
		
		var token = request.query["t"];		// token
		var game = request.query["g"];		// game_id
		var user = request.query["u"];		// user_id
		var cmd = request.query["c"];		// command
		var data = request.query["d"];		// data
		var users = undefined;
		
		if (user === undefined)
		{
			user = request.query["m"];		// List of user_id's
			if (user !== undefined)
				users = user.split("_");
		}

		if (token !== "<add your token>" || cmd === undefined || user === undefined || game === undefined || cmd.length !== 1 || game.length !== 1)
		{
			// Invalid request so reject
			response.sendStatus(403)
			return;
		}

		if (cmd === "s")
		{
			if (data === undefined || data.length <= 5 || data.length > 1024)
			{
				response.sendStatus(403)
			}
			else
			{
				if (users !== undefined)
				{
					for (var t = 0; t < users.length; t++)
					{
						var id = game + ":" + users[t];
						red.lpush([id, data], function(err, reply) {
							red.ltrim(id, 0, 16);
						});
						red.expire(id, 604800);			// expires after 7 days
					}
					response.sendStatus(200);
				}
				else
				{
					var id = game + ":" + user;
					red.lpush([id, data], function(err, reply) {
						red.ltrim(id, 0, 16);
					});
					red.expire(id, 604800);			// expires after 7 days
					response.sendStatus(200);
				}
			}
		}
		else if (cmd === "g")
		{
			var id = game + ":" + user;
			red.lrange(id, 0, -1, function (err, msgs) {
				red.del(id);
				response.status(200).send(encodeURIComponent(msgs));
			});			

		}
	});

}


