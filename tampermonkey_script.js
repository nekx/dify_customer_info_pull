// ==UserScript==
// @name     Customer info grab
// @include    *://dify.tigerpistol.com/*/clients/*
// @require  http://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js
// @require  https://gist.github.com/raw/2625891/waitForKeyElements.js
// @grant    GM_setClipboard
// ==/UserScript==


const	companies = {
		"44":{
			"name": "Tiger Pistol Demo Subscriptions",
			"publicName": "Tiger Pistol Demo"
		},
		"227":{
			"name": "ABI Belgium ",
			"publicName": "AB InBev Belgium"
		},
		"335":{
			"name": "ABI Bolivia",
			"publicName": "Espacio Cervecero"
		},
		"265":{
			"name": "ABI Brazil - Ambev Regional MG",
			"publicName": "Ambev Regional MG"
		},
		"195":{
			"name": "ABI Mexico - Grupo Modelo",
			"publicName": "Publicidad Social Grupo Modelo"
		},
		"97":{
			"name": "AdMax Local - BloomNation ",
			"publicName": "BloomNation Social"
		},
		"120":{
			"name": "AdMax Local - Haines Local Search",
			"publicName": "Haines Local Search"
		},
		"205":{
			"name": "AdMax Local - Kitchen United",
			"publicName": "Kitchen United"
		},
		"204":{
			"name": "AdMax Local - Testing",
			"publicName": "AdMax Local - Testing"
		},
		"191":{
			"name": "AdMax Local - Urban Air",
			"publicName": "Urban Air"
		},
		"143":{
			"name": "AdMax Local Retail",
			"publicName": "AdMax Local"
		},
		"212":{
			"name": "Better Homes and Gardens Real Estate",
			"publicName": "Better Homes and Gardens Real Estate Social Ad Engine"
		},
		"192":{
			"name": "BrandMuscle - Allstate",
			"publicName": "BrandMuscle"
		},
		"108":{
			"name": "BrandMuscle - AmFam ",
			"publicName": "BrandMuscle"
		},
		"200":{
			"name": "BrandMuscle - ATT",
			"publicName": "BrandMuscle - ATT"
		},
		"294":{
			"name": "BrandMuscle - Bobcat",
			"publicName": "BrandMuscle - Bobcat"
		},
		"202":{
			"name": "BrandMuscle - USC",
			"publicName": "BrandMuscle - USC"
		},
		"220":{
			"name": "Canada - Sotheby's International Realty",
			"publicName": "Sotheby’s International Realty Social Ad Engine"
		},
		"213":{
			"name": "CENTURY 21",
			"publicName": "CENTURY 21 Social Ad Engine"
		},
		"209":{
			"name": "Coldwell Banker Real Estate",
			"publicName": "Coldwell Banker Real Estate Social Ad Engine"
		},
		"316":{
			"name": "Corcoran Group - Test",
			"publicName": "Corcoran Group - Test"
		},
		"116":{
			"name": "CSERV-Demo",
			"publicName": "CSERV-Demo Social"
		},
		"242":{
			"name": "Demo - Beverage Brands",
			"publicName": "BevCo"
		},
		"175":{
			"name": "Digital Pharmacist",
			"publicName": "Digital Pharmacist"
		},
		"280":{
			"name": "Entel - Impulsa tu negocio Entel",
			"publicName": "Impulsa tu negocio Entel"
		},
		"39":{
			"name": "Entravision",
			"publicName": "Entravision"
		},
		"211":{
			"name": "ERA",
			"publicName": "ERA Social Ad Engine"
		},
		"286":{
			"name": "Geometry Global CAD",
			"publicName": "Geometry Social"
		},
		"258":{
			"name": "Geometry Global USD",
			"publicName": "Geometry Social"
		},
		"197":{
			"name": "GoDaddy Social",
			"publicName": "GoDaddy Social"
		},
		"12":{
			"name": "Hibu Display",
			"publicName": "Hibu"
		},
		"33":{
			"name": "Hibu Social",
			"publicName": "Hibu"
		},
		"7":{
			"name": "hibu Social",
			"publicName": "Hibu"
		},
		"102":{
			"name": "January Spring",
			"publicName": "Christian Terry"
		},
		"230":{
			"publicName": " Your Digital Support Team, Social Media"
		},
		"174":{
			"name": "Localsearch",
			"publicName": "Localsearch"
		},
		"215":{
			"name": "NRT - Coldwell Banker Residential",
			"publicName": "Coldwell Banker Social Ad Engine"
		},
		"214":{
			"name": "NRT - Sotheby's International Realty",
			"publicName": "Sotheby's International Realty Social Ad Engine"
		},
		"170":{
			"name": "OutboundEngine",
			"publicName": "OutboundEngine"
		},
		"52":{
			"name": "PaperBrix",
			"publicName": "PaperBrix"
		},
		"146":{
			"name": "Paperbrix - Forte Digital GroupId: 146",
			"publicName": "Forte Forward"
		},
		"134":{
			"name": "Qiigo USD",
			"publicName": "Qiigo"
		},
		"208":{
			"name": "Sotheby's International Realty",
			"publicName": "Sotheby's International Realty Social Ad Engine"
		},
		"193":{
			"name": "Spotzer - Telstra",
			"publicName": "Telstra Business Digital Marketing Services"
		},
		"15":{
			"name": "Test Partner",
			"publicName": "Test Partner"
		},
		"157":{
			"name": "The Galley",
			"publicName": "The Galley"
		},
		"17":{
			"name": "UpSnap",
			"publicName": "UpSnap"
		},
		"23":{
			"name": "ZZZ_YP Canada",
			"publicName": "ZZZ_YP Canada"
		},
		"252":{
			"name": "[New] BrandMuscle - Allstate",
			"publicName": "BrandMuscle"
		},
		"249":{
			"name": "[New] BrandMuscle - AmFam",
			"publicName": "BrandMuscle"
		},
		"254":{
			"name": "[New] BrandMuscle - ATT",
			"publicName": "BrandMuscle - ATT"
		},
		"251":{
			"name": "[New] BrandMuscle - Farmers Insurance",
			"publicName": "BrandMuscle - Farmers Insurance"
		},
		"253":{
			"name": "[New] BrandMuscle - USC",
			"publicName": "BrandMuscle - USC"
		},
		"334":{
			"name": "Westfield Agency Social Advertising Program",
			"publicName": "Westfield Agency Social Advertising Program"
		},
		"299":{
			"name": "Rodan + Fields Pilot",
			"publicName": "R + F Local Paid Media Pilot"
		},
		"305":{
			"name": "Mutual of Omaha",
			"publicName": "Social Lead Accelerator"
		},
		"279":{
			"name": "ABI - Canada AMPLIFY ",
			"publicName": "AMPLIFY by Labatt"
		},
		"307":{
			"name": "ABI Austria",
			"publicName": "ABI Geotargeted Social Ads"
		},
		"288":{
			"name": "ABI Brazil - Ambev AC",
			"publicName": "AmbevAC"
		},
		"267":{
			"name": "ABI Brazil - Ambev Regional CO",
			"publicName": "Ambev Regional CO"
		},
		"269":{
			"name": "ABI Brazil - Ambev Regional NE",
			"publicName": "Ambev NE"
		},
		"271":{
			"name": "ABI Brazil - Ambev Regional NO",
			"publicName": "Ambev Regional NO"
		},
		"263":{
			"name": "ABI Brazil - Ambev Regional RJ ES",
			"publicName": "Ambev Regional RJ ES"
		},
		"261":{
			"name": "ABI Brazil - Ambev Regional SP",
			"publicName": "Ambev Regional SP"
		},
		"273":{
			"name": "ABI Brazil - Ambev Regional Sul",
			"publicName": "Ambev Regional Sul"
		},
		"340":{
			"name": "ABI Colombia",
			"publicName": "MenúDig Publicidad"
		},
		"342":{
			"name": "ABI Colombia (BEES)",
			"publicName": "BEES - Colombia"
		},
		"337":{
			"name": "ABI Dominican Republic (BEES)",
			"publicName": "BEES"
		},
		"292":{
			"name": "ABI Italy ",
			"publicName": "ABI Italia"
		},
		"235":{
			"name": "ABI NL - Bud Social Euros",
			"publicName": "Bud Social"
		},
		"237":{
			"name": "ABI South Africa - Sisonke",
			"publicName": "Sisonke"
		},
		"233":{
			"name": "ABI UK - BBG",
			"publicName": "Budweiser Brewing Group"
		},
		"331":{
			"name": "Avery Healthcare",
			"publicName": "Avery Healthcare"
		},
		"333":{
			"name": "BuzzBallz",
			"publicName": "BuzzBallz"
		},
		"232":{
			"name": "Forty Winks",
			"publicName": "Forty Winks"
		},
		"291":{
			"name": "JOANN",
			"publicName": "JOANN"
		},
		"257":{
			"name": "L'Oreal US",
			"publicName": "Back In Style Consumer Advertising"
		},
		"343":{
			"name": "Customer Engagement Sandbox",
			"publicName": "Customer Engagement Sandbox"
		},
		"20":{
			"name": "User Friendly",
			"publicName": "User Friendly"
		},
		"36":{
			"name": "Shaw Media",
			"publicName": "Shaw Media"
		},
		"336":{
			"name": "GoDaddy Social Two-Tier",
			"publicName": "GoDaddy"
		},
		"300":{
			"name": "AffinityX - Metroland",
			"publicName": "My Social Ads"
		},
		"180":{
			"name": "8homes Urbanedge (Mahercorp)",
			"publicName": "8homes Urbanedge"
		},
		"308":{
			"name": "ABI Switzerland",
			"publicName": "ABI Geotargeted Social Ads"
		},
		"78":{
			"name": "Asahi - Retail",
			"publicName": "Asahi Premium Beverages"
		},
		"55":{
			"name": "Asahi - Third Space Platform",
			"publicName": "Asahi Premium Beverages"
		},
		"228":{
			"name": "LMG (Liquor Marketing Group)",
			"publicName": "LMG (Liquor Marketing Group)"
		},
		"87":{
			"name": "McGrath",
			"publicName": "McGrath Social Advertising Program"
		},
		"236":{
			"name": "Schumacher Homes",
			"publicName": "Schumacher Homes"
		},
		"239":{
			"name": "Zambrero Social Ads Tool",
			"publicName": "Zambrero Social Ads Tool"
		},
		"94":{
			"name": "Yellow Social Ads (Sensis/Yellow Pages) ",
			"publicName": "Yellow Social Ads"
		},
		"346":{
			"name": "Qiigo CAD",
			"publicName": "Qiigo"
		},
		"319":{
			"name": "The Corcoran Group",
			"publicName": "Corcoran Social Ad Engine"
		}
}



waitForKeyElements ("img.account-img", getNodeText);

function getNodeText (jNode) {
  
    var clientName = document.getElementById('single-client-view-business-name').innerText;

    var clientID = location.hash.slice(10);

    var companyID = localStorage.companyId;

    var companyName = companies[companyID]["name"];

    var info = "Client name: " + clientName + ",\nClient ID: " + clientID + ",\nCompany ID: " + companyID + ",\nCompany name: " + companyName;
  
  	var clientImg = document.getElementsByClassName("account-img")[0];
  
  	clientImg.addEventListener("click", function (event) {
 
    	console.log ("Copied to clipboard: ", info);

      navigator.clipboard.writeText(info).then(
          function(){
              alert("Copied: " + info); // success 
          })
        .catch(
           function() {
              alert("err"); // error
      });
    });
}
