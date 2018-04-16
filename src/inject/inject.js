function injectStuff() {
    window.zb = {
        buttons: {
            observe: null,
            sendHunters: null,
            praiseSun: null,
            resources: null,
            autoToggles: {}
        },
        resources: {},
        autos: {
            save: true,
            timer: 60000,
            observe: 5000,
            advisors: {
                sendHunters: true,
                praiseSun: false
            },
            resources: {
                beam: false,
                slab: true,
                steel: false,
                plate: false,
                scaffold: false,
                parchment: true,
                manuscript: true
            }
        },
        int: {
            hunt: null,
            observe: null
        }
    };

    return new Promise(resolve => {
        setTimeout(() => {
            return resolve();
        }, 5000);
    });
}

function toggleAutoButtonHandler(element, name){
    window.zb.autos.resources[name] = !window.zb.autos.resources[name]
    var buttonValue = window.zb.autos.resources[name] === true ? "ON" : "OFF"
    element.innerText = `auto ${buttonValue}`
}

function setupResourceButtons() {
    const container = document.getElementsByClassName(
        "table resTable craftTable"
    )[0];
    function parseRow(a, e) {
        var rowName = "";
        _.forEach(e.children, (ele, i) => {
            if (i === 0 && ele.innerText.length > 0) {
                rowName = ele.innerText.split(":")[0];
            } else if (i === 1) {
                // do nothing
                // a.amounts[rowName]= a.amounts[rowName] || {}
                // a.amounts[rowName][i] = ele;
            } else {
                a.buttons[rowName] = a.buttons[rowName] || {};
                a.buttons[rowName][i] = ele.children[0];
            }
        });
        
        // AUTO BUTTON INSERTION
        if(e.children.length === 6){
            var newButton = e.insertCell()
            var buttonValue = window.zb.autos.resources[rowName] === true ? "ON" : "OFF"
            newButton.innerHTML = `<a id="${rowName}AutoToggle" href="#">auto ${buttonValue}</a>`
            newButton = document.getElementById(`${rowName}AutoToggle`)
            newButton.addEventListener("click", ()=>{
                toggleAutoButtonHandler(newButton, rowName)
            })
            window.zb.buttons.autoToggles[rowName] = newButton
        }
        return a;
    }
    return _.reduce(container.children, parseRow, {
        // amounts: {},
        buttons: {}
    });
}
var init = function() {
    function initBtns() {
        window.zb.buttons.resources = setupResourceButtons().buttons;
        window.zb.buttons.sendHunters = document.getElementById(
            "fastHuntContainer"
        ).children[0];
        window.zb.buttons.praiseSun = document.getElementById(
            "fastPraiseContainer"
        ).children[0];
    }
    console.log("initing app");
    initBtns();
    window.zb.int.resourceCounts = setInterval(refreshResourceCounts, 1000);
    window.zb.int.resourceButtons = setInterval(setupResourceButtons, 10000); //something wipes these buttons, so we gotta fix in script
    window.zb.int.runAuto = setInterval(autoRunner, window.zb.autos.timer);
    if (window.zb.autos.observe) {
        window.zb.int.clickObserve = setInterval(() => {
            try {
                document.getElementById("observeBtn").click();
            } catch (e) {}
        }, window.zb.autos.observe);
    }
    autoRunner();
};

function autoRunner() {
    document.querySelector('#headerLinks div.links-block a:nth-child(1)').click()
    const ran = [];
    _.forEach(window.zb.autos.advisors, (value, key, ele) => {
        if (value) {
            try {
                window.zb.buttons[key].click();
                ran.push(key);
            } catch (e) {
                console.log("couldn't auto", key);
            }
        }
    });
    _.forEach(window.zb.autos.resources, (value, key, ele) => {
        if (value) {
            try {
                window.zb.buttons.resources[key][5].click();
                ran.push(key);
            } catch (e) {
                console.log("couldn't auto", key);
            }
        }
    });
    console.log(`auto runner ran:`, ran);
}

function refreshResourceCounts() {
    const container = document.getElementById("resContainer").children[0];
    _.forEach(container.children, row => {
        var resourceName = "";
        _.forEach(row.children, (ele, i) => {
            if (i === 0) {
                resourceName = ele.innerText.split(":")[0];
            } else if (i === 1) {
                window.zb.resources[resourceName] =
                    window.zb.resources[resourceName] || {};
                if (ele.classList.contains("resLimitNotice")) {
                    window.zb.resources[resourceName].atMax = true;
                }
                window.zb.resources[resourceName].current = ele.innerText;
            } else if (i === 2) {
                window.zb.resources[resourceName].max = ele.innerText.split(
                    "/"
                )[1];
            }
        });
    });
}

chrome.extension.sendMessage({}, function(response) {
    var readyStateCheckInterval = setInterval(function() {
        if (document.readyState === "complete") {
            injectStuff().then(init);
            clearInterval(readyStateCheckInterval);
            // ----------------------------------------------------------
            // This part of the script triggers when page is done loading
            console.log("Hello. This message was sent from scripts/inject.js");
            // ----------------------------------------------------------

            var port = chrome.runtime.connect();

            window.addEventListener(
                "message",
                function(event) {
                    console.log("envent happent",event)
                    // We only accept messages from ourselves
                    if (event.source != window) return;

                    if (event.data.type && event.data.type == "FROM_PAGE") {
                        console.log(
                            "Content script received: " + event.data.text
                        );
                        port.postMessage(event.data.text);
                    }
                },
                false
            );
        }
    }, 10);
});
