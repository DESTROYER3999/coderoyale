const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const fs = require("fs");
const { spawn } = require("child_process");


const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static("public"));

function run_tests() {
    
}

function exec_code(info, callback) {
    fs.writeFile(__dirname + "\\solution.py", info.code, (error) => {
        if (error) return console.log(error);
        console.log("Written to file!");
    });
    const ls = spawn("python", [__dirname + "\\solution.py"]);
    ls.stdin.write(info.stdin);
    ls.stdin.end();
    let result = {
        stdout: "",
        stderr: "",
        error: null,
        code: null
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
    
    ls.on("close", code => {
        result.code = code;

        console.log(`child process exited with code ${code}`);
        console.log("The result is", result)
        return callback(result);
    });
}

// Run when a client connects
io.on("connection", (socket) => {
    console.log(socket.id, "created websocket connection");

    socket.on("execute", (info, callback) => {
        console.log("Got excecute msg.", info);
        exec_code(info, (result) => {
            callback(result);
            console.log("Sent result back to client.");
        })


        

    })
})

app.get("/submit-form", (req, res) => {
    console.log("THERE WAS A POST", req.username);
    res.send(req.username);
})



const PORT = 3000 || process.env.PORT
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))