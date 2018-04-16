document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("observeBtn").addEventListener(
        "click",
        function() {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {type:"getText"}, function(response){
                    alert(response)
                    $("#text").text(response);
                });
            });
        },
        false
    );


});
