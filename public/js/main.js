// const { text } = require("express");

const socket = io();

// const runButton = document.getElementById("run-btn");
const outputArea = document.getElementById("output");
const leftDiv  = document.getElementsByClassName("left")[0];
const rightDiv = document.getElementsByClassName("right")[0];
const editorMonacoContainer = document.getElementById('editor-monaco-container');
const contentDiv = document.getElementById("maincontent");
const mdeElement = document.getElementById("simplemde-editor");
const windows = document.getElementsByClassName("window");
const verticalSeperator = document.getElementById("vertical-seperator");
const horizontalSeperator = document.getElementById("horizontal-seperator");
const outputDiv = document.getElementById("output-window");
const lowerMonacoControlsDiv = document.getElementById("lower-monaco-controls");
const sampleTestsMonacoContainer = document.getElementById("sample-tests-monaco-container");
const submissionTestsMonacoContainer = document.getElementById("submission-tests-monaco-container");
// window.addEventListener("resize", content_layout);


// Make more organized controls button system later
const runButton = document.getElementById("run-button");
const runSampleTestsButton = document.getElementById("test-button");
const runSampleTestsCode = document.getElementById("run-sample-tests-code");
const runSubmissionTestsCode = document.getElementById("run-submission-tests-code");
const runSubmissionTestsButton = document.getElementById("sumbission-test-button");

runButton.addEventListener("click", run_clicked);
runSampleTestsButton.addEventListener("click", run_sample_tests_clicked);
runSampleTestsCode.addEventListener("click", run_sample_tests_code_clicked);
runSubmissionTestsCode.addEventListener("click", run_submission_tests_code_clicked);
runSubmissionTestsButton.addEventListener("click", run_submission_tests_clicked)

require.config({ paths: { vs: 'monaco-editor/min/vs' } });


// config windows and grids




function content_layout() {
    contentDiv.style.gridTemplateColumns = "1fr auto 1fr";
}

const challengeDescriptionDefault = `# Sum-Double
#### Example challenge


-----

## Goal:
Define the function \`sumDouble(numStr)\` that takes in a string (\`numStr\`) with two numbers seperated by a singe space and return their sum. If the two values are the same, return double their sum.


-----

## Examples:
\`\`\`
sum_double("1 2") → 3
sum_double("3 2") → 5
sum_double("2 2") → 8
\`\`\`

`

const monacoEditorDefault = `def sum_double(numStr):
    # Write your code here
    return numStr
`
const monacoSampleTestDefault = `import cr_test
from solution import sum_double

class ExampleTests(cr_test.TestGroup):
    def test_1(self):
        self.assert_equal(self, sum_double("1 2"), 3)

    def test_2(self):
        self.assert_equal(self, sum_double("3 2"), 5)

    def test_3(self):
        self.assert_equal(self, sum_double("2 2"), 8)

cr_test.run()
`

const monacoSubmissionTestDefault = `import random
from solution import sum_double
import cr_test

def actual_solution(numStr):
    num1 = int(numStr.split()[0])
    num2 = int(numStr.split()[1])
    if num1 == num2:
        return 2 * (num1 + num2)
    return num1 + num2

randomInputs = []
for x in range(100):
    randomInputs.append(f"{random.randint(1, 20)} {random.randint(1, 20)}")

class SubmissionTests(cr_test.TestGroup):
    def test_random_inputs(self):
        for randomInput in randomInputs:
            self.assert_equal(self, 
                                sum_double(randomInput), 
                                actual_solution(randomInput)
                            )

cr_test.run()

`

// const editMde = new SimpleMDE({
//     initialValue: challengeDescriptionDefault,
//     element: mdeElement,
//     spellChecker: false,
//     status: false,
//     hideIcons: ['guide', 'fullscreen', 'side-by-side'],
//     showIcons: ["code", "strikethrough", "table", "horizontal-rule"]

// });


// let monacoEditors = [];
// function create_monaco_editor(container, callback=null) {
//     require(['vs/editor/editor.main'], function () {
//         monaco.editor.defineTheme('my-dark', {
//             base: 'vs-dark', 
//             inherit: true,
//             rules: [{ background: '#444444' }],
//             colors: {
//                 "editor.foreground": "#aaaaaa",
//                 "editor.background": '#444444',
//                 "editor.lineHighlightBorder": "white"
//             }
//         });
//         let defaultValue;
//         if (monacoEditors.length == 0) {
//             defaultValue = monacoEditorDefault;
//         } else if (monacoEditors.length == 1) {
//             defaultValue = monacoSampleTestDefault;
//         } else if (monacoEditors.length == 2) {
//             defaultValue = monacoSubmissionTestDefault;
//         }
//         let editor = monaco.editor.create(container, {
//             value: defaultValue,
//             language: 'python',
//             automaticLayout: false,
//             theme: "vs-dark",
//             fontSize: "16px",
//             minimap: {
//                 enabled: false
//             },
//             lineNumbersMinChars: 3,
//             lineDecorationsWidth: 3
//         });
//         editor.container = container;
//         monacoEditors.push(editor);
//         if (callback) {
//             return callback();
//         }
//     });
// }

// create_monaco_editor(editorMonacoContainer);
// create_monaco_editor(sampleTestsMonacoContainer);
// create_monaco_editor(submissionTestsMonacoContainer, () => {
//     window.addEventListener("resize", editor_layout);
//     editor_layout(0);    
// });


