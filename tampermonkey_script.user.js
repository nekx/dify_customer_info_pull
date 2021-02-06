// ==UserScript==
// @author Chase Walker
// @description Allow easy copying of customer data from a given DIFY page
// @name     Customer info grab
// @include  http*://dify.tigerpistol.com*
// @require  https://raw.githubusercontent.com/nekx/dify_customer_info_pull/main/constants.js
// @require  http://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js
// @require  https://gist.github.com/raw/2625891/waitForKeyElements.js
// @updateURL https://github.com/nekx/dify_customer_info_pull/raw/main/tampermonkey_script.user.js
// @downloadURL https://github.com/nekx/dify_customer_info_pull/raw/main/tampermonkey_script.user.js
// @grant    GM_setClipboard
// @grant    GM_addStyle
// @version 2.1
// ==/UserScript==

var data = null;
var social_check = false;

    //--- CSS styles make it work...
    GM_addStyle ( "                                     \
#gmPopupContainer {                                     \
position:               fixed;                          \
top:                    30%;                            \
left:                   20%;                            \
padding:                2em;                            \
background: -webkit-linear-gradient(top, #0fb2ef 0%, #00a3e0 100%); \
background: -moz-linear-gradient(top, #0fb2ef 0%, #00a3e0 100%); \
background: -o-linear-gradient(top, #0fb2ef 0%, #00a3e0 100%); \
background: -ms-linear-gradient(top, #0fb2ef 0%, #00a3e0 100%); \
background: linear-gradient(top, #0fb2ef 0%, #00a3e0 100%); \
border:                 3px double black;               \
border-radius:          1ex;                            \
z-index:                777;                            \
color: white;                                           \
}                                                       \
#gmPopupContainer button{                               \
cursor:                 pointer;                        \
margin:                 1em 1em 0;                      \
border:                 1px outset buttonface;          \
background: white;                                      \
color: black;                                           \
}                                                       \
#gmPopupContainer label{                                \
display:                inline;                         \
}                                                       \
" );

function checkLocation(){


    if ( "#/clients" === window.location.hash ){
        return false;
    }
    else if ( window.location.hash.includes("#/clients/") ){
        waitForKeyElements ("#single-client-view-business-name", gatherData);

        function gatherData () {
            social_check = false;
            data = {
                "clientName" : document.getElementById('single-client-view-business-name').innerText,
                "clientID" : null,
                "companyID" : localStorage.companyId,
                "companyName" : null,
                "facebook_page_ID" : null,
                "ad_account_ID" : null
            };
            data["companyName"] = companies[data["companyID"]]["name"];

         	if (window.location.hash.split("/").pop() === "social"){
                waitForKeyElements ("a.partner-color", fbDataGather);
                social_check = true;
            }
			else{
                waitForKeyElements ('div[data-bind="click: $component.showCampaign.bind($component), css: $component.getActiveRowCss(ko.unwrap(id))"]', campaignCopy);
            }
            waitForKeyElements ('.account-img', addEventListeners)
        }
    }
  }
function addEventListeners(){
    var clientImg = document.getElementsByClassName("account-img")[0];

    clientImg.addEventListener("contextmenu", function(e){e.preventDefault();e.stopImmediatePropagation();copyPopup();return false;}, false);
    clientImg.addEventListener("click", function(evt){
        gatherCopy();
        evt.stopImmediatePropagation();
        return false;
    });
}

function fbDataGather (){
    data["clientID"] = window.location.hash.split("/").slice(-2, -1).toString();
    data["facebook_page_ID"] = $("a.line-height-pic").attr('href').split("/").pop();
	data["ad_account_ID"] = $("a.partner-color").attr('href').split("=").pop();
}

function campaignCopy (){
    data["clientID"] = window.location.hash.split("/").slice(-1).toString();
    var campaign_names =  $('span[data-bind="text: $data.name(), maxLength: 30"]');

    var campaign_IDs = $('a:hidden[data-bind*="campaigns/"]').map(function(i,el) { return $(el).attr('href').split("/").slice(-2, -1).toString(); }).get();

    $.each(campaign_names, function( index ) {
        $(this).click(function(){clipboardCopy(campaign_IDs[index])})
        $(this).attr('title', campaign_IDs[index]);
    });
    return false;
}

function copyPopup(){
    $("#gmPopupContainer").toggle();
    if (! social_check){
        $("#facebook_page_ID").css("display", "none")
        $("#ad_account_ID").css("display", "none")
        $('label[for="facebook_page_ID"]').css("display", "none")
        $('label[for="ad_account_ID"]').css("display", "none")
    };


    //--- Use jQuery to activate the dialog buttons.
    $("#gmCopyButton").click ( function () {
        gatherCopy(true);
    } );

    $("#gmCloseButton").click ( function (evt) {
        $("#gmPopupContainer").toggle();
        evt.stopImmediatePropagation()
    } );
return false;
};

function gatherCopy(popup=false){
    var info = "";
    var inputs;
    if (popup){ inputs = $("input[type='checkbox']:checked"); }
    else { inputs = $("input[type='checkbox']"); }
    inputs.each ( function (index) {
        var id = $(this).attr("id");
        var value = data[id]
        if (value != null){
            if (index == 0){
                info = info.concat($(this).val() + ": " + value);
            }
            else {
                info = info.concat(",\n" + $(this).val() + ": " + value);
            }
        }
    });
    clipboardCopy(info);
    return false;
};

function clipboardCopy(copy){
    console.log ("Copied to clipboard: ", copy);

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

// checks for changes to the title, waits 2 seconds and runs checkLocation()
var target = document.querySelector('title');

var observer = new MutationObserver(function(mutations) {
    $("#gmPopupContainer").remove();
    $("body").append ( '                                                          \
<div id="gmPopupContainer" style="display:none;">                                               \
<input type="checkbox" id="clientName" value="Client Name">                      \
<label for="clientName">Client Name</label><br>                              \
<input type="checkbox" id="clientID" value="Client ID">                        \
<label for="clientID">Client ID</label><br>                              \
<input type="checkbox" id="companyID" value="Company ID">                       \
<label for="companyID">Company ID</label><br>                             \
<input type="checkbox" id="companyName" value="Company Name">                     \
<label for="companyName">Company Name</label><br>                              \
<input type="checkbox" id="facebook_page_ID" value="Facebook Page ID">                \
<label for="facebook_page_ID">Facebook Page ID</label><br>                              \
<input type="checkbox" id="ad_account_ID" value="Ad account ID">                   \
<label for="ad_account_ID">Ad account ID</label><br>                             \
<button id="gmCopyButton" type="button">Copy selected values</button>  \
<button id="gmCloseButton" type="button">Close popup</button>         \
</div>                                                                    \
' );
    setTimeout(checkLocation, 3000);
});

var config = { subtree: true, characterData: true, childList: true };

observer.observe(target, config);
