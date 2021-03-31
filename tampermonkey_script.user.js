// ==UserScript==
// @author Chase Walker
// @description Allow easy copying of customer data from a given DIFY page
// @name     Customer info grab
// @include  http*://dify.tigerpistol.com*
// @include  https://forms.monday.com/forms*
// @noframes
// @require  https://raw.githubusercontent.com/nekx/dify_customer_info_pull/main/constants.js
// @require  http://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js
// @require  https://gist.github.com/raw/2625891/waitForKeyElements.js
// @resource htmlTemplate https://raw.githubusercontent.com/nekx/dify_customer_info_pull/main/selection.html
// @resource cssTemplate https://raw.githubusercontent.com/nekx/dify_customer_info_pull/main/selection.css
// @updateURL https://github.com/nekx/dify_customer_info_pull/raw/main/tampermonkey_script.user.js
// @downloadURL https://github.com/nekx/dify_customer_info_pull/raw/main/tampermonkey_script.user.js
// @resource htmlTemplate https://raw.githubusercontent.com/nekx/dify_customer_info_pull/main/selection.html
// @resource cssTemplate https://raw.githubusercontent.com/nekx/dify_customer_info_pull/main/selection.css
// @resource accountImgCSSTemplate https://raw.githubusercontent.com/nekx/dify_customer_info_pull/main/accountImg.css
// @updateURL https://github.com/nekx/dify_customer_info_pull/raw/main/tampermonkey_script.user.js
// @downloadURL https://github.com/nekx/dify_customer_info_pull/raw/main/tampermonkey_script.user.js
// @grant    GM_setClipboard
// @grant    GM_addStyle
// @grant    GM_getResourceText
// @grant    GM_openInTab
// @grant    GM_setValue
// @grant    GM_getValue
// @version 3.0.2 
// ==/UserScript==


var data = null;                                         // contains all copy-able data for the popup
var social_check = false;                                // Marker for the social page
var cssTemplate = GM_getResourceText ("cssTemplate");    // css template
var htmlTemplate = GM_getResourceText ("htmlTemplate");  // html template
var accountImgTemplate = GM_getResourceText ("accountImgCSSTemplate");  // html template

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
    var campaignName = targetNode.text()
    targetNode.click(function(evt){clipboardCopy(campaignID); evt.stopImmediatePropagation();})
    targetNode.contextmenu(function(evt){clipboardCopy(campaignName); evt.stopImmediatePropagation();})
    targetNode.attr('title', campaignID);
    GM_addStyle( accountImgTemplate )

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
        $("#ad_account_ID").css("display", "none")
        $('label[for="ad_account_ID"]').css("display", "none")
    };

    $("#gmTemplateButton").click( function(){
        var template = $("#template_pick").val();
        gatherCopy(false, false, template = template);
    })

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
function gatherCopy(popup=false, copyTitles=true, template=false){
    var info = "";
    var templateData = new Object()
    var inputs;
    var submitterName = $('span[data-bind="text: user.fullName"]').text()
    if (popup){ inputs = $("input[type='checkbox']:checked"); }
    else { inputs = $("input[type='checkbox']:visible"); }
    var last_index = inputs.length - 1
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
        else if(template == "Bug Submission"){
            if (value != null){
                templateData[$(this).val()] = value;
            }
            templateData.submitter = submitterName;
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
    if(template == "Bug Submission"){
        GM_openInTab("https://forms.monday.com/forms/0e28fad59e19bafce727b4dcfcfdac94");
        GM_setValue("data", templateData)
    }
    else{
        clipboardCopy(info);
    }
    return false;
}

// gathers client / customer info from a given client page
function gatherData () {
    social_check = false;
    data = {
        "clientName" : document.getElementById('single-client-view-business-name').innerText,
        "clientID" : document.location.hash.replace(/#\/(campaigns|clients)\//i, "").split('/')[0],
        "partnerID" : localStorage.companyId,
        "partnerName" : null,
        "facebook_page_ID" : null,
        "ad_account_ID" : null
    };
    try {
        data["facebook_page_ID"] = document.getElementById('client-social-link-fb').pathname.split('/')[1] 
    } catch(e){
        if (!(e instanceof TypeError)){
            throw e
        }
    }
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

var bugData = GM_getValue('data')
var location = window.location.href
if(bugData && location == "https://forms.monday.com/forms/0e28fad59e19bafce727b4dcfcfdac94"){
    $('.form-input').eq(1).val(bugData["submitter"])
    $('.form-input').eq(2).val(bugData["Client Name"])
    $('.form-input').eq(3).val(bugData["Partner ID"])
    if (bugData["Ad account ID"]){
    $('.form-input').eq(5).val("Client ID:" + '\n' + bugData["Client ID"] + '\n'+ "Facebook Page ID:" + '\n' +  bugData["Facebook Page ID"]
    + '\n' + "Ad account ID:" + '\n' + bugData["Ad account ID"])
    }
    else{
    $('.form-input').eq(5).val("Client ID:" + '\n' + bugData["Client ID"] + '\n'+ "Facebook Page ID:" + '\n' +  bugData["Facebook Page ID"])
    }
}
var target = document.querySelector('title');

var observer = new MutationObserver(function(mutations) {
    $("#gmPopupContainer").remove();
    $("body").append ( htmlTemplate );
    setTimeout(checkLocation, 3000);
});

var config = { subtree: true, characterData: true, childList: true };

observer.observe(target, config);
