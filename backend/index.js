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

function run_tests(callback) {
    exec_code("test.py", (result) => {
        console.log("RESULT OF TESTS IS HERE::", result)
        return callback(result);
    })
}

function write_file(code, filename, callback) {
    fs.writeFile(__dirname + "\\" + filename, code, (error) => {
        return callback(error);
    });
}

function exec_code(file, callback) {
    const ls = spawn("python", [__dirname + "\\" + file]);
    // ls.stdin.write(info.stdin);
    // ls.stdin.end();
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
        write_file(info.code, "solution.py", (error) => {
            if (error) return console.log(error);
            exec_code("solution.py", (result) => {
                callback(result);
                console.log("Sent result back to client.");
            });

        });

    })

    socket.on("execute sample tests code", (info, callback) => {
        console.log("SAMPLE TESTS")
        write_file(info.code, "sampletest.py", (error) => {
            if (error) return console.log(error);
            exec_code("sampletest.py", (result) => {
                callback(result);
                console.log("Sent result back to client.");
            });

        });

    })

    socket.on("execute submission tests code", (info, callback) => {
        console.log("SOLUTIN TEESTS")
        write_file(info.code, "submissiontest.py", (error) => {
            if (error) return console.log(error);
            exec_code("submissiontest.py", (result) => {
                callback(result);
                console.log("Sent result back to client.");
            });

        });

    })

    socket.on("execute sample tests", (info, callback) => {
        write_file(info.code, "solution.py", (error) => {
            if (error) return console.log(error);
            write_file(info.sampleTests, "test.py", (error) => {
                if (error) return console.log(error);
                
            })
        })
        run_tests((result) => {
            console.log("RESULT OF TESTS", result)
            callback(result);
        })
    })
})

app.get("/submit-form", (req, res) => {
    console.log("THERE WAS A POST", req.username);
    res.send(req.username);
})



const PORT = 3000 || process.env.PORT
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))