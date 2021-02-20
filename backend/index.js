const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const fs = require("fs");
const { spawn } = require("child_process");


const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static("public"));
app.use('/*/monaco-editor', express.static('public/global/monaco-editor'));
app.use('/join/*', express.static('public/play.html'));


let rooms = {};

console.log("DIRNAME:::", __dirname);
console.log("BACK A THING", path.join(__dirname, '..'))
console.log("THE USUAL", path.join(__dirname, '..', 'backend', 'python'))
// app.use("/game", express.static("public/challenge.html"))

app.get("/edit/:challengeID", (req, res) => {
    let challengeID = req.params.challengeID;
    if (challengeID == "new") {
        res.sendFile(path.join(__dirname, '..', 'public', 'edit.html'))

    }
})

app.get("/browse", (req, res) => {
    let displayChallenges = {};
    read_json(path.join(__dirname, '..', 'backend', 'storage', 'challenges.json'), (challenges) => {
        for (let challengeID in challenges) {
            let info = challenges[challengeID];
            displayChallenges[challengeID] = {
                title: info.title,
                instructions: info.instructions
            }
            
        }
        res.json(displayChallenges);
    });

})

app.get("/play/:challengeID", (req, res) => {
    let challengeID = req.params.challengeID;
    read_json(path.join(__dirname, '..', 'backend', 'storage', 'challenges.json'), (challenges) => {
        if (!(challenges.hasOwnProperty(challengeID))) {
            return res.sendFile(path.join(__dirname, '..', 'public', 'nochallenge.html'))
        }
        return res.sendFile(path.join(__dirname, '..', 'public', 'play.html'))

    })

    // res.redirect(`/play/${challengeID}/ree`);
});

app.get("/play/:challengeID/:roomID", (req, res) => {
    let challengeID = req.params.challengeID;
    let roomID = req.params.roomID;

    console.log("sum1 wants to join", challengeID, roomID);

    if (!rooms.hasOwnProperty(roomID)) {
        return res.sendFile(path.join(__dirname, '..', 'public', 'noroom.html'))
    }
    return res.redirect(`/join/${roomID}`);
})


function replaceAll(string, from, to) {
    var re = new RegExp(from, "g");
    return string.replace(re, to);
}

