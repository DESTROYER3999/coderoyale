
require.config({ paths: { vs: 'monaco-editor/min/vs' } });

let hSeperators = [];
let vSeperators = [];

const challengeInfoDefault = ``

const mainEditorDefault = `
def solution_func(x):
    return x

`
const sampleTestsDefault = `import cr_test
from solution import solution_func

class ExampleTests(cr_test.TestGroup):
    def integer_tests(self):
        self.assert_equal(self, solution_func(1), 1)
        self.assert_equal(self, solution_func(2), 2)

    def string_tests(self):
        self.assert_equal(self, solution_func("a"), "a")

`

const submissionTestsDefault = `import random
from solution import solution_func
import cr_test

def actual_solution(x):
    return x


randomInputs = []
for x in range(100):
    randomInputs.append(random.randint(0, 50))

class SubmissionTests(cr_test.TestGroup):
    def test_random_inputs(self):
        for randomInput in randomInputs:
            self.assert_equal(self, 
                                solution_func(randomInput), 
                                actual_solution(randomInput)
                            )

`


function is_visible(element) {
    return (element.offsetParent != null)
}

function page_from_tab(tab) {
    let tabs = [];
    for (let element of tab.parentElement.children) {
        if (element.classList.contains("tab")) {
            tabs.push(element);
        }
    }


    return tab.parentElement.parentElement.lastElementChild.children[tabs.indexOf(tab)];

}


function elementsFromPoint(x, y) {
	var elements = [], previousPointerEvents = [], current, i, d;

	if(typeof document.elementsFromPoint === "function")
		return document.elementsFromPoint(x,y);
	if(typeof document.msElementsFromPoint === "function")
		return document.msElementsFromPoint(x,y);
	
    // get all elements via elementFromPoint, and remove them from hit-testing in order
	while ((current = document.elementFromPoint(x,y)) && elements.indexOf(current)===-1 && current != null) {
          
        // push the element and its current style
		elements.push(current);
		previousPointerEvents.push({
            value: current.style.getPropertyValue('pointer-events'),
            priority: current.style.getPropertyPriority('pointer-events')
        });
          
        // add "pointer-events: none", to get to the underlying element
		current.style.setProperty('pointer-events', 'none', 'important'); 
	}

    // restore the previous pointer-events values
	for(i = previousPointerEvents.length; d=previousPointerEvents[--i]; ) {
		elements[i].style.setProperty('pointer-events', d.value?d.value:'', d.priority); 
	}
      
    // return our results
	return elements;
}

function start_editor_layout() {

    let editors = [mainEditor, sampleTestsEditor, submissionTestsEditor];
    for (let i = 0; i < editors.length; i++) {
        let editor = editors[i];
        if (is_visible(editor.container)) {
            editor.container.style.position = "absolute";
        }
    }
}

function finish_editor_layout() {
    let editors = [mainEditor, sampleTestsEditor, submissionTestsEditor];
    for (let i = 0; i < editors.length; i++) {
        let editor = editors[i];
        if (is_visible(editor.container)) {
            // editor.container.style.display = "none";
            // editor.container.style.position = "absolute";

            let newWidth = Math.floor(editor.container.parentElement.offsetWidth);
            let newHeight = Math.floor(editor.container.parentElement.offsetHeight);

            editor.layout({
                width: newWidth,
                height: newHeight
            })
    
            editor.container.style.position = null;

        }
    }
}

function insert_cr_logo() {
    let tabsContainers = document.getElementsByClassName("tabs-container");
    let firstContainer = document.getElementById("maincontent").firstElementChild.firstElementChild;
    let tabsContainer = firstContainer.firstElementChild.nextElementSibling.firstElementChild.nextElementSibling;

    for (let tc of tabsContainers) {
        if (tc.firstElementChild && tc.firstElementChild.tagName == "A") {
            tc.firstElementChild.remove();
        }
    }


    tabsContainer.insertAdjacentHTML("afterBegin", '<a href="/"><img class="logo" src="/global/images/logo.png"></a>');
    document.getElementsByClassName("logo")[0].onload = () => tab_cover_layout();

}
function start_test_result_layout() {
    let testResults = document.getElementsByClassName("output");
    for (let testResult of testResults) {
        if (is_visible(testResult)) {
            testResult.style.width = testResult.offsetWidth + "px";
            let newTop = 0;
            for (let child of testResult.parentElement.children) {
                if (child != testResult) {
                    newTop += child.offsetHeight;
                }
            }
            testResult.parentElement.style.position = "relative";
            testResult.style.position = "absolute";
            testResult.style.top = newTop + "px";

        }
    }
}

function finish_test_result_layout() {
    let testResults = document.getElementsByClassName("output");
    for (let testResult of testResults) {
        if (is_visible(testResult)) {
            let newHeight = testResult.parentElement.offsetHeight;
            for (let child of testResult.parentElement.children) {
                if (child != testResult) {
                    newHeight -= child.offsetHeight;
                }
            }
            testResult.style = null;

            testResult.style.height = newHeight + "px";

        }
    }
}

function md_layout() {

    let cmScroll = document.getElementsByClassName("CodeMirror-scroll")[0];
    if (is_visible(cmScroll)) {
        cmScroll.style.display = "none";
        let newHeight = cmScroll.parentElement.offsetHeight - 72;
        cmScroll.style.height = newHeight + "px";
        cmScroll.style.display = null;
    }

}

function tab_cover_layout() {
    let tabs = document.getElementsByClassName("tab");
    for (let tab of tabs) {
        if (tab.classList.contains("selected")) {
            for (let child of tab.parentElement.parentElement.children) {
                if (child.classList.contains("tab-cover")) {
                    child.style.width = tab.offsetWidth + "px";
                    child.style.left = tab.offsetLeft + "px";
                    child.style.top = tab.parentElement.offsetTop + tab.offsetHeight + 5 + "px";
                }
            }
        }
        
    }
    
}

function insert_mde_title() {
    let codeMirror = document.getElementsByClassName("CodeMirror")[0];

    codeMirror.insertAdjacentHTML("afterBegin", "<div><span style='font-size: 30px; line-height: 2; color: #777; font-weight: bold;'># </span><span contenteditable='true' class='title-input'>Title</span>");

}

