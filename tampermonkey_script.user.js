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

// checks for changes to the title, waits 2 seconds and runs checkLocation()
var target = document.querySelector('title');

var observer = new MutationObserver(function(mutations) {
    setTimeout(checkLocation, 2000);
});

var config = { subtree: true, characterData: true, childList: true };

observer.observe(target, config);

function checkLocation(){
    if ( "#/clients" === window.location.hash ){
        return false;
    }
    else if ( window.location.hash.includes("#/clients/") ){
        waitForKeyElements ("#single-client-view-business-name", getNodeText);

        function getNodeText (jNode) {
          
            var clientName = document.getElementById('single-client-view-business-name').innerText;

            var clientID =  window.location.hash.split("/").slice(-2, -1).toString()

            var companyID = localStorage.companyId;

            var companyName = companies[companyID]["name"];
          
         	if (window.location.hash.split("/").pop() === "social"){
              	var facebook_page_ID = $("a.line-height-pic").attr('href').split("/").pop();
				var ad_account_ID = $("a.partner-color").attr('href').split("=").pop(); 
              	var info = "Client name: " + clientName + ",\nClient ID: " + clientID + ",\nCompany ID: " + companyID + ",\nCompany name: " + companyName + ",\nFacebook Page ID: " + facebook_page_ID + ",\nAd Account ID: " + ad_account_ID;
            }
			else{
            	var info = "Client name: " + clientName + ",\nClient ID: " + clientID + ",\nCompany ID: " + companyID + ",\nCompany name: " + companyName;
            };
          
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