function make_id(length, exclude=null) {
    if (exclude == null) {
        exclude = [];
    }
    let letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let numbers = "0123456789";
    let chars = letters + numbers;
    let result = letters.charAt(Math.floor(Math.random() * letters.length));
    for (let i = 0; i < length - 1; i ++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (exclude.includes(result)) {
        return make_id(length, exclude);
    }
    return result;
}

function write_file(code, filename, callback) {
    fs.writeFile(filename, code, (error) => {
        return callback(error);
    });
}

function read_json(filename, callback) {
    fs.readFile(filename, (err, data) => {
        if (err) throw err;
        return callback(JSON.parse(data));
    });
}

function write_json(data, filename, callback) {
    write_file(JSON.stringify(data), filename, callback);
}

function run_tests(tests, solution, callback) {
    let runID = make_id(10);

    let newTests = `
import json

${tests}        

print("${runID}", json.dumps(cr_test.TestGroup._TestGroup__run()))
`  

    write_file(newTests, path.join(__dirname, '..', 'backend', 'python', 'tests.py'), (error) => {
        if (error) return console.log(error);
        write_file(solution, path.join(__dirname, '..', 'backend', 'python', 'solution.py'), (error) => {
            execute_code(path.join(__dirname, '..', 'backend', 'python', 'tests.py'), (result) => {
                console.log("RESUT OF RUN!", result);
                let parsedResult = {
                    result: null,
                    stdout: null,
                    stderr: null,
                    error: null,
                    exitcode: result.exitcode
                }
                if (result.error) {
                    console.log("ERROR RUNNING CODE");
                    parsedResult.error = true;
                    return callback(parsedResult);
                    // return console.log(error);
                }

                let resultLines = result.stdout.split(/\r?\n/);
                resultLines.pop();

                let verifiedLines = [];
                let logLines = [];
                for (let i = 0; i < resultLines.length; i++) {
                    let line = resultLines[i];
                    console.log("LINE IS", line)
                    if (line.slice(0, 10) == runID) {
                        verifiedLines.push(line.slice(11))
                    } else {
                        logLines.push(line)
                    }
                }


                let testResults = verifiedLines[0];

                if (testResults) {
                    parsedResult.result = testResults;
                }
                if (logLines.length) {
                    parsedResult.stdout = logLines.join("\n") + "\n";
                }
                if (result.stderr) {
                    parsedResult.stderr = result.stderr;
                }
                callback(parsedResult);
            });
        })
    })
}



function execute_code(file, callback) {
    const ls = spawn("python", [file]);
    // ls.stdin.write(info.stdin);
    // ls.stdin.end();
    let result = {
        stdout: "",
        stderr: "",
        error: null,
        exitcode: null
    };

    ls.stdout.on("data", data => {
        result.stdout += data.toString();
    });
    
    ls.stderr.on("data", data => {
        result.stderr += data.toString();
    });
    
    ls.on("error", (error) => {
        result.error = error.message;
    });
    
    ls.on("close", exitCode => {
        result.exitcode = exitCode;
        return callback(result);
    });
}

function room_from_socket(socket) {
    for (let id of Array.from(socket.rooms)) {
        if (rooms.hasOwnProperty(id)) {
            return id;
        }
    }
    return null;
}


class SocketHandler {
    constructor(socket) {
        this.socket = socket;
        this.bind_messages();
        this.handle_connect();
    }

    bind_messages() {
        this.socket.on("disconnect", this.handle_disconnect);
        this.socket.on("disconnecting", this.handle_disconnecting);
        this.socket.on("execute code", this.handle_execute_code);
        this.socket.on("execute tests", this.handle_execute_tests);
        this.socket.on("save challenge", this.handle_save_challenge);
        this.socket.on("challenge info", this.handle_challenge_info);
        this.socket.on("create room", this.handle_create_room);
        this.socket.on("join room", this.handle_join_room);
        this.socket.on("start game", this.handle_start_game);
        this.socket.on("send chat", this.handle_send_chat);
        this.socket.on("submit", this.handle_submit);
        this.socket.on("ping", this.handle_ping);
        this.socket.on("kick player", this.handle_kick_player);

    }

    handle_kick_player(id, callback) {
        console.log(this.id, "WANTS TO KICK", id)
        let roomID = room_from_socket(this);

        if (!(this == rooms[roomID].host)) {
            console.log("They weren't host")
            return callback({
                error: "Only host can kick"
            })
        }
        let kickClient = io.of('/').sockets.get(id);
        kickClient.disconnect(true);
        return callback({
            error: null
        })
    }

    handle_ping() {
        this.emit("pong");
    }

    handle_submit(solution) {
        console.log(this.id, "submitting");
        let roomID = room_from_socket(this);
        let challengeID = rooms[roomID].challengeID;
        let totalTime = Date.now() - rooms[roomID].startTime;
        let overview = {
            testResults: null,
            totalTime: null
        }
        read_json(path.join(__dirname, '..', 'backend', 'storage', 'challenges.json'), (challenges) => {
            let submissionTests = challenges[challengeID].submissionTests;
            run_tests(submissionTests, solution, (results) => {
                console.log("GOT SUBMISSION RESULTS!");
                overview.testResults = results;
                overview.totalTime = totalTime;                
                io.in(roomID).emit("overview", {
                    client: this.id,
                    overview: overview
                });
                io.in(roomID).emit("receive chat", {
                    sender: "SERVER",
                    message: this.id + " submitted in " + totalTime + "ms"
                });

            })
        })
    }
    
    handle_send_chat(message) {
        let roomID = room_from_socket(this);

        io.in(roomID).emit("receive chat", {
            sender: this.id,
            message: message
        });

    }

    handle_start_game(callback) {
        let roomID = room_from_socket(this);

        if (!roomID) {
            console.log("Didn't have a room");
            return callback({
                error: "Room doesn't exist"
            })
        }
        if (rooms[roomID].host != this) {
            console.log("THEY werent host");
            return callback({
                error: "Only host can start"
            })
        }

        read_json(path.join(__dirname, '..', 'backend', 'storage', 'challenges.json'), (challenges) => {
            if (!challenges.hasOwnProperty(rooms[roomID].challengeID)) {
                return callback({
                    error: "Challenge doesn't exist"
                })
            }
            delete challenges[rooms[roomID].challengeID].submissionTests;
            io.in(roomID).emit("game start", challenges[rooms[roomID].challengeID]);
            io.in(roomID).emit("receive chat", {
                sender: "SERVER",
                message: "The host started the game!"
            });
            rooms[roomID].startTime = Date.now();

            return callback({
                error: null
            })
  
        })
    }

    handle_join_room(roomID, callback) {
        if (!rooms.hasOwnProperty(roomID)) {
            return callback({
                error: "Room doesn't exist",
                challengeID: null
            })
        }
        let challengeID = rooms[roomID].challengeID;
        let host = rooms[roomID].host;

        let roomClients = io.sockets.adapter.rooms.get(roomID);
        for (let roomClient of roomClients) {
            this.emit("client join", roomClient);
        }

        this.join(roomID);
        this.to(roomID).emit("client join", this.id);
        io.in(roomID).emit("receive chat", {
            sender: "SERVER",
            message: this.id + " joined!"
        });



        callback({
            error: null,
            challengeID: challengeID
        })
    }
    
    handle_create_room(challengeID, callback) {
        let newRoomID = make_id(4, Object.keys(rooms));
   
        this.join(newRoomID);
        console.log("JOINED", this.rooms)
        rooms[newRoomID] = {
            challengeID: challengeID,
            host: this,
            startTime: null
        }
        callback({
            error: null,
            roomID: newRoomID
        });

    }

    handle_challenge_info(challengeID, callback) {
        read_json(path.join(__dirname, '..', 'backend', 'storage', 'challenges.json'), (challenges) => {
            if (!challenges.hasOwnProperty(challengeID)) {
                return callback({
                    error: "Challenge doesn't exist",
                    challengeInfo: null
                })
            }
            delete challenges[challengeID].submissionTests;
            callback({
                error: null,
                challengeInfo: challenges[challengeID]
            })
        })
    }

    handle_execute_code(info, callback) {
        console.log("EXECING CODE", info)
        write_file(info.code, path.join(__dirname, '..', 'backend', 'python', 'solution.py'), (error) => {
            if (error) return console.log(error);
            execute_code(path.join(__dirname, '..', 'backend', 'python', 'solution.py'), (result) => {
                callback(result);
                console.log("Sent result back to client.");
            });
        });
    }

    handle_execute_tests(info, callback) {
        run_tests(info.tests, info.solution, (result) => {
            callback(result);
        })
    }

    handle_save_challenge(info, callback) {
        console.log("SAVING CHALLENGE WITH TITLE", info);
        read_json(path.join(__dirname, '..', 'backend', 'storage', 'challenges.json'), (currentChallenges) => {
            console.log("Current::", currentChallenges)
            let currentID = make_id(10, Object.keys(currentChallenges));

            currentChallenges[currentID] = info;
            write_json(currentChallenges, path.join(__dirname, '..', 'backend', 'storage', 'challenges.json'), (error) => {
                if (error) {
                    callback({
                        error: "Couldn't create challenge",
                        challengeID: null
                    });
                    throw err
                }
                console.log("Succes creating challenge!")
                return callback({
                    error: null,
                    challengeID: currentID
                });

            });
        })
    }

    handle_connect() {
        console.log(this.socket.id, "Connected to the server!");
        // this.socket.emit("your id", this.socket.id);
    }

    handle_disconnecting() {
        console.log(this.id, "Disconnecting from server...",  this.rooms);
        let roomID = room_from_socket(this);


        console.log("THEIR ROOM WAS", roomID)
        if (!roomID) {
            console.log("they didn't have a room");
            return
        }
        if (rooms[roomID].host == this) {
            console.log("HOST IS LEAVING, deleting room");
            this.to(roomID).emit("host leave");
            delete rooms[roomID];
        } else {
            console.log("person that left wasn't hoste")
            this.to(roomID).emit("client leave", this.id);
            io.in(roomID).emit("receive chat", {
                sender: "SERVER",
                message: this.id + " left!"
            });

        }
    }

    handle_disconnect(reason) {
        console.log("Client disconnected from the server for reason", reason);
    }
    
}

io.on("connection", (socket) => {
    new SocketHandler(socket);
})


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))