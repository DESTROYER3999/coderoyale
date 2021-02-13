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

function execute_code(file, callback) {
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

class SocketHandler {
    constructor(socket) {
        this.socket = socket;
        this.bind_messages();
        this.handle_connect();
    }

    bind_messages() {
        this.socket.on("disconnect", this.handle_disconnect);
        this.socket.on("execute code", this.handle_execute_code);
        this.socket.on("execute tests", this.handle_execute_tests);
        // this.socket.on("execute test code", this.handle_execute_test_code)

    }

    // handle_execute_test_code(info, callback) {
    //     console.log("EXECING CODE", info)
    //     this.handle_execute_tests({
    //         tests: info.code,
    //         solution: 
    //     })
    //     write_file(info.code, "solution.py", (error) => {
    //         if (error) return console.log(error);
    //         execute_code("solution.py", (result) => {
    //             callback(result);
    //             console.log("Sent result back to client.");
    //         });
    //     });
    // }

    handle_execute_code(info, callback) {
        console.log("EXECING CODE", info)
        write_file(info.code, "solution.py", (error) => {
            if (error) return console.log(error);
            execute_code("solution.py", (result) => {
                callback(result);
                console.log("Sent result back to client.");
            });
        });
    }

    handle_execute_tests(info, callback) {
        console.log("EXECING TESTS", info)
        write_file(info.tests, "tests.py", (error) => {
            if (error) return console.log(error);
            write_file(info.solution, "solution.py", (error) => {
                execute_code("tests.py", (result) => {
                    callback(result);
                    console.log("Sent result back to client.");
                });
            })
        })
    }



    handle_connect() {
        console.log(this.socket.id, "Connected to the server!");
    }

    handle_disconnect(reason) {
        console.log("Client disconnected from the server for reason", reason);
    }
    
}

io.on("connection", (socket) => {
    new SocketHandler(socket);

    // socket.on("execute code", (info, callback) => {
    //     console.log("Got excecute msg.", info);
    //     write_file(info.code, "solution.py", (error) => {
    //         if (error) return console.log(error);
    //         exec_code("solution.py", (result) => {
    //             callback(result);
    //             console.log("Sent result back to client.");
    //         });

    //     });

    // })

    // socket.on("execute sample tests code", (info, callback) => {
    //     console.log("SAMPLE TESTS")
    //     write_file(info.code, "sampletest.py", (error) => {
    //         if (error) return console.log(error);
    //         exec_code("sampletest.py", (result) => {
    //             callback(result);
    //             console.log("Sent result back to client.");
    //         });

    //     });

    // })

    // socket.on("execute submission tests code", (info, callback) => {
    //     console.log("SOLUTIN TEESTS")
    //     write_file(info.code, "submissiontest.py", (error) => {
    //         if (error) return console.log(error);
    //         exec_code("submissiontest.py", (result) => {
    //             callback(result);
    //             console.log("Sent result back to client.");
    //         });

    //     });

    // })

    // socket.on("execute sample tests", (info, callback) => {
    //     write_file(info.code, "solution.py", (error) => {
    //         if (error) return console.log(error);
    //         write_file(info.sampleTests, "test.py", (error) => {
    //             if (error) return console.log(error);
                
    //         })
    //     })
    //     run_tests((result) => {
    //         console.log("RESULT OF TESTS", result)
    //         callback(result);
    //     })
    // })
})


const PORT = 3000 || process.env.PORT
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))