function window_layout() {
    // Clean this up too

    // Layout outer padding
    let outers = document.getElementsByClassName("outer");


    for (let outer of outers) {
        let leftPadding = document.createElement("div");
        leftPadding.classList.add("outer-padding", "vertical", "left");

        let rightPadding = document.createElement("div");
        rightPadding.classList.add("outer-padding", "vertical", "right");

        // let topPadding = document.createElement("div");
        // topPadding.classList.add("outer-padding", "horizontal", "top");


        // let bottomPadding = document.createElement("div");
        // bottomPadding.classList.add("outer-padding", "horizontal", "bottom");

        // let currentPaddings = outer.getElementsByClassName("outer-padding");
        let toRemove = [];
        for (let child of outer.children) {
            if (child.classList.contains("outer-padding")) {
                toRemove.push(child);
            }
        }
        for (let child of toRemove) {
            child.remove();
        }
        // for (let currentPadding of currentPaddings) {
        //     currentPadding.remove();
        // }

        outer.appendChild(leftPadding);
        outer.appendChild(rightPadding);
        // outer.appendChild(topPadding);
        // outer.appendChild(bottomPadding);
    }


    // Layout containers
    let outerContents = document.getElementsByClassName("outer-content");
    // let contentContainer = document.getElementById("maincontent");

    for (let outerContent of outerContents) {
        let outerContentStyle = [];
        let shouldBeSeperator = false;
        let newElements = [];
        for (let element of outerContent.children) {

            if (shouldBeSeperator) {
                if (!element.classList.contains("seperator")) {
                    shouldBeSeperator = true;
    
                    let vSeperator = document.createElement("div");
                    vSeperator.classList.add("seperator", "vertical");
                    vSeperators.push(vSeperator);
                    outerContentStyle.push("auto");
                    outerContentStyle.push("1fr");
                    newElements.push(vSeperator);
                    newElements.push(element);
                    // container.insertBefore(hSeperator, window);
                } else {
                    shouldBeSeperator = false;
                    outerContentStyle.push("auto");
                    newElements.push(element);
                }
    
            } else {
                if (element.classList.contains("container")) {
                    shouldBeSeperator = true;
                    outerContentStyle.push("1fr");
                    newElements.push(element);
    
                } else {
                    // element.remove();
                }
            }
        }
        for (let child of outerContent.children) {
            child.remove();
        }
        for (let element of newElements) {
            outerContent.appendChild(element);
        }
    
        outerContent.style.gridTemplateColumns = outerContentStyle.join(" ");
    }
 
    // Layout windows
    let containers = document.getElementsByClassName("container");
    for (let container of containers) {
        // let containerStyle = "1fr";


        let toRemove = [];
        for (let child of container.children) {

            if (child.classList.contains("outer-padding")) {
                toRemove.push(child);
            }
        }
        for (let child of toRemove) {
            child.remove();
        }
        // let seperators = result.seperators;


        // let seperatorPercent = (0.005 / windows.length) * 100;
        
        let topPadding = document.createElement("div");
        topPadding.classList.add("outer-padding", "horizontal", "top");


        let bottomPadding = document.createElement("div");
        bottomPadding.classList.add("outer-padding", "horizontal", "bottom");

        let containerStyle = ["auto"];
        let shouldBeSeperator = false;
        let newElements = [];
        for (let element of container.children) {

            if (shouldBeSeperator) {
                if (!element.classList.contains("seperator")) {
                    shouldBeSeperator = true;

                    let hSeperator = document.createElement("div");
                    hSeperator.classList.add("seperator", "horizontal");
                    hSeperators.push(hSeperator);
                    containerStyle.push("auto");
                    containerStyle.push("1fr");
                    newElements.push(hSeperator);
                    newElements.push(element);
                    // container.insertBefore(hSeperator, window);
                } else {
                    shouldBeSeperator = false;
                    containerStyle.push("auto");
                    newElements.push(element);
                }

            } else {
                if (element.classList.contains("window")) {

                    shouldBeSeperator = true;
                    containerStyle.push("1fr");
                    newElements.push(element);
    
                }
            }
        }
        containerStyle.push("auto");
        for (let child of container.children) {
            child.remove();
        }



        container.appendChild(topPadding);

        for (let element of newElements) {
            container.appendChild(element);
        }

        container.appendChild(bottomPadding);

        container.style.gridTemplateRows = containerStyle.join(" ");


    }

    // Layout pages without lower controls
    let pages = document.getElementsByClassName("page");
    for (let page of pages) {
        if (page.children.length == 1) {
            if (page.firstElementChild.id != "simplemde-container") {
                page.firstElementChild.style.gridTemplateRows = "1fr";

            }
        } else {
            page.firstElementChild.style.gridTemplateRows = "auto 1fr";
        }
    }

}


function bind_hSeperators() {

    function mouse_down(e, hSeperator) {
        let parent = hSeperator.parentElement;

        start_editor_layout();
        start_test_result_layout();

        document.onmousemove = (de) => mouse_move(de, hSeperator, parent);
        document.onmouseup = mouse_up;

    }
    function mouse_up() {
        document.onmousemove = null;
        document.onmouseup = null;
        size_dependant_layout(start_editor_layout, start_test_result_layout);


    }
    function mouse_move(de, hSeperator, parent) {
        let containerElements = Array.from(hSeperator.parentElement.children);
        let myIndex = containerElements.indexOf(hSeperator);
        let currentGridStyle = parent.style.gridTemplateRows.split(" ");
        let currentFrTop = parseFloat(currentGridStyle[myIndex - 1].slice(0, -2), 10);
        let currentFrBottom = parseFloat(currentGridStyle[myIndex + 1].slice(0, -2), 10);
        let currentFrPxHeight = containerElements[containerElements.length - 2].offsetHeight / parseFloat(currentGridStyle[currentGridStyle.length - 2].slice(0, -2), 10)

        let newPxHeight = de.clientY - containerElements[myIndex - 1].offsetTop - 2        
        let newFrHeightTop = (newPxHeight / currentFrPxHeight)
        let newFrHeightBottom = currentFrBottom + (currentFrTop - newFrHeightTop);

        currentGridStyle[myIndex - 1] = `${newFrHeightTop}fr`;
        currentGridStyle[myIndex + 1] = `${newFrHeightBottom}fr`;
        parent.style.gridTemplateRows = currentGridStyle.join(" ");
    }

    for (let hSeperator of hSeperators) {
        hSeperator.onmousedown = (e) => mouse_down(e, hSeperator);
    }
}


