# emag-score
Checks product pricing history on emag.ro
Used for learning purposes.

# Defining local dependencies of the project
-> backend libraries managed by NPM
-> frontend libraries managed by Bower

Configuration files:
.bowerrc

Webstorm Project installation:
New GitHub Project clone from: https://github.com/roby-rodriguez/emag-score.git
Open terminal and run:
1) npm install
2) bower install
* the grunt thing could probably do this automatically
3) start mongod.exe
    Windows (ex. "C:\Program Files\MongoDB\Server\3.0\bin\mongod.exe" --dbpath C:\Users\username\mongoDB)
    Ubuntu (ex. sudo service mongod start)
4) optionally run mongo.exe (ex. "C:\Program Files\MongoDB\Server\3.0\bin\mongo.exe")
5) Run server.js

Useful links:
http://24ways.org/2013/grunt-is-not-weird-and-hard/