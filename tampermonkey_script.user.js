// ==UserScript==
// @author Chase Walker
// @description Allow easy copying of customer data from a given DIFY page
// @name     Customer info grab
// @include  http*://dify.tigerpistol.com*
// @require  https://raw.githubusercontent.com/nekx/dify_customer_info_pull/main/constants.js
// @require  http://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js
// @require  https://gist.github.com/raw/2625891/waitForKeyElements.js
// @resource htmlTemplate https://raw.githubusercontent.com/nekx/dify_customer_info_pull/main/testHTMLtemplate
// @resource cssTemplate https://raw.githubusercontent.com/nekx/dify_customer_info_pull/main/selection.css
// @updateURL https://github.com/nekx/dify_customer_info_pull/raw/main/tampermonkey_script.user.js
// @downloadURL https://github.com/nekx/dify_customer_info_pull/raw/main/tampermonkey_script.user.js
// @grant    GM_setClipboard
// @grant    GM_addStyle
// @grant    GM_getResourceText
// @version 2.2.5
// ==/UserScript==

var data = null;                                         // contains all copy-able data for the popup
var social_check = false;                                // Marker for the social page
var cssTemplate = GM_getResourceText ("cssTemplate");    // css template
var htmlTemplate = GM_getResourceText ("htmlTemplate");  // html template

GM_addStyle ( cssTemplate );                             // applies cssTemplate


// adds the gatherCopy function as click events to the client image
function addEventListeners(){
    var clientImg = null;
    if ($(".account-img").length){
        clientImg = $('.account-img')[0];
    }
    else {
        clientImg = $('i.fa.fa-circle')[0];
    }
    clientImg.addEventListener("contextmenu", function(e){e.preventDefault();e.stopImmediatePropagation();copyPopup();return false;}, false);
    clientImg.addEventListener("click", function(evt){
        gatherCopy();
        evt.stopImmediatePropagation();
        return false;
    });
}

// gathers campaign IDs and sets each campaign name as a click-copy of it's ID
function campaignCopy (jNode){
    var targetNode = jNode.find('span[data-bind="text: $data.name(), maxLength: 30"]');
    var campaignID = jNode.find('a[data-bind*="campaigns/"]:not(.btn)').attr('href').split("/").slice(-2, -1).toString();
    targetNode.click(function(evt){clipboardCopy(campaignID); evt.stopImmediatePropagation();})
    targetNode.attr('title', campaignID);

    return false;
}

// checks the current location to see if you've landed on a cusomer page
function checkLocation(){
    if ( "#/clients" === window.location.hash ){
        return false;
    }
    else if ( window.location.hash.includes("#/clients/") ){
        waitForKeyElements ("#single-client-view-business-name", gatherData);
    }
}

// copies provided copy and creates an alert confirming what was copied
function clipboardCopy(copy){
    navigator.clipboard.writeText(copy).then(
        function(){
            alert("Copied: \n" + copy); // success
        })
        .catch(
        function() {
            alert("err"); // error
        });
    return false;
}

// creates the popup modal and it's input / buttons
function copyPopup(){
    $("#gmPopupContainer").toggle();
    if (! social_check){
        $("#facebook_page_ID").css("display", "none")
        $("#ad_account_ID").css("display", "none")
        $('label[for="facebook_page_ID"]').css("display", "none")
        $('label[for="ad_account_ID"]').css("display", "none")
    };

    $("#gmCopyNoTitleButton").click ( function () {
        gatherCopy(true, false);
    } );

    $("#gmCopyButton").click ( function () {
        gatherCopy(true);
    } );

    $("#gmCloseButton").click ( function (evt) {
        $("#gmPopupContainer").toggle();
        evt.stopImmediatePropagation();
    } );
return false;
}

// gathers fb and ad account IDs from a social page
function fbDataGather (){
    data["clientID"] = window.location.hash.split("/").slice(-2, -1).toString() || null;
    data["facebook_page_ID"] = $("a.line-height-pic").attr('href').split("/").pop() || null;
	data["ad_account_ID"] = $("a.partner-color").attr('href').split("=").pop() || null;
}

// gathers all selected items in the popup modal and copies them to clipboard
function gatherCopy(popup=false, copyTitles=true){
    var info = "";
    var inputs;
    if (popup){ inputs = $("input[type='checkbox']:checked"); }
    else { inputs = $("input[type='checkbox']"); }
    inputs.each ( function (index) {
        var id = $(this).attr("id");
        var value = data[id]
        if (copyTitles){
            if (value != null){
                if (index == 0){
                    info = info.concat($(this).val() + ": " + value);
                }
                else {
                    info = info.concat(",\n" + $(this).val() + ": " + value);
                }
            }
        }
       else {
           if (value != null){
                if (index == 0){
                    info = info.concat(value);
                }
                else {
                    info = info.concat("\n" + value);
                }
            }
       }
    });
    clipboardCopy(info);
    return false;
}

// gathers client / customer info from a given client page
function gatherData () {
    social_check = false;
    data = {
        "clientName" : document.getElementById('single-client-view-business-name').innerText,
        "clientID" : document.location.hash.replace(/#\/(campaigns|clients)\//i, "").split('/')[0],
        "partnerID" : localStorage.partnerId,
        "partnerName" : null,
        "facebook_page_ID" : null,
        "ad_account_ID" : null
    };
    data["partnerName"] = partners[data["partnerID"]]["name"];

    if (window.location.hash.split("/").pop() === "social"){
        waitForKeyElements ("a.partner-color", fbDataGather);
        social_check = true;
    }
    else{
        waitForKeyElements ('div[data-bind="click: $component.showCampaign.bind($component), css: $component.getActiveRowCss(ko.unwrap(id))"]', campaignCopy);
    }
    waitForKeyElements ('span#single-client-view-business-name', addEventListeners)
}

// checks for changes to the title, waits 2 seconds and runs checkLocation()
var target = document.querySelector('title');

var observer = new MutationObserver(function(mutations) {
    $("#gmPopupContainer").remove();
    $("body").append ( htmlTemplate );
    setTimeout(checkLocation, 3000);
});

var config = { subtree: true, characterData: true, childList: true };

observer.observe(target, config);
