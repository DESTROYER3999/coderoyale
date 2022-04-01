


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

function layout_browse_content() {
    let browseContent = document.getElementById("browse-content");
    if (is_visible(browseContent)) {
        browseContent.style.display = "none";
        let newHeight = browseContent.parentElement.offsetHeight;
        browseContent.style.height = newHeight + "px";
        browseContent.style.display = null;
    }

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

function get_request(url, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", url, true);
    xmlHttp.send(null);
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
}

// function play_challenge_clicked(e) {
//     let challengeID = e.currentTarget.parentElement.parentElement.id;
//     console.log("HOSTING", challengeID);

// }

function browse_clicked() {
    get_request("/browse", (data) => {
        let challengeContainer = document.getElementsByClassName("challenge-container")[0];
        challengeContainer.innerHTML = "";
        let displayChallenges = JSON.parse(data);

        for (let challengeID in displayChallenges) {
            let info = displayChallenges[challengeID];
            console.log(info)
            let newHTML = `
            <div class="challenge">
								<span class="title">${info.title}</span>
								<hr>
								<div class="instructions">
									 ${info.instructions}
								</div>
								<hr>
								<div class="challenge-options">
                                <a href="/play/${challengeID}"><button>Play</button></a>
									<button onclick="alert('Coming soon!')">Edit</button>
								</div>
							</div>
            `

            challengeContainer.insertAdjacentHTML("beforeend", newHTML);
            let currentContainer = challengeContainer.lastElementChild;
            currentContainer.onmouseover = (e) => {
                currentContainer.lastElementChild.firstElementChild.firstElementChild.classList.add("highlight");
            }
            currentContainer.onmouseleave = (e) => {
                currentContainer.lastElementChild.firstElementChild.firstElementChild.classList.remove("highlight");
            }
            // currentContainer.lastElementChild.firstElementChild.onclick = play_challenge_clicked;
        }
        


    })
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
    layout_browse_content();
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

document.getElementById("join-button").onclick = (e) => {
    let inputVal = e.currentTarget.previousElementSibling.lastElementChild.value.trim();
    if (inputVal) {
        window.location.href = window.location.origin + '/join/' + inputVal;
    }
}