function bind_vSeperators() {

    function mouse_down(e, vSeperator) {
        let parent = vSeperator.parentElement;

        start_editor_layout();
        start_test_result_layout();
        document.onmousemove = (e) => mouse_move(e, vSeperator, parent);
        document.onmouseup = mouse_up;

    }
    function mouse_up() {
        document.onmousemove = null;
        document.onmouseup = null;
        size_dependant_layout(start_editor_layout, start_test_result_layout);

    }
    function mouse_move(de, vSeperator, parent) {
        let containerElements = Array.from(vSeperator.parentElement.children);

        let myIndex = containerElements.indexOf(vSeperator);
        let currentGridStyle = parent.style.gridTemplateColumns.split(" ");
        let currentFrLeft = parseFloat(currentGridStyle[myIndex - 1].slice(0, -2), 10);
        let currentFrRight = parseFloat(currentGridStyle[myIndex + 1].slice(0, -2), 10);
        let currentFrPxWidth = containerElements[containerElements.length - 1].offsetWidth / parseFloat(currentGridStyle[currentGridStyle.length - 1].slice(0, -2), 10)

        let newPxWidth = de.clientX - containerElements[myIndex - 1].offsetLeft - 2        
        let newFrWidthLeft = (newPxWidth / currentFrPxWidth)
        let newFrWidthRight = currentFrLeft + (currentFrRight - newFrWidthLeft);

        currentGridStyle[myIndex - 1] = `${newFrWidthLeft}fr`;
        currentGridStyle[myIndex + 1] = `${newFrWidthRight}fr`;

        parent.style.gridTemplateColumns = currentGridStyle.join(" ");
    }

    for (let vSeperator of vSeperators) {
        vSeperator.onmousedown = (e) => mouse_down(e, vSeperator);
    }
}


function bind_tab_pages() {
    
    function tab_clicked(e) {
        let tab = e.currentTarget;
        let page = page_from_tab(tab);
        let relatedTabs = tab.parentElement.children;
        let relatedPages = tab.parentElement.parentElement.lastElementChild.children;

        
        for (let otherTab of relatedTabs) {
            otherTab.classList.remove("selected");
        }
        for (let otherPage of relatedPages) {
            otherPage.classList.remove("selected");
        }
    
        tab.classList.add("selected");
        page.classList.add("selected");
        let onfinishedselectEvent = new CustomEvent("onfinishedselect", { detail: e });
        document.dispatchEvent(onfinishedselectEvent);
        size_dependant_layout();
    }

    let tabs = document.getElementsByClassName("tab");
    let windows = document.getElementsByClassName("window");
    
    for (let window of windows) {
        let hasCover = false;
        for (let child of window.children) {
            if (child.classList.contains("tab-cover")) {
                hasCover = true;
            }
        }
        if (!hasCover) {
            window.insertAdjacentHTML("afterBegin", "<span class='tab-cover'></span>");
            // window.innerHTML = "" + window.innerHTML;
        }

    }

    for (let tab of tabs) {
        tab.onmousedown = tab_clicked;
        if (tab.classList.contains("selected")) {
            page_from_tab(tab).classList.add("selected");
        }
    }
    
}

