// ==UserScript==
// @author Chase Walker
// @description Allow easy copying of customer data from a given DIFY page
// @name     Customer info grab v2
// @include  http*://dify.tigerpistol.com/*
// @include  http*://*pistollabs.com/*
// @noframes
// @grant    GM_setClipboard
// @version 5.0.2
// ==/UserScript==

function ClientPage (name, companyID, difyID, facebookAdAccountID=null, facebookAdAccountName=null, facebookPageID=null, facebookPageName=null) {
  this.name = name
  this.companyID = companyID
  this.difyID = difyID
  this.facebookAdAccountID = facebookAdAccountID
  this.facebookAdAccountName = facebookAdAccountName
  this.facebookPageName = facebookPageName
  this.facebookPageID = facebookPageID
}

const targetPages = [
  "clients/"
]

const targetRequestEndpointFunctions = {
  ".*internal.*campaigns\?(?!.*activeCopy)": function(event){
    responseData = JSON.parse(event.target.responseText).results
    let campaignsList = []
    responseData.forEach(campaign => {
      campaignName = campaign.name
      campaignId = campaign.id
      let nameXpathSelector = `//div[@class="name-column customer-overview"]/span[text()="${campaignName}"]`
      campaignsList.push([campaignId, campaignName, nameXpathSelector])
      var campaignObserver = new MutationObserver(function (mutations) {
        for (let mutation of mutations) {
          let addedNode = mutation.addedNodes[0]
          const campaignNode = campaignsList.find((element, index) => {
            campaignIndex = index
            return element[1] == addedNode?.textContent
          }) ?? false
          if (campaignNode){
            campaignInfo = campaignsList.splice(campaignIndex, 1)
            addedNode.parentNode.addEventListener("click", () => { console.log("worked") }, false )
            console.log(addedNode)
            console.log(campaignIndex)
            console.log(campaignInfo)
          }
        }
      })
      var options = { subtree: true, childList: true }
      campaignObserver.observe(document.querySelector('[id^="ko-component"]'), options)
    })
    console.log(campaignsList)
  },
  ".*\/api\/clients\/(?!.*onboarding)": function(event){
    guidRegex = /[^-]{8}-[^-]{4}-[^-]{4}-[^-]{4}-[^-]{12}/
    responseData = JSON.parse(event.target.responseText)
    difyID = responseData.id
    businessName = responseData.name
    companyID = responseData.companyId
    facebookPageID = responseData.socialAccounts[0]?.id
    facebookPageName = responseData.socialAccounts[0]?.name
    facebookAdAccountID = responseData.facebookAdAccountId
    facebookAdAccountName = responseData.facebookAdAccountName
    clientPage = new ClientPage(businessName, companyID, difyID, facebookAdAccountID, facebookAdAccountName, facebookPageID, facebookPageName)
    clientPageString = formatClientPage(clientPage)
    const clientName = document.getElementsByClassName('title')[0]
    clientName.addEventListener("click", () => clipboardCopy(clientPageString))
  }
}

const campaignFlip = (campaignsList) => {

}

const formatClientPage = (clientPage) => {
  clientPageString = JSON.stringify(clientPage,null,2)
                         .replaceAll('"', '')
                         .replace(/[{},]/g, '')
                         .replace(/.*null$/gm, '')
  return clientPageString
}

const interceptAndAddEventListener = (XMLHttpRequest) => {
  originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function() {
    originalOpen.apply(this, arguments);
    currentPage = window.location.href
    ajaxData = this.ajaxData
    requestURL = ajaxData.requestUrl
    const verifiedTargetFunction = verifyTargets(currentPage, requestURL)
    if (!verifiedTargetFunction){
      return;
    }
    this.addEventListener('load', (event) => verifiedTargetFunction(event));
  }
}

const verifyTargets = (currentPage, requestURL) => {
  const isTargetPage = targetPages.some(page => currentPage.includes(page))
  if (!isTargetPage) {
    return;
  }
  targetFunction = getTargetFunction(requestURL,targetRequestEndpointFunctions)
  if (targetFunction){
    return targetFunction;
  }
}

const getTargetFunction = (requestURL,requestEndpointFunctions) => {
  endpointFunctions = Object.keys(requestEndpointFunctions)
  verifiedTarget = endpointFunctions.find(endpoint => {regex = new RegExp(endpoint); return regex.test(requestURL)})
  verifiedTargetFunction = requestEndpointFunctions[verifiedTarget]
  return verifiedTargetFunction
}

interceptAndAddEventListener(XMLHttpRequest)

function clipboardCopy(copy){
    navigator.clipboard.writeText(copy).then(
        function(){
            alert("Copied: \n" + copy);
        })
        .catch(
        function(error) {
            alert(error);
        });
    return false;
}
