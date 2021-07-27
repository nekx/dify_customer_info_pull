// ==UserScript==
// @author Chase Walker
// @description Allow easy copying of customer data from a given DIFY page
// @name     Customer info grab
// @include  http*://dify.tigerpistol.com/\#/clients/*
// @noframes
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
// @version 4.0.0
// ==/UserScript==


var data = null;                                         // contains all copy-able data for the popup
var social_check = false;                                // Marker for the social page
const cssTemplate = GM_getResourceText ("cssTemplate");    // css template
const htmlTemplate = GM_getResourceText ("htmlTemplate");  // html template
const accountImgTemplate = GM_getResourceText ("accountImgCSSTemplate");  // html template

GM_addStyle ( cssTemplate );                             // applies cssTemplate
pageInfo = []
  
var origOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function() {

    this.addEventListener('load', function() {

        var target = document.getElementsByClassName('title')[0]
        
        if (this.responseURL.includes("/api/clients/") && !this.responseURL.includes('/onboarding/ipc')){
        
//            console.log(this)
            parsedResponse = JSON.parse(this.responseText)
            pageInfo.businessName = parsedResponse.name
            pageInfo.businessID = parsedResponse.id
            pageInfo.companyID = parsedResponse.companyId
            if(pageInfo.companyList){pageInfo.companyName = pageInfo.companyList.find((element) => element.id == pageInfo.companyID).name; delete pageInfo.companyList}
            try{
                pageInfo.facebookPageID = parsedResponse.socialAccounts[0].id
            }
            catch(e){
                console.log('Couldn\'t find FB ID')
            }
            try{
            pageInfo.facebookAdID = parsedResponse.facebookAdAccountId.slice(4)
            }
            catch(e){
                console.log('Couldn\'t find FB ad ID')
            }
            doTheThing(target)
        }
        else if(this.responseURL.includes("currentUser")){
            pageInfo.companyList = JSON.parse(this.responseText).companies
            if (pageInfo.companyID){
                pageInfo.companyName = pageInfo.companyList.find((element) => element.id == pageInfo.companyID).name
                delete pageInfo.companyList
            }
        }
        
    });
    

    origOpen.apply(this, arguments);
};

function doTheThing(target){
    
    // client name node
    const clientName = target

    // sets right click to copyPopup()
    clientName.addEventListener("contextmenu", function(e){
        e.preventDefault();
        gatherData();
        return false;
    })

    clientName.addEventListener("click", function(e){
        e.preventDefault();
        copyData(pageInfo);
        return false;
    })
}

function gatherData(){
    console.log('gatherData()')
}

function copyData(){
    data = []
    for (element in this.pageInfo){
        data.push(`${element}:\n${this.pageInfo[element]}\n\n`)
    }
    clipboardCopy(data.join(''))

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