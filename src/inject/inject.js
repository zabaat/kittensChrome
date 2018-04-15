function injectStuff() {
    window.zb = {
        buttons: {
            observe: null,
            sendHunters: null,
            praiseSun: null,
            resources: null
        },
        resources:{},
        autos:{
            timer: 60000,
            advisors:{
                sendHunters: true,
                praiseSun: false,
                observe: false
            },
            resources:{
                beam: true,
                slab: true,
                steel: true,
                plate: true,
                scaffold: false,
                parchment: true,
                manuscript: false,
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

function autoRunner(){
    const ran = []
    _.forEach(window.zb.autos.advisors, (value, key, ele)=>{
        if(value){
            window.zb.buttons[key].click()
            ran.push(key)
        }
    })
    _.forEach(window.zb.autos.resources, (value, key, ele)=>{
        if(value){
            console.log("auto:", key)
            try{
                window.zb.buttons.resources[key][5].click()
                ran.push(key)
            }catch(e){
                console.log("couldn't auto", key)
            }
        }
    })
    console.log(`auto runner ran:`, ran)
}

function setupFunctions(){

}

function refreshResourceCounts(){
    const container = document.getElementById('resContainer').children[0]
    _.forEach(container.children, row=>{
        var resourceName = ""
        _.forEach(row.children, (ele, i)=>{
            if(i===0){
                resourceName = ele.innerText.split(":")[0]
            }else if(i===1){
                window.zb.resources[resourceName] = window.zb.resources[resourceName] || {}
                if(ele.classList.contains("resLimitNotice")){
                    window.zb.resources[resourceName].atMax = true
                }
                window.zb.resources[resourceName].current = ele.innerText
            }else if(i===2){
                window.zb.resources[resourceName].max = ele.innerText.split("/")[1]
            }
        })
    })
}

var init = function() {
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
                    a.buttons[rowName] = a.buttons[rowName] || {}
                    a.buttons[rowName][i] = ele.children[0];
                }
            });
            return a
        }
        return _.reduce(container.children, parseRow, {
            // amounts: {},
            buttons: {}
        });
    }

    function initBtns() {
        window.zb.buttons.resources = setupResourceButtons().buttons;
        window.zb.buttons.sendHunters = document.getElementById(
            "fastHuntContainer"
        ).children[0];
        window.zb.buttons.praiseSun = document.getElementById(
            "fastPraiseContainer"
        ).children[0];
        window.zb.buttons.observe = document.getElementById("observeBtn");
    }
    console.log("initing app");
    initBtns();
    window.zb.int.resourceCounts = setInterval(refreshResourceCounts, 1000)
    window.zb.int.resourceButtons = setInterval(initBtns, 20000)
    window.zb.int.runAuto = setInterval(autoRunner, window.zb.autos.timer)
    window.zb.int.clickObserve = setInterval(()=>{if(window.zb.buttons.observe)window.zb.buttons.observe.click()},5000)
    autoRunner()
};

chrome.extension.sendMessage({}, function(response) {
    var readyStateCheckInterval = setInterval(function() {
        if (document.readyState === "complete") {
            injectStuff().then(init);
            clearInterval(readyStateCheckInterval);
            // ----------------------------------------------------------
            // This part of the script triggers when page is done loading
            console.log("Hello. This message was sent from scripts/inject.js");
            // ----------------------------------------------------------
        }
    }, 10);
});
