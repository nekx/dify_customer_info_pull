// ==UserScript==
// @author Chase Walker
// @description Allow easy copying of customer data from a given DIFY page
// @name     Customer info grab
// @include  http*://dify.tigerpistol.com/*
// @noframes
// @updateURL https://github.com/nekx/dify_customer_info_pull/raw/main/tampermonkey_script.user.js
// @downloadURL https://github.com/nekx/dify_customer_info_pull/raw/main/tampermonkey_script.user.js
// @grant    GM_setClipboard
// @version 4.2.0
// ==/UserScript==

pageInfo = []
campaignList = []
interestList = []
  
// monkey patches XMLHttpRequest.prototype.open to intercept certain network requests and gather partaining data
var origOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function() {

    this.addEventListener('load', function() {
        // check to see if we're on a client page and runs if we are
        let clientPageCheck = window.location.href.includes('clients/')
        let campaignEditorCheck = window.location.href.includes('campaigns/')
        if (clientPageCheck){
            // if request is from '/api/clients/' or '/onboarding/ipc'
            if (this.responseURL.includes("/api/clients/") && !this.responseURL.includes('/onboarding/ipc')){
            
                // grab DIFY Name, DIFY ID, and DIFY Instance ID, appending to pageInfo
                parsedResponse = JSON.parse(this.responseText)
                pageInfo.companyID = ['Partner ID', parsedResponse.companyId]
                // if we've grabbed the company list already, find the DIFY Instance name by referencing the DIFY ID we've grabbed
                if(pageInfo.companyList){
                    pageInfo.companyName = ['Partner Name', pageInfo.companyList.find((element) => element.id == pageInfo.companyID[1]).name]
                    delete pageInfo.companyList
                }
                pageInfo.businessName = ['Customer Name', parsedResponse.name]
                pageInfo.businessID = ['Customer DIFY ID', parsedResponse.id]
                // if they have a FB Page connected, grab it's ID
                try{
                    pageInfo.facebookPageID = ['FB Page ID', parsedResponse.socialAccounts[0].id]
                }
                catch(e){
                    console.log('Couldn\'t find FB ID')
                }
                // sets the client title to copy all page info with copyData(pageInfo) on click
                var clientName = document.getElementsByClassName('title')[0]
                addEvent(clientName, "click", function(e){
                    e.preventDefault();
                    copyData(pageInfo);
                    return false;
                })
            }
            // if request is from 'currentUser'
            else if(this.responseURL.includes("currentUser")){
                // grabs companyList and checks to see if we have companyID. If we do, set's the DIFY Instance Name and deletes teh companyList
                pageInfo.companyList = JSON.parse(this.responseText).companies
                if (pageInfo.companyID){
                    pageInfo.companyName = ['DIFY Instance Name',pageInfo.companyList.find((element) => element.id == pageInfo.companyID[1]).name]
                    delete pageInfo.companyList
                }
            }
            // if request is from 'campaigns?'
            else if(this.responseURL.includes("campaigns?")){
                // grabs campaigns and then checks each campaign ID to see if it's already in campaignList. If not, it is pushed
                results = JSON.parse(this.responseText)['results']
                for (result in results){
                    result = results[result]
                    if (campaignList.findIndex(x => x[0]==result['id']) == -1){
                        campaignList.push([result['id'], result['name']])
                    }
                }
            }
            // if request is from 'activeCopy=true' or 'facebook/picture'
            else if((this.responseURL.includes("activeCopy=true") || this.responseURL.includes("facebook/picture"))){
                // set mutation observer on the campaign list node
                var campaignObserver = new MutationObserver(function(mutations){
                    // if mutation is and added node and it's href value matches a campaign ID in campaignsList, call campaignCopy()
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
            campaignObserver.observe(document.querySelector('[id^="ko-component"]'), options)
            }
        }   
        // if current page is the campaign editor
        else if (campaignEditorCheck){
            // if request is for audience
            if (this.responseURL.includes("library/audience")){
                // grab response and concat the different interests into interests array
                response = JSON.parse(this.responseText)[0]['audience']['additionalDemographics']
                work_employers = response['work_employers']
                work_positions = response['work_positions']
                interests = response['interests'].concat(work_employers).concat(work_positions)
                // filters interests for name + id and pushes it to the interestList array
                for (index in interests){
                    interest = interests[index]
                    interestList.push({'id' : interest['id'], 'name' : interest['name']})
                }
                // event listenter for shift + I on the document
                // adds the interest ID to each of the elements
                document.addEventListener('keydown', function(e){
                    if (e.shiftKey && e.key === 'I'){
                        var group_items = document.getElementsByClassName('group-item')
                        for (index in group_items){
                            item = group_items[index]
                            if (item.innerText){
                                interest_name = item.innerText.slice(0,-2)
                                interest_index = interestList.map((el) => el.name).indexOf(interest_name)
                                if (interest_index > -1){
                                    item.innerText = `${item.innerText.slice(0, -2)} \n ${interestList[interest_index].id}`
                                }
                            }
                        }
                    }
                }, false)
            }

        }
        // if not a client page, dump all info we have
        else{
            pageInfo = []
            campaignList = []
            interestList = []
        }
    });

    // call the actual XMLHttpRequest.prototype.open function and apply the provided arguments
    origOpen.apply(this, arguments);
};

// formats the data before it's copied by clipboardCopy()
function copyData(){
    data = []
    for (element in this.pageInfo){
        data.push(`${this.pageInfo[element][0]}: ${this.pageInfo[element][1]}\n`)
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

// sets event listeners for each campaign element found in campaignList
function campaignCopy(){
    targetList = []
    // for campaigns in campaignList
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
        //adds left click event of campaignFlip() to the flipIcon
        addEvent(flipIcon, "click", function(e){
            campaignFlip(campaignNameSpan, campaignID, campaignName)
        })
        // adds left click event of clipboardCopy(campaignID), shift modififer includes campaignName
        addEvent(campaignNameContainer, "click", function(e){
            if (e.shiftKey){
                clipboardCopy(campaignID + ' : ' + campaignName)
            }
            else{
                clipboardCopy(campaignID)
            }
        })
        // adds right click event of clipboardCopy(campaignName)
        addEvent(campaignNameContainer, "contextmenu", function(e){
            clipboardCopy(campaignName)
        })
    }
    // adds left click event to pie-chart icon that calls campaignFlip on all campaigns
    allClickTarget = document.getElementsByClassName('fa-pie-chart')[0]
    addEvent(allClickTarget, "click", function(e){
        e.preventDefault
        for (var x = 0; x <= targetList.length-1; x++){
            campaignFlip(targetList[x][0], targetList[x][1], targetList[x][2])
        }
    })

}

// flips target element's innerText with provided campaignID and campaignName
function campaignFlip(target, campaignID, campaignName){
    parentDiv = target.parentElement.parentElement
    if (target.innerText == campaignID){
        target.innerText = campaignName
    }
    else {
        target.innerText = campaignID
    }
    // this is to remove the character limit for campaign names that are longer than ~30 characters
    target.setAttribute("style", "white-space:normal!important")
    parentDiv.setAttribute("style", "height: fit-content!important")
}

// eventListener checker. mainly used for debugging, but plan to use it to verify some things in the future
// basically just calls addEventListener() for a target, but also modifies it's attribute to show that it's been added
function addEvent(target, type,  func){

    if (!target.hasAttribute('added')){
        target.addEventListener(type, func)
        target.setAttribute('added', '')
    }

}
