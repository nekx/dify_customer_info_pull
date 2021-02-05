// ==UserScript==
// @author Chase Walker
// @description Allow easy copying of customer data from a given DIFY page
// @name     Customer info grab
// @include  http*://dify.tigerpistol.com*
// @require  https://raw.githubusercontent.com/nekx/dify_customer_info_pull/main/constants.js
// @require  http://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js
// @require  https://gist.github.com/raw/2625891/waitForKeyElements.js
// @updateURL https://raw.githubusercontent.com/nekx/dify_customer_info_pull/main/tampermonkey_script.js?token=AD74VBDGU45OA7QIBFGMHSDADWGZC
// @downloadURL https://raw.githubusercontent.com/nekx/dify_customer_info_pull/main/tampermonkey_script.js?token=AD74VBDGU45OA7QIBFGMHSDADWGZC
// @grant    GM_setClipboard
// ==/UserScript==


// select the target node
var target = document.querySelector('title');

// create an observer instance
var observer = new MutationObserver(function(mutations) {
    // We need only first event and only new value of the title
    setTimeout(checkLocation, 2000);
});

// configuration of the observer:
var config = { subtree: true, characterData: true, childList: true };

// pass in the target node, as well as the observer options
observer.observe(target, config);
function checkLocation(){
    if ( "#/clients" === window.location.hash ){
        console.log(window.location.hash);
        console.log('failed test');
        return false;
    }
    else if ( window.location.hash.includes("#/clients/") ){
        console.log(window.location.hash);
        console.log('passed test');
        waitForKeyElements ("#single-client-view-business-name", getNodeText);

        function getNodeText (jNode) {

            var clientName = document.getElementById('single-client-view-business-name').innerText;

            var clientID = location.hash.slice(10);

            var companyID = localStorage.companyId;

            var companyName = companies[companyID]["name"];

            var info = "Client name: " + clientName + ",\nClient ID: " + clientID + ",\nCompany ID: " + companyID + ",\nCompany name: " + companyName;

            var clientImg = document.getElementsByClassName("account-img")[0];

            clientImg.addEventListener("click", function (event) {

                console.log ("Copied to clipboard: ", info);

                navigator.clipboard.writeText(info).then(
                    function(){
                        alert("Copied: " + info); // success
                    })
                    .catch(
                    function() {
                        alert("err"); // error
                    });
            });
        }
    };
};