function editor_layout() {
    // MAKE THIS BETTER
    for (let i = 0; i < monacoEditors.length; i++) {
        let currentEditor = monacoEditors[i];
        currentEditor.layout({
            width: 0,
            height: 0
        });
        if (window.getComputedStyle(currentEditor.container.parentElement).display != "none") {
            if (i == 0) {
                // Code editor
                currentEditor.layout({
                    width: document.body.offsetWidth - verticalSeperator.offsetLeft - 17,
                    height: rightDiv.offsetHeight - outputDiv.offsetHeight - 45 - lowerMonacoControlsDiv.offsetHeight - 15
                });
            } else if (i == 1) {
                // Sample test case editor
                console.log("RESIZING", currentEditor.container.offsetWidth, currentEditor.container.offsetHeight)
                currentEditor.layout({
                    width: currentEditor.container.offsetWidth,
                    height: currentEditor.container.offsetHeight - 15
                })

            } else if (i == 2) {
                // Sumbission test case editor
                currentEditor.layout({
                    width: currentEditor.container.offsetWidth,
                    height: currentEditor.container.offsetHeight - 15
                })

            }
        }
    }
}



function handle_code_result(result) {
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

function handle_test_result(result) {
    console.log("GOT RESULT OF SAMPLE TESTS:", result)
    if (result.error) {
        console.log("ERRROR");
        alert("Your code could not be run.")
    } else if (result.stderr) {
        console.log("Recieved stderr", result.stderr);
        outputArea.classList.add("error");
        outputArea.value = "Error running sample tests:\n" + result.stderr;
        
    } else if (result.stdout) {
        try {
            parsedResult = JSON.parse(result.stdout.replaceAll("'", '"'));
        } catch(err) {
            outputArea.value = "Error running sample tests:\nMake sure there are no print statements in your code.";
            return;
        }
        let resultStr = `Finished running ${Object.keys(parsedResult).length} TestGroup(s):\n`;
        console.log(parsedResult);


        for (let testGroup in parsedResult) {
            
            resultStr += ` ---- ${testGroup} ---- \n`

            for (let test in parsedResult[testGroup]) {
                resultStr += `Results of test: ${test}\n`;
                console.log("TEST:", test)

                test = parsedResult[testGroup][test]
                console.log("TEST:", test)
                a = test.a;
                b = test.b;
                x = test.x;
                if (test.result == "True") {
                    resultStr += ` > Test passed!\n`;
                } else if (test.result == "False") {
                    resultStr += ` > Test failed.\n > `
                
                    if (test.assertion == "equal") {
                        resultStr += `${a} should equal ${b}`
                    } else if (test.assertion == "not_equal") {
                        resultStr += `${a} should not equal ${b}`
                    } else if (test.assertion == "true") {
                        resultStr += `${x} should be true`
                    } else if (test.assertion == "false") {
                        resultStr += `${x} should be false`
                    } else if (test.assertion == "is") {
                        resultStr += `${a} should be ${b}`
                    } else if (test.assertion == "is_not") {
                        resultStr += `${a} should not be ${b}`
                    } else if (test.assertion == "is_none") {
                        resultStr += `${x} should be none`
                    } else if (test.assertion == "is_not_none") {
                        resultStr += `${x} should not be none`
                    } else if (test.assertion == "in") {
                        resultStr += `${a} should be in ${b}`
                    } else if (test.assertion == "not_in") {
                        resultStr += `${a} should not be in ${b}`
                    } else if (test.assertion == "is_instance") {
                        resultStr += `${a} should be an instance of ${b}`
                    } else if (test.assertion == "not_is_instance") {
                        resultStr += `${a} should not be an instance of ${b}`
                    }
                    resultStr += "\n\n";
                }
            }
            
        }


        outputArea.classList.remove("error");
        outputArea.value = resultStr;
    }
    outputArea.value += `\nProcess finished with exit code ${result.code}`;
}

function run_sample_tests_clicked() {
    outputArea.value = "";
    socket.emit("execute sample tests", {
        "code": monacoEditors[0].getValue(),
        "sampleTests": monacoEditors[1].getValue(),
        "stdin": ""
    }, handle_test_result)
}

function run_sample_tests_code_clicked() {
    outputArea.value = "";
    socket.emit("execute sample tests code", {
        "code": monacoEditors[1].getValue(),
        "stdin": ""
    }, handle_code_result)
}

function run_submission_tests_code_clicked() {
    outputArea.value = "";
    socket.emit("execute submission tests code", {
        "code": monacoEditors[2].getValue(),
        "stdin": ""
    }, handle_code_result)
}

function run_submission_tests_clicked() {
    outputArea.value = "";
    socket.emit("execute sample tests", {
        "code": monacoEditors[0].getValue(),
        "sampleTests": monacoEditors[2].getValue(),
        "stdin": ""
    }, handle_test_result)
}

function run_clicked() {
    outputArea.value = "";
    socket.emit("execute", {
        "code": monacoEditors[0].getValue(),
        "stdin": ""
    }, handle_code_result)
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
            parent.style.gridTemplateColumns = `${newWidth}px auto 1fr`;

        } else if (direction == "H") {
            let minWidthTop = 60 * 2;
            let minWidthBottom = 40 * 2;
            let newWidth;
            newWidth = Math.max(window.innerHeight - mouseDownEvent.clientY - delta.y - 22, minWidthBottom - 7);
            newWidth = Math.min(rightDiv.offsetHeight - (minWidthTop), newWidth + 10);
            // contentDiv.offsetWidth - (212 + 5)
            // newWidth = Math.min(contentDiv.offsetWidth - (minWidthRight + 3), newWidth);

            parent.style.gridTemplateRows = `1fr auto ${newWidth}px`
        }

        // editor_layout();
    }
}

// handle_drag_seperator(verticalSeperator, contentDiv, "V");
// handle_drag_seperator(horizontalSeperator, rightDiv, "H");

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
            // editor_layout();
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
