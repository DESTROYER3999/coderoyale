const socket = io();

const runButton = document.getElementById("run-btn");
const outputArea = document.getElementById("output");
const leftDiv  = document.getElementById("left");
const rightDiv = document.getElementById("right");
const monacoEditor = document.getElementById('monaco-container');
const contentDiv = document.getElementById("maincontent");
const mdeElement = document.getElementById("simplemde-editor");
// const inputArea = document.getElementById("input");
runButton.addEventListener("click", run_clicked);

require.config({ paths: { vs: 'monaco-editor/min/vs' } });

const editMde = new SimpleMDE({
    element: mdeElement,
    spellChecker: false,
    status: false,
    hideIcons: ['guide', 'fullscreen', 'side-by-side', "image"]
});
  

let editor;
require(['vs/editor/editor.main'], function () {
    editor = monaco.editor.create(monacoEditor, {
        value: "",
        language: 'python',
        automaticLayout: true,
        theme: "vs-dark",
        fontSize: "14px",
        minimap: {
            enabled: false
        },
        lineNumbersMinChars: 3,
        lineDecorationsWidth: 3
    });

    // window.onresize = function () {
    //     editor.layout();
    // };


});

function handle_result(result) {
    console.log("recieved result");
    if (result.error) {
        console.log("ERRROR");
        alert("There was an error running your code.")
    } else if (result.stderr) {
        console.log("Recieved stderr", result.stderr);
        outputArea.classList.add("error");
        outputArea.value = result.stderr;
        
    } else if (result.stdout) {
        console.log("Recieved stdout", result.stdout);
        outputArea.classList.remove("error");
        outputArea.value = result.stdout;
    }
    outputArea.value += `\nProcess finished with exit code ${result.code}`;
}

function run_clicked() {
    outputArea.value = "";
    socket.emit("execute", {
        "code": editor.getValue(),
        "stdin": ""
    }, handle_result)
}

socket.on("connect", () => {
    console.log("Connected to server!");
})



function dragElement(element, direction) {
    var   md;
    element.onmousedown = onMouseDown;
    function onMouseDown(e)
    {
        if (direction == "V") {
            md = {e,
                offsetLeft:  element.offsetLeft,
                offsetTop:   parseInt(getComputedStyle(element).top.slice(0, -2), 10),
                firstHeight:  monacoEditor.offsetHeight,
                secondHeight: outputArea.offsetHeight
               };
        } else if (direction == "H") {
            md = {e,
                offsetLeft:  element.offsetLeft,
                offsetTop:   element.offsetTop,
                firstWidth:  leftDiv.offsetWidth,
                secondWidth: rightDiv.offsetWidth
               };
        }
  

        document.onmousemove = onMouseMove;
        document.onmouseup = () => {
            document.onmousemove = document.onmouseup = null;
        }
    }

    function onMouseMove(e)
    {
        //console.log("mouse move: " + e.clientX);
        var delta = {x: e.clientX - md.e.clientX,
                     y: e.clientY - md.e.clientY};

        if (direction == "H" )
        {
            contentDiv.style.gridTemplateColumns = (md.offsetLeft + delta.x) + "px 5px 1fr";
        

        } else if (direction == "V") {

            rightDiv.style.gridTemplateRows = (md.firstHeight + delta.y) + "px 5px 1fr";
        }
    }
}

dragElement(document.getElementById("vertical-seperator"), "H");
dragElement(document.getElementById("horizontal-seperator"), "V");