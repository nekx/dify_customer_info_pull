// ==UserScript==
// @author Chase Walker
// @description Allow easy copying of customer data from a given DIFY page
// @name     Customer info grab
// @include  http*://dify.tigerpistol.com/*
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
// @version 4.0.5
// ==/UserScript==


var data = null;                                         // contains all copy-able data for the popup
var social_check = false;                                // Marker for the social page
const cssTemplate = GM_getResourceText ("cssTemplate");    // css template
const htmlTemplate = GM_getResourceText ("htmlTemplate");  // html template
const accountImgTemplate = GM_getResourceText ("accountImgCSSTemplate");  // html template

GM_addStyle ( cssTemplate );                             // applies cssTemplate
pageInfo = []
campaignList = []
  
var origOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function() {

    this.addEventListener('load', function() {

        var target = document.getElementsByClassName('title')[0]
        
        if (this.responseURL.includes("/api/clients/") && !this.responseURL.includes('/onboarding/ipc')){
        
//            console.log(this)
            parsedResponse = JSON.parse(this.responseText)
            pageInfo.businessName = ['DIFY Name', parsedResponse.name]
            pageInfo.businessID = ['DIFY ID', parsedResponse.id]
            pageInfo.companyID = ['DIFY Instance ID', parsedResponse.companyId]
            if(pageInfo.companyList){
                pageInfo.companyName = ['DIFY Instance Name', pageInfo.companyList.find((element) => element.id == pageInfo.companyID[1]).name]
                delete pageInfo.companyList
            }
            try{
                pageInfo.facebookPageID = ['FB Page ID', parsedResponse.socialAccounts[0].id]
            }
            catch(e){
                console.log('Couldn\'t find FB ID')
            }
            try{
            pageInfo.facebookAdID = ['FB Ad ID', parsedResponse.facebookAdAccountId.slice(4)]
            }
            catch(e){
                console.log('Couldn\'t find FB ad ID')
            }
            doTheThing(target)
        }
        else if(this.responseURL.includes("currentUser")){
            pageInfo.companyList = JSON.parse(this.responseText).companies
            if (pageInfo.companyID){
                pageInfo.companyName = ['DIFY Instance Name',pageInfo.companyList.find((element) => element.id == pageInfo.companyID[1]).name]
                delete pageInfo.companyList
            }
        }
        else if(this.responseURL.includes("campaigns?")){
            results = JSON.parse(this.responseText)['results']
            for (result in results){
                result = results[result]
                campaignList.push([result['id'], result['name']])
            }
        }
        else if(this.responseURL.includes("activeCopy=true")){
            var observer = new MutationObserver(function(mutations){
                for (let mutation of mutations) {
                    let addedNode = mutation.addedNodes[0]
                    try{
                        if (addedNode.href){
                            campaignID = addedNode.href.slice(39, -6)
                            if (campaignID == campaignList[campaignList.length-1][0]){
                                campaignCopy()
                            }
                        }
                    }
                    catch(e){
                        if (e.name != 'TypeError'){
                            throw(e)
                        }
                    }
                }
            })
            var options = {subtree: true, childList: true}
            observer.observe(document.getElementsByClassName('campaigns-table')[0], options)

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
        copyPopup();
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
        data.push(`${this.pageInfo[element][0]}: ${this.pageInfo[element][1]}\n\n`)
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
// creates the popup modal and it's input / buttons
function copyPopup(){
    
    console.log('copyPopup()')
    let self = this

    let popupContainer = document.getElementById('gmPopupContainer')
    let body = document.getElementsByTagName('body')[0]
    
    // removes the popup
    if (document.contains(popupContainer)){
        popupContainer.remove()
    }
    // refreshes the htmlTemplate by appending it
    body.insertAdjacentHTML('afterend', htmlTemplate)
    popupContainer = document.getElementById('gmPopupContainer')
    let templateButton = document.getElementById('gmTemplateButton')
    let copyNoTitleButton = document.getElementById('gmCopyNoTitleButton')
    let copyButton = document.getElementById("gmCopyButton")
    let closeButton = document.getElementById("gmCloseButton")
  
    // display the popup
    popupContainer.style.display = "block"

    // sets left click of the template button
    templateButton.addEventListener("click", function(e){

    })

    // set the left click of the No Titles button to gatherCopy() with popup=true and copyTitles=false
    copyNoTitleButton.addEventListener("click", function(e){

    })

    // sets the left click of the Copy button to gatherCopy with popup=true
    copyButton.addEventListener("click", function(e){

    })

    // sets the left click of Close button to close the popup
    closeButton.addEventListener("click", function(e){
        popupContainer.classList.toggle('visable');
        e.stopImmediatePropagation();
    })

return false;
}

function campaignCopy(){
    targetList = []
    for (var i = 0; i <= campaignList.length-1; i++){
        let campaignID = campaignList[i][0]
        let campaignName = campaignList[i][1]
        let selector = "a[href=\'campaigns/" + campaignID + "/leads\']"
        let targetElem = document.querySelectorAll(selector)[0]
        let container = targetElem.parentNode.parentNode.parentNode
        let campaignNameContainer = container.childNodes[3]
        let campaignNameSpan = campaignNameContainer.childNodes[0]
        let flipIcon = container.childNodes[1].childNodes[1]
        targetList.push([campaignNameSpan, campaignID, campaignName])
        flipIcon.addEventListener("click", function(e){
            campaignFlip(campaignNameSpan, campaignID, campaignName)
        })
        campaignNameContainer.addEventListener("click", function(e){
            if (e.shiftKey){
                clipboardCopy(campaignID + ' : ' + campaignName)
            }
            else{
                clipboardCopy(campaignID)
            }
        })
        campaignNameContainer.addEventListener("contextmenu", function(e){
            clipboardCopy(campaignName)
        })
        campaignNameContainer.addEventListener("auxclick", function(e){
            console.log(e.button)
            if (e.button == 1) {
                    e.preventDefault();
                }
        })
    }
    allClickTarget = document.getElementsByClassName('fa-pie-chart')[0]
    allClickTarget.addEventListener("click", function(e){
        for (var x = 0; x <= targetList.length-1; x++){
            campaignFlip(targetList[x][0], targetList[x][1], targetList[x][2])
        }
    })

}

function campaignFlip(target, campaignID, campaignName){
    if (target.innerText == campaignID){
        target.innerText = campaignName
    }
    else {
        target.innerText = campaignID
    }
    target.setAttribute("style", "white-space:normal!important")
}