function bind_tag_drag() {
    function mouse_down(customEvent) {
        e = customEvent.detail;
        let tab = e.currentTarget;
    

        let tabIndex = Array.from(tab.parentElement.children).indexOf(tab)
        let page = page_from_tab(tab);

        let startPos = {
            x: e.clientX,
            y: e.clientY
        }
        let startOffset = {
            x: tab.offsetLeft - 5,
            y: tab.offsetTop - 5
        }
        document.onmousemove = (de) => mouse_move(de, tab, page, startPos, startOffset);
        document.onmouseup = (e) => document.onmousemove = null;
    }

    function mouse_up(e, dragContainer, originalParent, hiddenElements) {
        // Make this function WAY better
        document.onmouseup = null;
        document.onmousemove = null;
        let selectedElement;
 

        let pointResult = elementsFromPoint(e.clientX, e.clientY);

        let tabsContainers = document.getElementsByClassName("tabs-container");
        let outerPaddings = document.getElementsByClassName("outer-padding");

        
        for (let currentOuterPadding of outerPaddings) {
            if (pointResult.includes(currentOuterPadding)) {
                selectedElement = currentOuterPadding;
            }
        }
        for (let currentHSeperator of hSeperators) {
            if (pointResult.includes(currentHSeperator)) {
                selectedElement = currentHSeperator;
            }
        }
        for (let currentVSeperator of vSeperators) {
            if (pointResult.includes(currentVSeperator)) {
                selectedElement = currentVSeperator;
            }
        }
        
        for (let currentTabsContainer of tabsContainers) {
            if (pointResult.includes(currentTabsContainer)) {
                selectedElement = currentTabsContainer;
            }
        }

        
        let currentTab = dragContainer.firstElementChild;
        let currentPage = dragContainer.lastElementChild;



        if (!selectedElement) {
            if (Object.keys(hiddenElements).length == 0) {
                currentTab.style = null;
                currentPage.style = null;
                originalParent[0].appendChild(currentTab);
                originalParent[1].appendChild(currentPage);
                for (let sibling of currentTab.parentElement.children) {
                    if (sibling != currentTab) {
                        sibling.classList.remove("selected");
                    }
                }
                for (let sibling of currentPage.parentElement.children) {
                    if (sibling != currentPage) {
                        sibling.classList.remove("selected");
                    }
                }

            } else {
                for (let num of Object.keys(hiddenElements)) {
                    let parent = hiddenElements[num][0];
                    let element = hiddenElements[num][1];
                    parent.appendChild(element);
                    currentTab.style = null;
                    currentPage.style = null;
                    originalParent[0].appendChild(currentTab);
                    originalParent[1].appendChild(currentPage);
                }
            }

            dragContainer.remove();

            position_dependant_layout();
            size_dependant_layout();
            return;
        }

        




        if (selectedElement.classList.contains("outer-padding")) {
            if (selectedElement.classList.contains("vertical")) {
                let parentContainer = selectedElement.parentElement.firstElementChild;

                let newContainer = document.createElement("div");
                newContainer.classList.add("container");
                
                let newWindow = document.createElement("div");
                newContainer.appendChild(newWindow);
                
                let newPageIndex;
                if (selectedElement.classList.contains("left")) {
                    newPageIndex = 0;
    
                } else if (selectedElement.classList.contains("right")) {
                    newPageIndex = parentContainer.children.length;
    
                }
    
    
                newWindow.classList.add("window");
    
                let newTabsContainer = document.createElement("div");
                newTabsContainer.classList.add("tabs-container");
                newWindow.appendChild(newTabsContainer);
                
                let newPages = document.createElement("div");
                newPages.classList.add("pages");
                newWindow.appendChild(newPages);
    
                newTabsContainer.appendChild(currentTab);
                newPages.appendChild(currentPage);
    
                parentContainer.insertBefore(newContainer, parentContainer.children[newPageIndex]);
            } else if (selectedElement.classList.contains("horizontal")) {
                let parentContainer = selectedElement.parentElement;
                let newWindow = document.createElement("div");

                let newPageIndex;
                if (selectedElement.classList.contains("top")) {
                    newPageIndex = 0;

                } else if (selectedElement.classList.contains("bottom")) {
                    newPageIndex = parentContainer.children.length;
                }
    
                newWindow.classList.add("window");
    
                let newTabsContainer = document.createElement("div");
                newTabsContainer.classList.add("tabs-container");
                newWindow.appendChild(newTabsContainer);
                
                let newPages = document.createElement("div");
                newPages.classList.add("pages");
                newWindow.appendChild(newPages);
    
                newTabsContainer.appendChild(currentTab);
                newPages.appendChild(currentPage);
    
                parentContainer.insertBefore(newWindow, parentContainer.children[newPageIndex]);
            }
           
        } else if (selectedElement.classList.contains("seperator")) {
            let parentContainer = selectedElement.parentElement;

            if (selectedElement.classList.contains("horizontal")) {

                let newWindow = document.createElement("div");


                let newPageIndex = Array.from(parentContainer.children).indexOf(selectedElement);
    
                newWindow.classList.add("window");
    
                let newTabsContainer = document.createElement("div");
                newTabsContainer.classList.add("tabs-container");
                newWindow.appendChild(newTabsContainer);
                
                let newPages = document.createElement("div");
                newPages.classList.add("pages");
                newWindow.appendChild(newPages);
    
                newTabsContainer.appendChild(currentTab);
                newPages.appendChild(currentPage);
    
                parentContainer.insertBefore(newWindow, parentContainer.children[newPageIndex]);
            } else if (selectedElement.classList.contains("vertical")) {
                let newContainer = document.createElement("div");
                newContainer.classList.add("container");
                
                let newWindow = document.createElement("div");
                newContainer.appendChild(newWindow);


                let newPageIndex = Array.from(parentContainer.children).indexOf(selectedElement);

                newWindow.classList.add("window");

                let newTabsContainer = document.createElement("div");
                newTabsContainer.classList.add("tabs-container");
                newWindow.appendChild(newTabsContainer);
                
                let newPages = document.createElement("div");
                newPages.classList.add("pages");
                newWindow.appendChild(newPages);

                newTabsContainer.appendChild(currentTab);
                newPages.appendChild(currentPage);

                parentContainer.insertBefore(newContainer, parentContainer.children[newPageIndex]);
            }
   



        } else if (selectedElement.classList.contains("tabs-container")) {
            let parentContainer = selectedElement.parentElement;

            for (let tab of selectedElement.children) {
                tab.classList.remove("selected");
            }
            for (let page of parentContainer.lastElementChild.children) {
                page.classList.remove("selected");
            }
            selectedElement.appendChild(currentTab);
            parentContainer.lastElementChild.appendChild(currentPage);

            

        }

        currentTab.style = null;

        currentPage.style = null
        dragContainer.remove()


        for (let element of document.getElementsByClassName("hover")) {
            element.classList.remove("hover");
        }

        position_dependant_layout();
        size_dependant_layout();
        

    } // end

    function handle_drag(de, startPos, startOffset, dragContainer) {

        for (let element of document.getElementsByClassName("hover")) {
            element.classList.remove("hover");
        }
        let selectedElement;
        let pointResult = elementsFromPoint(de.clientX, de.clientY);
        let tabsContainers = document.getElementsByClassName("tabs-container");
        let outerPaddings = document.getElementsByClassName("outer-padding");
        // let pageContents = document.getElementsByClassName("page-content");


        // for (let pageContent of pageContents) {
        //     if (pointResult.includes(pageContent)) {
        //         selectedElement = pageContent;
        //     }
        // }
        for (let currentOuterPadding of outerPaddings) {
            if (pointResult.includes(currentOuterPadding)) {
                selectedElement = currentOuterPadding;
            }
        }
        for (let currentHSeperator of hSeperators) {
            if (pointResult.includes(currentHSeperator)) {
                selectedElement = currentHSeperator;
            }
        }
        for (let currentVSeperator of vSeperators) {
            if (pointResult.includes(currentVSeperator)) {
                selectedElement = currentVSeperator;
            }
        }
        
        for (let currentTabsContainer of tabsContainers) {
            if (pointResult.includes(currentTabsContainer)) {
                selectedElement = currentTabsContainer;
            }
        }
        if (selectedElement) {
            // if (selectedElement.classList.contains("page-content")) {
            //     selectedElement.classList.add("hover");
            // } else 
            
            if (selectedElement.classList.contains("outer-padding")) {
                selectedElement.classList.add("hover");
            } else if (selectedElement.classList.contains("seperator")) {
                selectedElement.classList.add("hover");
                // if (selectedElement.classList.contains("horizontal")) {
    
                // } else if (selectedElement.classList.contains("vertical")) {
    
                // }
            } else if (selectedElement.classList.contains("tabs-container")) {
                selectedElement.parentElement.classList.add("hover");
            }
        }


        dragContainer.style.left = `${de.clientX - (startPos.x - startOffset.x)}px`;
        dragContainer.style.top = `${de.clientY - (startPos.y - startOffset.y)}px`;
    }
    function mouse_move(de, tab, page, startPos, startOffset) {
        let distance = Math.hypot(de.clientX - startPos.x, de.clientY - startPos.y);
        if (distance >= 20) {
            if (Array.from(page.parentElement.parentElement.parentElement.children).filter(el => el.classList.contains("window")).length == 1) {
                if (page.parentElement.parentElement.parentElement.parentElement.parentElement.id != "maincontent") {
                    if (tab.parentElement.children.length == 1) {
                        return;
                    }
                }
            }

            let beforeWidth = page.offsetWidth;
            let beforeHeight = page.offsetHeight;

            let dragContainer = make_element("div", ["drag-container", "page", "selected"])
            let tabsContainer = tab.parentElement;
            let pagesContainer = tabsContainer.parentElement.lastElementChild;
            let currentWindow = tabsContainer.parentElement;
            let currentContainer = currentWindow.parentElement;
            let hiddenElements = {};
            let originalParent = [tab.parentElement, page.parentElement];
            let hiddenElementsContainer = make_element("div", ["hidden-elements"]);
            document.body.appendChild(hiddenElementsContainer);
            function add_hidden(element) {
                hiddenElements[Object.keys(hiddenElements).length] = [element.parentElement, element];
                hiddenElementsContainer.appendChild(element);

            }

            dragContainer.appendChild(tab);
            dragContainer.appendChild(page);
            document.body.appendChild(dragContainer);
            if (tabsContainer.lastElementChild) {
                console.log("LAST", tabsContainer.lastElementChild)
                if (tabsContainer.lastElementChild.classList.contains("logo")) {
                    tabsContainer.lastElementChild.remove();
                } else {
                    tabsContainer.lastElementChild.classList.add("selected");
                    pagesContainer.lastElementChild.classList.add("selected");
                }

            }
            if (currentWindow.children[1].children.length == 0) {
                if (currentWindow.previousElementSibling && currentWindow.previousElementSibling.classList.contains("seperator")) {
                    currentWindow.previousElementSibling.remove();

                }
                add_hidden(currentWindow);
                if (currentContainer.children.length == 2) {
                    if (currentContainer.previousElementSibling && currentContainer.previousElementSibling.classList.contains("seperator")) {
                        currentContainer.previousElementSibling.remove();
                    }
                    add_hidden(currentContainer);
                }

            }

        

            page.style.border = "1px solid #555555";
 
            page.style.width = `${beforeWidth}px`;
            page.style.height = `${beforeHeight}px`;

            tab.style.marginTop = "6px";
            tab.style.marginLeft = "5px";
     
        
            dragContainer.style.left = `${de.clientX - (startPos.x - startOffset.x)}px`;
            dragContainer.style.top = `${de.clientY - (startPos.y - startOffset.y)}px`;

            position_dependant_layout();
            size_dependant_layout();


            document.onmousemove = (de) => handle_drag(de, startPos, startOffset, dragContainer);
            document.onmouseup = (de) => mouse_up(de, dragContainer, originalParent, hiddenElements);

        }

    }

    document.addEventListener("onfinishedselect", mouse_down);

}



