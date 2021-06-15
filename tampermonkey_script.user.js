// ==UserScript==
// @author Chase Walker
// @description Allow easy copying of customer data from a given DIFY page
// @name     Customer info grab
// @include  http*://dify.tigerpistol.com*
// @include  https://forms.monday.com/forms*
// @include  https://tigerpistol.lightning.force.com*
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
// @version 3.1.1  
// ==/UserScript==


var data = null;                                         // contains all copy-able data for the popup
var social_check = false;                                // Marker for the social page
const cssTemplate = GM_getResourceText ("cssTemplate");    // css template
const htmlTemplate = GM_getResourceText ("htmlTemplate");  // html template
const accountImgTemplate = GM_getResourceText ("accountImgCSSTemplate");  // html template

GM_addStyle ( cssTemplate );                             // applies cssTemplate
console.log('v1')                             // logs the version #

class DIFY {
    

    // adds the gatherCopy function as click events to the client image
    addEventListeners(){
        let self = this;

        //grabs client image
        let clientImg = $('#single-client-view-business-name')[0];

        // sets right click to copyPopup() and stops default event
        clientImg.addEventListener("contextmenu", function(e){
            e.preventDefault();
            e.stopImmediatePropagation();
            self.copyPopup();
            return false;
        }, false);

        // sets left click to gatherCopy() and stops event after
        clientImg.addEventListener("click", function(evt){
            self.gatherCopy();
            evt.stopImmediatePropagation();
            return false;
        });
    }

    // simulates clicking all the campaign name spans to turn them into campaign IDs
    allClick(){
        let self = this

        // all of the campaign name spans
        const targetSpans = $('span[data-bind="text: $data.name(), maxLength: 30"]');

        // on each span, campaignFlip()
        targetSpans.each(function(){self.campaignFlip($(this)[0])});

    }
    // gathers campaign IDs and sets each campaign name as a click-copy of it's ID
    campaignCopy (jNode){

        let self = this

        // square icon to the left of the campaign name
        const flipIcon = jNode.find('.dynamic-square');

        // campaign name span
        const targetNode = jNode.find('span[data-bind="text: $data.name(), maxLength: 30"]');

        // prevents the campaign ID from being clipped when it's switched
        targetNode.css("white-space","normal");

        // attempt to find campaign ID / Name and assign. Silent fails on TypeError
        try{
            var campaignID = jNode.find('a[data-bind*="campaigns/"]:not(.btn)').attr('href').split("/").slice(-2, -1).toString();
            var campaignName = targetNode.text()
        } catch(e){
            if (!(e instanceof TypeError)){
                throw e
            }
        }
        
        // sets left click of targetNode to clipboardCopy() campaignID, prevents event afterwards
        targetNode.click(function(evt){clipboardCopy(campaignID); evt.stopImmediatePropagation();})

        // sets right click of targetNode to clipboardCopy() campaignName, prevents event afterwards
        targetNode.contextmenu(function(evt){clipboardCopy(campaignName); evt.stopImmediatePropagation();})

        // sets the targetNode's title attribute to the campaignID
        targetNode.attr('title', campaignID);

        // sets the left click of flipIcon to campaignFlip() target node, prevents event afterwards
        flipIcon.click(function(evt){self.campaignFlip(targetNode); evt.stopImmediatePropagation();})

        // sets the accountImg to flash indicating that the script is ready
        GM_addStyle( accountImgTemplate )

        return false;
    }

    // switches the title and innerHTML text of the campaigns of a given page
    campaignFlip (targetNode){

        // grabs title from targetNode
        const title = $(targetNode).attr('title')

        // grabs name from targetNode
        const name = $(targetNode).text()
        
        // switches the targetNode's title and text
        $(targetNode).text(title)
        $(targetNode).attr('title', name) 

        return false;
    }   
    

    // creates the popup modal and it's input / buttons
    copyPopup(){
        let self = this

        // display the popup
        $("#gmPopupContainer").toggle();

        // if not on social page 
        if (!social_check){

            // hide the option for ad account ID
            $("#ad_account_ID").css("display", "none")
            $('label[for="ad_account_ID"]').css("display", "none")
        };

        // sets left click of the template button
        $("#gmTemplateButton").click( function(){

            // sets template as value of template pick dropdown
            const template = $("#template_pick").val();

            // calls gatherCopy() to copy the template info with popup=false, copyTitles=false and template=template
            self.gatherCopy(false, false, template);
        })

        // set the left click of the No Titles button to gatherCopy() with popup=true and copyTitles=false
        $("#gmCopyNoTitleButton").click ( function () {
            self.gatherCopy(true, false);
        } );

        // sets the left click of the Copy button to gatherCopy with popup=true
        $("#gmCopyButton").click ( function () {
            self.gatherCopy(true);
        } );

        // sets the left click of Close button to close the popup
        $("#gmCloseButton").click ( function (evt) {
            $("#gmPopupContainer").toggle();
            evt.stopImmediatePropagation();
        } );
    return false;
    }

