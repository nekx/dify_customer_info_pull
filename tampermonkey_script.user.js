// ==UserScript==
// @author Chase Walker
// @description Allow easy copying of customer data from a given DIFY page
// @name     Customer info grab
// @include  http*://dify.tigerpistol.com/*
// @include  http*://*pistollabs.com/*
// @noframes
// @updateURL https://github.com/nekx/dify_customer_info_pull/raw/main/tampermonkey_script.user.js
// @downloadURL https://github.com/nekx/dify_customer_info_pull/raw/main/tampermonkey_script.user.js
// @grant    GM_setClipboard
// @version 5.0.0
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

const apiEndpoints = {

}
const targetRequestEndpointFunctions = {
  ".*campaigns(?!.*activeCopy)": function(event){
    responseData = JSON.parse(event.target.responseText)
    console.log("campaigns endpoint function")
  },
  ".*\/api\/clients\/(?!.*onboarding)": function(event){
    guidRegex = /[^-]{8}-[^-]{4}-[^-]{4}-[^-]{4}-[^-]{12}/
    difyID = event.target.requestURL.match(guidRegex)[0]
    responseData = JSON.parse(event.target.responseText)
    businessName = responseData.name
    companyID = responseData.companyId
    facebookPageID = responseData.socialAccounts[0].id
    facebookPageName = responseData.socialAccounts[0].name
    facebookAdAccountID = responseData.facebookAdAccountId
    facebookAdAccountName = responseData.facebookAdAccountName
    clientPage = new ClientPage(businessName, companyID, difyID, facebookAdAccountID, facebookAdAccountName, facebookPageID, facebookPageName)
    clientPageString = JSON.stringify(clientPage,null,2).replaceAll('"', '').replace(/[{}]/g, '')
    console.log(clientPageString)
    const clientName = document.getElementsByClassName('title')[0]
    clientName.addEventListener("click", () => clipboardCopy(clientPageString))
  }
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
    console.log(requestURL)
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

// copies provided copy and creates an alert confirming what was copied
function clipboardCopy(copy){
  console.log(copy)
    // opens up the clipboard and passes success / err
    navigator.clipboard.writeText(copy).then(
        function(){
            alert("Copied: \n" + copy); // success
        })
        .catch(
        function(error) {
            alert(error); // error
        });
    return false;
}