function size_dependant_layout(...exclusions) {
    if (!exclusions.includes(start_editor_layout)) {
        start_editor_layout();
    }
    if (!exclusions.includes(start_test_result_layout)) {
        start_test_result_layout();
    }
    if (!exclusions.includes(md_layout)) {
        md_layout();
    }
    if (!exclusions.includes(finish_editor_layout)) {
        finish_editor_layout();
    }
    if (!exclusions.includes(finish_test_result_layout)) {
        finish_test_result_layout();
    }
    if (!exclusions.includes(tab_cover_layout)) {
        tab_cover_layout();
    }


}

function position_dependant_layout(...exclusions) {
    if (!exclusions.includes(window_layout)) {
        window_layout();
    }
    
    if (!exclusions.includes(bind_hSeperators)) {
        bind_hSeperators();
    }
    if (!exclusions.includes(bind_vSeperators)) {
        bind_vSeperators();
    }
    if (!exclusions.includes(bind_tab_pages)) {
        bind_tab_pages();
    }
    if (!exclusions.includes(insert_cr_logo)) {
        insert_cr_logo();
    }

}



// Create monaco editors
function create_monaco_editor(container, defaultValue="", callback=null) {
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
        let editor = monaco.editor.create(container, {
            value: defaultValue,
            language: 'python',
            automaticLayout: false,
            theme: "vs-dark",
            fontSize: "16px",
            minimap: {
                enabled: false
            },
            lineNumbersMinChars: 3,
            lineDecorationsWidth: 3
        });
        editor.container = container;
        if (callback) {
            return callback(editor);
        }
    });
}

function create_md_editor(container, defaultValue="", callback=null) {
    let editor = new SimpleMDE({
        initialValue: defaultValue,
        element: container,
        spellChecker: false,
        status: false,
        hideIcons: ['guide', 'fullscreen', 'side-by-side'],
        showIcons: ["code", "strikethrough", "table", "horizontal-rule"]
    
    }, () => {
        return callback(editor)
    });
}

let mainEditor;
let sampleTestsEditor;
let submissionTestsEditor;
let mainEditorContainer = document.getElementById("main-monaco-editor");
let sampleTestsContainer = document.getElementById("sampletests-monaco-editor");
let submissionTestsContainer = document.getElementById("submissiontests-monaco-editor");

let challengeInfoMde;
let challengeInfoMdeContainer = document.getElementById("challenge-info-mde");


create_monaco_editor(mainEditorContainer, mainEditorDefault, (createdEditor) => {
    mainEditor = createdEditor;
});
create_monaco_editor(sampleTestsContainer, sampleTestsDefault, (createdEditor) => {
    sampleTestsEditor = createdEditor;
});
create_monaco_editor(submissionTestsContainer, submissionTestsDefault, (createdEditor) => {
    submissionTestsEditor = createdEditor;
    create_md_editor(challengeInfoMdeContainer, challengeInfoDefault, (createdEditor) => {
        challengeInfoMde = createdEditor;
        insert_mde_title();
        position_dependant_layout();
        size_dependant_layout();
        bind_tag_drag();
        // window.addEventListener("resize", window_resized);
        let resizeTimeout;
        window.onresize = function(){
        clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(size_dependant_layout, 100);
        };
        // setTimeout(insert_mde_title, 100);
    });
    
});


let lowerControlsMapping = {}