    // gathers fb and ad account IDs from a social page
    fbDataGather (){

        // sets clientID to the the location splice if possible, null if not
        data["clientID"] = window.location.hash.split("/").slice(-2, -1).toString() || null;

        // checks if facebook img exists and then sets facebook_page_ID to it's href splice, defaults to "not found" if unable to set value
        if($('a.line-heightpic').length){data["facebook_page_ID"] = $("a.line-height-pic").attr('href').split("/").pop() || "not found"}

        // checks if ad account string exists (social page only) and then sets facebook_page_ID to it's href splice, defaults to "not found" if unable to set value
        if($('a.partner-color').length){data["ad_account_ID"] = $("a.partner-color").attr('href').split("=").pop() || "not found"}
    }

    // gathers all selected items in the popup modal and copies them to clipboard
    gatherCopy(popup=false, copyTitles=true, template=false){

        // intialize info and templateData
        let info = "";
        const templateData = new Object()

        // sets inputs equal to ALL checkbox elements in the popup
        let inputs = $("input[type='checkbox']");

        // sets submitterName equal to the user name
        const submitterName = $('span[data-bind="text: user.fullName"]').text()

        // checks to see if it's for a popup and then sets inputs equal to SELECTED checkbox elements in the popup 
        if (popup){ inputs = $("input[type='checkbox']:checked"); }
        // checks to see if it's for a template and then sets inputs equal to all VISIBLE checkbox elements in the popup
        else if (template) { inputs = $("input[type='checkbox']:visible");}

        // loops through each input value
        inputs.each ( function (index) {

            // sets key / value pair
            const id = $(this).attr("id");
            const value = data[id]

            // checks if copyTitles is true
            if (copyTitles){
                // checks if value is not null
                if (value != null && value != 'not found'){
                    // if first index, save key/value without linebreak
                    if (index == 0){
                        info = info.concat($(this).val() + ": " + value);
                    }
                    // if not first index, save key/value with linebreak
                    else {
                        info = info.concat(",\n" + $(this).val() + ": " + value);
                    }
                }
            }
            // checks if template is for Bug Submission
            else if(template == "Bug Submission"){
                // checks that value isn't null
                if (value != null){
                    // sets templateData entrie for that value
                    templateData[$(this).val()] = value;
                }
                // sets submitter property of templateData to submitterName
                templateData.submitter = submitterName;
            }
            // boiler plate copy for other template
            else {
                if (value != null && value != 'not found'){
                        if (index == 0){
                            info = info.concat(value);
                        }
                        else {
                            info = info.concat("\n" + value);
                        }
                    }
            }
        });
        // checks if template is Bug Submission
        if(template == "Bug Submission"){
            // opens monday bug submission form URL in new tab
            GM_openInTab("https://forms.monday.com/forms/0e28fad59e19bafce727b4dcfcfdac94");
            // sets data as templateData
            GM_setValue("data", templateData)
        }
        // if template is not Bug Submission
        else{
            // clipboardCopy what we have in info
            clipboardCopy(info);
        }
        return false;
    }

