


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


function layout_tab_covers() {
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



function bind_tab_pages() {
    console.log("bind tab pages...")
    
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
        if (tab.innerText == "Browse") {
            browse_clicked();
        }
    
        tab.classList.add("selected");
        page.classList.add("selected");
        layout_tab_covers();

        let onfinishedselectEvent = new CustomEvent("onfinishedselect", { detail: e });
        document.dispatchEvent(onfinishedselectEvent);
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
        }

    }
    for (let tab of tabs) {
        tab.onmousedown = tab_clicked;

        if (tab.classList.contains("selected")) {
            
            page_from_tab(tab).classList.add("selected");
        }
    }
    
}

function size_dependant_layout() {
    layout_tab_covers();
}
function position_dependant_layout() {
    bind_tab_pages();
}

let resizeTimeout;
window.onresize = function(){
clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(size_dependant_layout, 100);
};

position_dependant_layout();
size_dependant_layout();

document.getElementsByClassName("logo")[0].onload = () => size_dependant_layout();


