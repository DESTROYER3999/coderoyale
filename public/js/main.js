const socket = io();

// const runButton = document.getElementById("run-btn");
const outputArea = document.getElementById("output");
const leftDiv  = document.getElementsByClassName("left")[0];
const rightDiv = document.getElementsByClassName("right")[0];
const monacoContainer = document.getElementById('monaco-container');
const contentDiv = document.getElementById("maincontent");
const mdeElement = document.getElementById("simplemde-editor");
const windows = document.getElementsByClassName("window");
const verticalSeperator = document.getElementById("vertical-seperator");
const horizontalSeperator = document.getElementById("horizontal-seperator");
const outputDiv = document.getElementById("output-window");

// runButton.addEventListener("click", run_clicked);

require.config({ paths: { vs: 'monaco-editor/min/vs' } });

const editMde = new SimpleMDE({
    element: mdeElement,
    spellChecker: false,
    status: false,
    hideIcons: ['guide', 'fullscreen', 'side-by-side'],
    showIcons: ["code", "strikethrough", "table", "horizontal-rule"]

});

function editor_layout() {
    editor.layout({
        width: 0,
        height: 0
    });    
    editor.layout({
        width: document.body.offsetWidth - verticalSeperator.offsetLeft - 10,
        height: rightDiv.offsetHeight - outputDiv.offsetHeight - 45
    });

}

function content_layout() {
    contentDiv.style.gridTemplateColumns = "1fr auto 1fr";
}



require(['vs/editor/editor.main'], function () {
    monaco.editor.defineTheme('my-dark', {
        base: 'vs-dark', 
        inherit: true,
        rules: [{ background: '#444444' }],
        colors: {
            "editor.foreground": "#aaaaaa",
            "editor.background": '#444444',
            "editor.lineHighlightBorder": "white"
        }
    });
    
    editor = monaco.editor.create(monacoContainer, {
        value: "",
        language: 'python',
        automaticLayout: false,
        theme: "vs-dark",
        fontSize: "16px",
        minimap: {
            enabled: false
        },
        lineNumbersMinChars: 3,
        lineDecorationsWidth: 3,
        top: 5
    });
    editor_layout();
    window.addEventListener("resize", editor_layout);
    window.addEventListener("resize", content_layout);

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



function handle_drag_seperator(seperator, parent, direction) {
    seperator.addEventListener("mousedown", (e) => {
        mouseDownEvent = e;
        document.onmousemove = (e) => onMouseMove(e, mouseDownEvent);
        document.onmouseup = () => {
            document.onmousemove = document.onmouseup = null;
        }
    })

    function onMouseMove(e, mouseDownEvent) {
        var delta = {
            x: e.clientX - mouseDownEvent.clientX, 
            y: e.clientY - mouseDownEvent.clientY
        };
        if (direction == "V") {
            let minWidthLeft = 5;
            for (let tab of windows[0].children[0].children) {
                minWidthLeft += tab.offsetWidth + 5;
            }
            minWidthLeft += 2;
            let tabsWidthRightTop = 5;
            for (let tab of windows[1].children[0].children) {
                tabsWidthRightTop += tab.offsetWidth + 5;
            }
            tabsWidthRightTop += 2;
            let tabsWidthRightBottom = 5;
            for (let tab of windows[2].children[0].children) {
                tabsWidthRightBottom += tab.offsetWidth + 5;
            }
            tabsWidthRightBottom += 2;
            let minWidthRight = Math.max(tabsWidthRightTop, tabsWidthRightBottom);
            let newWidth;
            newWidth = Math.max(mouseDownEvent.clientX + delta.x - 14, minWidthLeft);
            // contentDiv.offsetWidth - (212 + 5)
            newWidth = Math.min(contentDiv.offsetWidth - (minWidthRight + 5), newWidth);
            console.log(newWidth)
            parent.style.gridTemplateColumns = `${newWidth}px auto 1fr`;

        } else if (direction == "H") {
            let minWidthTop = 42 * 2;
            let minWidthBottom = 38 * 2;
            let newWidth;
            newWidth = Math.max(window.innerHeight - mouseDownEvent.clientY - delta.y - 22, minWidthBottom - 7);
            newWidth = Math.min(rightDiv.offsetHeight - (minWidthTop), newWidth + 10);
            console.log("NEW", newWidth)
            // contentDiv.offsetWidth - (212 + 5)
            // newWidth = Math.min(contentDiv.offsetWidth - (minWidthRight + 3), newWidth);

            parent.style.gridTemplateRows = `1fr auto ${newWidth}px`
        }
        // console.log(delta);
        // console.log(`${mouseDownEvent.offsetLeft + delta.x}px auto 1fr`, ":::", parent.style.gridTemplateColumns);
        // if (direction == "V" )
        // {
        //     contentDiv.style.gridTemplateColumns = (md.offsetLeft + delta.x) + "auto 1fr";
        //     // rightDiv.style.gridTemplateColumns = "1px " + (md.offsetLeft - delta.x) + "px";
        // } else if (direction == "H") {
        //     rightDiv.style.gridTemplateRows = (md.firstHeight + delta.y) + "px 1px 1fr";
            
        // }
        editor_layout();
    }
}

handle_drag_seperator(verticalSeperator, contentDiv, "V");
handle_drag_seperator(horizontalSeperator, rightDiv, "H");

for (let window of windows) {
    const controlsDiv = window.children[0];
    const tabs = controlsDiv.children;
    const pages = window.children[1].children;
    for (let i = 0; i < tabs.length; i++) {
        tabs[i].pages = pages[i];
        tabs[i].addEventListener("click", () => {
            for (let tab of tabs) {
                tab.classList.remove("selected");
                tab.pages.classList.remove("selected");
            }
            tabs[i].classList.add("selected");
            pages[i].classList.add("selected");
        })
    }
}


// function left_tab_clicked(childNum) {
//     for (let i = 0; i < leftDivs.length; i++) {
//         leftDivs[i].classList.remove("selected");
//         leftTabs[i].classList.remove("selected");
//     }
//     leftDivs[childNum].classList.add("selected");
//     leftTabs[childNum].classList.add("selected");
// }

// for (let i = 0; i < leftTabs.length; i++) {
//     leftTabs[i].addEventListener("click", () => left_tab_clicked(i));
// }