function set_output(result) {
    let stdoutSpan = document.getElementById("stdout");
    let stderrSpan = document.getElementById("stderr");
    let exitcodeSpan = document.getElementById("exitcode");

    stdoutSpan.innerText = "";
    stderrSpan.innerText = "";
    exitcodeSpan.innerText = "";
    stderrSpan.classList.remove("error");

    if (result.error) {
        alert("There was an error running your code.")
        return
    } 
    if (result.stdout) {
        stdoutSpan.innerText = result.stdout;

    } 
    if (result.stderr) {
        stderrSpan.innerText = result.stderr
        
    }
    exitcodeSpan.innerText = `\nProcess finished with exit code ${result.exitcode}`;
}

function make_element(tag, classList) {
    let element = document.createElement(tag);
    if (classList) {
        element.classList.add(...classList)
    }
    return element
}

function make_results_info(passed, failed, onExpandClick, onSortClick, left=true) {
    let resultsInfoSpan = make_element("span", ["results-summary"]);
    let resultsInfoSpanPassed = make_element("span", ["pass"]);
    let resultsInfoSpanFailed = make_element("span", ["fail"]);

    // let groupSetDivSort = make_element("i", ["fas", "fa-sort"]);
    let groupSetDivExpand = make_element("i", ["fas", "fa-angle-double-right"]);

    groupSetDivExpand.addEventListener("click", onExpandClick);
    resultsInfoSpanPassed.addEventListener("click", onSortClick);
    resultsInfoSpanFailed.addEventListener("click", onSortClick);
    if (passed != null) {
        resultsInfoSpanPassed.innerText = "Passed: " + passed;
    }
    if (failed != null) {
        resultsInfoSpanFailed.innerText = "Failed: " + failed;
    }

    if (left) {
        // resultsInfoSpan.appendChild(groupSetDivSort);
        resultsInfoSpan.appendChild(groupSetDivExpand);
        // resultsInfoSpan.innerHTML += "&emsp;";

        resultsInfoSpan.appendChild(resultsInfoSpanPassed);
        // resultsInfoSpan.innerHTML += "&emsp;";
        resultsInfoSpan.appendChild(resultsInfoSpanFailed);
    } else {
        resultsInfoSpan.appendChild(resultsInfoSpanPassed);
        // resultsInfoSpan.innerHTML += "&emsp;";
        resultsInfoSpan.appendChild(resultsInfoSpanFailed);
        // resultsInfoSpan.innerHTML += "&emsp;";
        // resultsInfoSpan.appendChild(groupSetDivSort);
        resultsInfoSpan.appendChild(groupSetDivExpand);
    }
    



    return resultsInfoSpan
}

function get_fail_info(setResult) {
    let assertion = setResult.assertion;
    let a = setResult.a;
    let b = setResult.b;
    let x = setResult.x;
    if (assertion == "equal") {
        return [a, "should equal", b];
    } else if (assertion == "not_equal") {
        return [a, "should not equal", b];
    } else if (assertion == "true") {
        return [x, "should be", "True"];
    } else if (assertion == "false") {
        return [x, "should be", "False"];
    } else if (assertion == "is") {
        return [a, "should be", b];
    } else if (assertion == "is_not") {
        return [a, "should not be", b];
    } else if (assertion == "is_none") {
        return [x, "should be", "None"];
    } else if (assertion == "is_not_none") {
        return [x, "should not be", "None"];
    } else if (assertion == "in") {
        return [a, "should be in", b];
    } else if (assertion == "not_in") {
        return [a, "should not be in", b];
    } else if (assertion == "is_instance") {
        return [a, "should be an instance of", b];
    } else if (assertion == "not_is_instance") {
        return [a, "should not be an instance of", b];
    }
}



