// ==UserScript==
// @author Chase Walker
// @description Allow easy copying of customer data from a given DIFY page
// @name     Customer info grab
// @include  http*://dify.tigerpistol.com/*
// @noframes
// @updateURL https://github.com/nekx/dify_customer_info_pull/raw/main/tampermonkey_script.user.js
// @downloadURL https://github.com/nekx/dify_customer_info_pull/raw/main/tampermonkey_script.user.js
// @grant    GM_setClipboard
// @version 4.0.6
// ==/UserScript==

pageInfo = []
campaignList = []
  
var origOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function() {

    this.addEventListener('load', function() {

        let pageCheck = window.location.href.includes('clients/')
        if (pageCheck){
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
                var clientName = document.getElementsByClassName('title')[0]
                addEvent(clientName, "click", function(e){
                    e.preventDefault();
                    copyData(pageInfo);
                    return false;
                })
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
                    if (campaignList.findIndex(x => x[0]==result['id']) == -1){
                        campaignList.push([result['id'], result['name']])
                    }
                }
            }
            else if((this.responseURL.includes("activeCopy=true") || this.responseURL.includes("facebook/picture"))){
                var campaignObserver = new MutationObserver(function(mutations){
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
//                campaignObserver.observe(document.getElementsByClassName('campaigns-table')[0], options)
                campaignObserver.observe(document.querySelector('[id^="ko-component"]'), options)

            }
        }   
        else{
            pageInfo = []
            campaignList = []
        }
    });

    origOpen.apply(this, arguments);
};


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
        addEvent(flipIcon, "click", function(e){
            campaignFlip(campaignNameSpan, campaignID, campaignName)
        })
        addEvent(campaignNameContainer, "click", function(e){
            if (e.shiftKey){
                clipboardCopy(campaignID + ' : ' + campaignName)
            }
            else{
                clipboardCopy(campaignID)
            }
        })
        addEvent(campaignNameContainer, "contextmenu", function(e){
            clipboardCopy(campaignName)
        })
        addEvent(campaignNameContainer, 'auxclick', function(e){
            if (e.button == 1) {
                    e.preventDefault();
                }
        })
    }
    allClickTarget = document.getElementsByClassName('fa-pie-chart')[0]
    addEvent(allClickTarget, "click", function(e){
        e.preventDefault
        for (var x = 0; x <= targetList.length-1; x++){
            campaignFlip(targetList[x][0], targetList[x][1], targetList[x][2])
        }
    })

}

function campaignFlip(target, campaignID, campaignName){
    parentDiv = target.parentElement.parentElement
    if (target.innerText == campaignID){
        target.innerText = campaignName
    }
    else {
        target.innerText = campaignID
    }
    target.setAttribute("style", "white-space:normal!important")
    parentDiv.setAttribute("style", "height: fit-content!important")
}

function addEvent(target, type,  func){

    if (!target.hasAttribute('added')){
        target.addEventListener(type, func)
        target.setAttribute('added', '')
    }

}