    // gathers client / customer info from a given client page
    gatherData () {
        let self = this

        // resets the social page check
        social_check = false;

        // sets the data object
        data = {
            // sets clientName to the clientName in DIFY
            "clientName" : document.getElementById('single-client-view-business-name').innerText,
            // sets clientID to the ID present in the location hash
            "clientID" : document.location.hash.replace(/#\/(campaigns|clients)\//i, "").split('/')[0],
            // sets partnerID to localStorage.companyID
            "partnerID" : localStorage.companyId,
            // sets default values for partnerName, facebook_page_ID, and ad_account_ID to "not found"
            "partnerName" : "not found",
            "facebook_page_ID" : "not found",
            "ad_account_ID" : "not found"
        };
        // attempts to set facebook_page_ID to the href of a#client-social-link-fb, silent fail for TypeError
        try {
            if($('a#client-social-link-fb').attr('href').length){data["facebook_page_ID"] = $("a#client-social-link-fb").attr('href').split("/").pop()}
        } catch(e){
            if (!(e instanceof TypeError)){
                throw e
            }
        }
        // sets partnerName by searching the partners array
        data["partnerName"] = partners[data["partnerID"]]["name"];

        // checks if it's the social page
        if (window.location.hash.split("/").pop() === "social"){
            // waits for ad account string to exist and then runs fbDataGather 
            waitForKeyElements ("a.partner-color", self.fbDataGather.bind(self));
            // sets the social page check to true
            social_check = true;
        }
        else{
            // waits for campaign list and then calls campaignCopy
            waitForKeyElements ('div[data-bind="click: $component.showCampaign.bind($component), css: $component.getActiveRowCss(ko.unwrap(id))"]', self.campaignCopy.bind(self));
        }
        
        // sets allFlipIcon as the pie chart icon at the top left of the campaign list
        const allFlipIcon = $('.fa.fa-pie-chart');
        // sets the left click of allFlipIcon to allClick()
        allFlipIcon.click(self.allClick.bind(self));
        // waits for the client name to appear and then calls addEventListeners
        waitForKeyElements ('span#single-client-view-business-name', self.addEventListeners.bind(self))
        return false;
    }
    // checks the current location to see if you've landed on a customer page
    checkLocation(){
        let self = this
        // checks to see if this is location list
        if ( "#/clients" === window.location.hash ){
            return false;
        }
        // checks if location matches client overview page
        else if ( window.location.hash.includes("#/clients/") ){

            // waits for the client name to appear on the page and calls gatherData
            waitForKeyElements ("#single-client-view-business-name", self.gatherData.bind(self)) 
        }
    }
}










// copies provided copy and creates an alert confirming what was copied
function clipboardCopy(copy){

    // opens up the clipboard and passes success / err
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



// creates new DIFY object
const Dify = new DIFY()
// sets bugData to previsouly gathered data object
let bugData = GM_getValue('data')
// sets ticketURL to previsouly gathered ticketURL
let ticketURL = GM_getValue('ticketURL')
// saves location
let location = window.location.href

// if bugData exists and location matches bug submission page
if(bugData && location == "https://forms.monday.com/forms/0e28fad59e19bafce727b4dcfcfdac94"){

    // sets up the enter key event that is sent after values to get them to update with the page JS
    let e = jQuery.Event("onKeyDown", {which: 13})

    // set each of the form inputs equal to the their value in bugData
    $('.form-input').eq(1).prop("value", bugData["submitter"])
    $('.form-input').eq(1).trigger(e)
    $('.form-input').eq(2).prop("value", bugData["DIFY Client Name"])
    $('.form-input').eq(2).trigger(e)
    $('.form-input').eq(3).prop("value", bugData["DIFY Partner ID"])
    $('.form-input').eq(3).trigger(e)
    $('.form-input').eq(4).prop("value", ticketURL)
    $('.form-input').eq(4).trigger(e)
    
    // if bugData has Ad account ID
    if (bugData["Ad account ID"]){
        
        // dumps the rest of the data (including Ad account ID) into the last input field
        $('.form-input').eq(5).val("DIFY Client ID:" + '\n' + bugData["DIFY Client ID"] + '\n'+ "Facebook Page ID:" + '\n' +  bugData["Facebook Page ID"]
        + '\n' + "Ad account ID:" + '\n' + bugData["Ad account ID"]);
    }
    else{
        // dumps the rest of the data (NOT including Ad account ID) into the last input field
        $('.form-input').eq(5).val("DIFY Client ID:" + '\n' + bugData["DIFY Client ID"] + '\n'+ "Facebook Page ID:" + '\n' +  bugData["Facebook Page ID"]);
    }
}
// if location is salesforce window
else if (location.includes("https://tigerpistol.lightning.force.com")){

// checks every .5 seconds for the current location and saves it to ticketURL
    setInterval(function(location)
    {
        // if location is different than current window
        if (location != window.location.href)
        {
            // set ticketURL to current window
            GM_setValue("ticketURL", window.location.href);
        }
    }, 500);
}

// if location is DIFY
else if (location.includes("https://dify.tigerpistol.com")){

    // set target as the title element
    const target = document.querySelector('title');

    // config options for observer
    const config = { subtree: true, characterData: true, childList: true };

    // creates new mutationObserver
    const observer = new MutationObserver(function(mutations) {
        // removes the popup
        $("#gmPopupContainer").remove();
        // refreshes the htmlTemplate by appending it
        $("body").append ( htmlTemplate );
        // calls checkLocation every 3 seconds
        setTimeout(Dify.checkLocation(), 3000);
    });

    // starts the observer with target and config
    observer.observe(target, config);
}