function set_test_results(resultInfo, resultsDiv) {
    function expand_group(group, recursive=false) {
        group.lastElementChild.style.display = null;
        group.firstElementChild.firstElementChild.classList.remove("fa-caret-right");
        group.firstElementChild.firstElementChild.classList.add("fa-caret-down")
        if (recursive) {
            for (let child of group.lastElementChild.children) {
                if (!(child.classList.contains("set-result") && child.classList.contains("pass")) && !(child.tagName == "CODE")) {
                    expand_group(child, true);
                }
            }
        }
    }
    function collapse_group(group, recursive=false) {
        group.lastElementChild.style.display = "none";
        group.firstElementChild.firstElementChild.classList.remove("fa-caret-down");
        group.firstElementChild.firstElementChild.classList.add("fa-caret-right")
        if (recursive) {
            for (let child of group.lastElementChild.children) {
                if (!(child.classList.contains("set-result") && child.classList.contains("pass")) && !(child.tagName == "CODE")) {
                    collapse_group(child, true);
                }
            }
        }
    }

    function sort_passed(group) {
        if (!group.classList.contains("group-set")) {

            for (let child of group.lastElementChild.children) {

                
                sort_passed(child);
            }
        } else {
            sort_all(group);
            for (let setResult of group.lastElementChild.children) {
                if (setResult.classList.contains("fail")) {
                    setResult.style.display = "none";
                }
            }
 
        }
    }

    function sort_failed(group) {
        if (!group.classList.contains("group-set")) {
            for (let child of group.lastElementChild.children) {
                sort_failed(child);
            }
        } else {
            sort_all(group);
            for (let setResult of group.lastElementChild.children) {
                if (setResult.classList.contains("pass")) {
                    setResult.style.display = "none";
                }
            }
        }

    }

    function sort_all(group) {
        // MAKE SOTRING REMOVE CURRENT SORTS OF CHILDREN
        for (let child of group.firstElementChild.lastElementChild.children) {
            child.classList.remove("selected");
        }
        if (!group.classList.contains("group-set")) {
            for (let child of group.lastElementChild.children) {
                sort_all(child);
            }
        } else {

            for (let setResult of group.lastElementChild.children) {
                setResult.style.display = null;
                
            }
        }

    }

    function handle_test_click(e) {
        if (e.target.classList.length == 2) {
            if (!e.target.classList[1].includes("caret")) {
                return

            }
        } else if (!e.target.classList.length == 0) {
            return
        }
        if (is_visible(e.currentTarget.parentElement.lastElementChild)) {
            collapse_group(e.currentTarget.parentElement);
        } else {
            expand_group(e.currentTarget.parentElement);
        }

    }

    function handle_expand_clicked(e) {
        let method;
        if (e.currentTarget.classList.contains("fa-angle-double-right")) {
            e.currentTarget.classList.remove("fa-angle-double-right");
            e.currentTarget.classList.add("fa-angle-double-down");
            method = expand_group;
        } else {
            e.currentTarget.classList.remove("fa-angle-double-down");
            e.currentTarget.classList.add("fa-angle-double-right");
            method = collapse_group;
        }
        if (e.currentTarget.parentElement.parentElement.classList.contains("results-summary-container")) {
            let groups = e.currentTarget.parentElement.parentElement.parentElement.lastElementChild.firstElementChild;
            for (let group of groups.children) {

                method(group, true);
            }
        } else {
            let group = e.currentTarget.parentElement.parentElement.parentElement;
            method(group, true)

        }
    }

    function handle_sort_clicked(e) {
        let addClass = false;
        if (e.currentTarget.classList.contains("selected")) {
            for (let child of e.currentTarget.parentElement.children) {
                child.classList.remove("selected");
            }
            // e.currentTarget.classList.remove("selected");
            if (e.currentTarget.parentElement.parentElement.classList.contains("results-summary-container")) {
                let groups = e.currentTarget.parentElement.parentElement.parentElement.lastElementChild.firstElementChild;
                for (let group of groups.children) {
                    sort_all(group);
                }
            } else {
                sort_all(e.currentTarget.parentElement.parentElement.parentElement);
            }
        } else {
            for (let child of e.currentTarget.parentElement.children) {
                child.classList.remove("selected");
            }
            addClass = true;
            
            if (e.currentTarget.classList.contains("pass")) {
                if (e.currentTarget.parentElement.parentElement.classList.contains("results-summary-container")) {
                    let groups = e.currentTarget.parentElement.parentElement.parentElement.lastElementChild.firstElementChild;
                    for (let group of groups.children) {
                        sort_passed(group);
                    }
                } else {
                    sort_passed(e.currentTarget.parentElement.parentElement.parentElement);
                }
            } else if (e.currentTarget.classList.contains("fail")) {
                if (e.currentTarget.parentElement.parentElement.classList.contains("results-summary-container")) {
                    let groups = e.currentTarget.parentElement.parentElement.parentElement.lastElementChild.firstElementChild;
                    for (let group of groups.children) {
                        sort_failed(group);
                    }
                } else {
                    sort_failed(e.currentTarget.parentElement.parentElement.parentElement);
                }

            }
        }
        if (addClass) {
            e.currentTarget.classList.add("selected");

        }

    }


    set_output(resultInfo);
    let resultsSummaryDiv = make_element("div", ["results-summary-container"])
    resultsDiv.innerHTML = "";


    if (resultInfo.stderr) {
        resultsSummaryDiv.innerHTML = "<span class='fail'>Error running tests, check Output window.</span>";
        resultsDiv.appendChild(resultsSummaryDiv);
        return;
    }

    if (resultInfo.error) {
        alert("Your code could not be run. (error)")
        return
    }
  
        
    if (resultInfo.result) {

        parsedResult = JSON.parse(resultInfo.result);
   
        let totalPassed = 0;
        let totalFailed = 0;
        let totalTests = totalPassed + totalFailed;


        

        let resultsBodyDiv = make_element("div", ["results-body", "output"]);
        let testGroupsDiv = make_element("div", ["test-groups"]);
        
        resultsBodyDiv.appendChild(testGroupsDiv);

        for (let testGroupName in parsedResult) {
            let testGroup = parsedResult[testGroupName];
            let testGroupPassed = 0;
            let testGroupFailed = 0

            let testGroupDiv = make_element("div", ["test-group"]);
            let groupSetsDiv = make_element("div", ["group-sets"]);
            groupSetsDiv.style.display = "none";

            let testGroupDivTitle = make_element("span");
            testGroupDivTitle.addEventListener("click", handle_test_click);

            let testGroupDivIcon = make_element("i", ["fas", "fa-caret-right"]);
            let testGroupTitleText = make_element("span");
            testGroupTitleText.innerText = testGroupName;
            
            testGroupDivTitle.appendChild(testGroupDivIcon);
            testGroupDivTitle.appendChild(testGroupTitleText);
            testGroupDiv.appendChild(testGroupDivTitle);
            testGroupDiv.appendChild(groupSetsDiv);
            for (let groupSetName in testGroup) {
                let groupSet = testGroup[groupSetName];
                let groupSetPassed = 0;
                let groupSetFailed = 0

                let groupSetDiv = make_element("div", ["group-set"]);
                let setResultsDiv = make_element("div", ["set-results"]);
                setResultsDiv.style.display = "none";

                let groupSetDivTitle = make_element("span");
                groupSetDivTitle.addEventListener("click", handle_test_click);




                let groupSetDivIcon = make_element("i", ["fas", "fa-caret-right"]);
                let groupSetTitleText = make_element("span");
                groupSetTitleText.innerText = groupSetName;
                
                groupSetDivTitle.appendChild(groupSetDivIcon);
                groupSetDivTitle.appendChild(groupSetTitleText);
                groupSetDiv.appendChild(groupSetDivTitle);
                groupSetDiv.appendChild(setResultsDiv);

                for (let setResultName in groupSet) {
                    let setResult = groupSet[setResultName];
                    let setResultDiv;

                    if (setResult.result == "True") {
                        setResultDiv = make_element("div", ["set-result", "pass"]);
                        let setResultDivText = make_element("span");
                        setResultDivText.innerText = "Test passed!";
                        setResultDiv.appendChild(setResultDivText);

                        totalPassed += 1;
                        testGroupPassed += 1;
                        groupSetPassed += 1;

                    } else {
                        setResultDiv = make_element("div", ["set-result", "fail"]);
                        let setResultDivTitle = make_element("span");
                        setResultDivTitle.addEventListener("click", handle_test_click);

                        let setResultDivIcon = make_element("i", ["fas", "fa-caret-right"]);
                        let setResultTitleText = make_element("span");
                        setResultTitleText.innerText = "Test failed!";

                        let failInfo = get_fail_info(setResult);
                        let setResultInfo = make_element("span");
                        setResultInfo.style.display = "none";
                        if (failInfo.length == 3) {
                            let aCode = make_element("code")
                            aCode.innerText = failInfo[0];
                            let bCode = make_element("code")
                            bCode.innerText = failInfo[2];
                            setResultInfo.appendChild(aCode);
                            setResultInfo.innerHTML += " <span class='fail-info'>" + failInfo[1] + "</span> ";
                            setResultInfo.appendChild(bCode);
                            
                        } else if (failInfo.length == 2) {
                            let xCode = make_element("code") 
                            xCode.innerText = failInfo[0];
                            setResultInfo.appendChild(xCode);
                            setResultInfo.innerHTML += " <span class='fail-info'>" + failInfo[1] + "</span> ";
                        }



                        setResultDivTitle.appendChild(setResultDivIcon);
                        setResultDivTitle.appendChild(setResultTitleText);
                        
                        setResultDiv.appendChild(setResultDivTitle);
                        setResultDiv.appendChild(setResultInfo);
                        
                        totalFailed += 1;
                        testGroupFailed += 1;
                        groupSetFailed += 1;
                    }

                    setResultsDiv.appendChild(setResultDiv);
                }
                let groupSetDivSummarySpan = make_results_info(groupSetPassed, groupSetFailed, handle_expand_clicked, handle_sort_clicked);
                groupSetDivTitle.appendChild(groupSetDivSummarySpan);
                groupSetsDiv.appendChild(groupSetDiv);

            }

            let testGroupDivSummarySpan = make_results_info(testGroupPassed, testGroupFailed, handle_expand_clicked, handle_sort_clicked);
            testGroupDivTitle.appendChild(testGroupDivSummarySpan);
            testGroupsDiv.appendChild(testGroupDiv);

        }


        let resultsSummarySpan = make_results_info(totalPassed, totalFailed, handle_expand_clicked, handle_sort_clicked, false);

        resultsSummaryDiv.appendChild(resultsSummarySpan)

        resultsDiv.appendChild(resultsSummaryDiv);
        resultsDiv.appendChild(resultsBodyDiv);

    }
}

// Lower controls bindings
function bind_lower_controls() {


    function button_clicked(button) {
        // Other Stuff
        if (button == lowerControlsMapping["Options"]["Save Challenge"]) {
            let title = document.getElementsByClassName("title-input")[0].innerText;
            let instructions = challengeInfoMde.value();
            let exampleTests = sampleTestsEditor.getValue();
            let submissionTests = submissionTestsEditor.getValue();
            let initialSolution = mainEditor.getValue();

            socketHandler.save_challenge({
                title: title,
                instructions: instructions,
                exampleTests: exampleTests,
                submissionTests, submissionTests,
                initialSolution: initialSolution
            }, (result) => {
                if (result.error) {
                    alert(result.error);
                    return
                }
                console.log("Success!", result.challengeID);
                alert('Challenge published! Find it in the "Browse" tab. Now redirecting you home...');
                window.location.href = "/";


            });
        }

        // Sample Tests
        if (button == lowerControlsMapping["Example Tests"]["Run Tests"]) {
            socketHandler.execute_tests(sampleTestsEditor.getValue(), mainEditor.getValue(), (result) => {
                set_test_results(result, document.getElementById("sample-test-results"));
                size_dependant_layout();

            });

        } else if (button == lowerControlsMapping["Example Tests"]["Test Cases"]["Run Code"]) {
            socketHandler.execute_tests(sampleTestsEditor.getValue(), mainEditor.getValue(), set_output);
            size_dependant_layout();

        }
        // Submission Tests
        if (button == lowerControlsMapping["Submission Tests"]["Run Tests"]) {
            socketHandler.execute_tests(submissionTestsEditor.getValue(), mainEditor.getValue(), (result) => {
                set_test_results(result, document.getElementById("submission-test-results"));
                size_dependant_layout();
            });

        } else if (button == lowerControlsMapping["Submission Tests"]["Test Cases"]["Run Code"]) {
            socketHandler.execute_tests(submissionTestsEditor.getValue(), mainEditor.getValue(), set_output);
            size_dependant_layout();

        }
        // Solution
        if (button == lowerControlsMapping["Solution"]["Run Code"]) {
            socketHandler.execute_code(mainEditor.getValue(), set_output);
            size_dependant_layout();

        }


    }


    // OMG THIS WORKED FIRST TRY!!!!!
    function create_mappings(parent, currentObject=lowerControlsMapping) {
        for (let container of parent.children) {
            if (container.classList.contains("container")) {
                for (let window of container.children) {
                    if (window.classList.contains("window")) {
                        let tabContainer;
                        for (let child of window.children) {
                            if (child.classList.contains("tabs-container")) {
                                tabContainer = child;
                            }
                        }
                        for (let tab of tabContainer.children) {
                            if (tab.classList.contains("tab")) {
                                console.log("HERETAB", tab)
                                let page = page_from_tab(tab);
                                if (page.children.length == 2) {
                                    for (let button of page.lastElementChild.children) {
                                        currentObject[tab.innerText] = {};
                                        currentObject[tab.innerText][button.innerText] = button;
                                        button.onclick = (e) => button_clicked(button);
                                    }
                                }
                                if (page.firstElementChild.classList.contains("outer")) {
                                    create_mappings(page.firstElementChild.firstElementChild, currentObject[tab.innerText])
                                }
                            }
                            
    
                        }
                    }
                    
                }
            }
        }
    }

    create_mappings(document.body.firstElementChild.firstElementChild);

}

bind_lower_controls();


class SocketHandler {
    constructor() {
        this.socket = io();
        this.bind_messages();
    }

    bind_messages() {
        this.socket.on("connect", this.handle_connect);
        this.socket.on("disconnect", this.handle_disconnect);
    }

    save_challenge(info, callback) {
        this.socket.emit("save challenge", info, (result) => {
            return callback(result);
        })
    }
    

    execute_tests(tests, solution, callback) {
        this.socket.emit("execute tests", {
            tests: tests,
            solution: solution,
            stdin: ""
        }, (result) => {
            return callback(result);
        })

    }

    execute_code(code, callback) {
        this.socket.emit("execute code", {
            code: code,
            stdin: ""
        }, (result) => {
            return callback(result);
        })

    }



    handle_callback(...args) {

    }

    handle_connect() {
        console.log("Connected to the server!");
    }

    handle_disconnect() {
        console.log("Disconnected from the server!");
    }

    // Other handle functions here
    

}

const socketHandler = new SocketHandler();



