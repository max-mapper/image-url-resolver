var request = require('request')
var zlib = require('zlib')
var $ = require('cheerio')
var concat = require('concat-stream')
var _ = require('underscore')
var url = require('url')
var qs = require('querystring')
var unGzip = zlib.createGunzip()

module.exports = function(searchURL, cb) {
  searchByImage(searchURL).pipe(unGzip).pipe(concat(function(err, body) {
    gotHTML(err, body, cb)
  }))
}

function searchByImage(searchURL) {
  var headers = {
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Charset": "ISO-8859-1,utf-8;q=0.7,*;q=0.3",
    "Accept-Encoding": "gzip,deflate",
    "Accept-Language": "en-US,en;q=0.8",
    "Avail-Dictionary": "D-t65Pri",
    "Cache-Control": "max-age=0",
    "Connection": "keep-alive",
    "Cookie": "NID=65=knUbtAQY3fED1DY6tDRqsJB2mCwtmt_rvFZ2dkJMPx0azeolurXd6dG7wgFeGLljPUO14MJLYKTfzlT9xhIfDh4aLP6-zmBAes_wBXkVnbyyP38KfMCaOf88SryTCDLtTMDbvDUD2vZ-gpEysyEdssK__T0VpzwzUMCj5qk; PREF=ID=46bfce17479ba061:U=8d1836253e89cce2:FF=0:LD=en:NR=100:TM=1349433656:LM=1352547451:GM=1:SG=2:S=JrkP-4Mk5OJQ1vIV",
    "Host": "images.google.com",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_4) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11",
    "X-Chrome-Variations": "CKO1yQEIhLbJAQiZtskBCKS2yQEIp7bJAQiptskBCLa2yQEIuIPKAQ=="
  }

  var qs = {
    "as_occt": "any",
    "safe": "off",
    "tbs": "sbi:AMhZZisZ8sroiobYrPvinwdMVPSvVXkjsrj14nFmgK4z91yPbwkrQ6pPI_1KNAqKN96fW-UlicUDJFIIrT-WKC1sgDIaqlbcMCn78gC53aJtKVg6lgVV8R-0d5FHqJ8n6NX2CVIX57WQvDSXD3zDaXdeEXwzzDAcPssbHtadJyV2nT_1Exst7-a4KWxfUHifTGhDtOQdOAcClaGKg2A8HmDGnDef8UO6irAzpFVg5wE915I8j6gsDQBxnmgyKUWs4bX9loFOMowQWDCrFiSQuIlMbrUvn3B22OKrwQVnZv0BRzl4DuceGLui76rIAkRil3_1VQ2FFeelPZ10-gbYtS6JUqUNr_15y6GPclyqRP_1a8zGEKaetySIOwZpQe4RtMDxhKb3jiwEIjEc0bsucg3yG9yutexM3jZP08pUxN0PXtJ4eTXP0hXZZSQqADSKVNjBIzybxJBC6NcCgCzMcvIqcNTNNinT_1CnKjRl_1ana0yLLFpCIFR2JjzdMockqnw_1EsfU_1Vb0aW2m5VgWe2LxUG3vJI_1Ti4S7dONsaF1vTOTiK0oRaB15OKnWgmiRNsceBwrQQ73TztLhqBh8fao-C4SfIXX2ka7KI6YDHTiiWKVKH3RJxM2od43pBj4b0c1siZbPCuok-fwzKEWnVR7yvRfHlKwEsjxLDucynjqrN61Fl75K9S4Gw7GCNBIPqepIFT0nWJmUhAfyPh5UJxpbQlExt5GTPJM6oHqcSrrkFCXiabSvy1FHd4ukSOsfYkM5Iikn6pf6nJUoXUJQhnGIU9e90FJkcnCVfAT9CBSkM8iiMRmPSundI-lJR-cic4yuZF10LT_1CwNM0cAltCkH1JSxFK6c9KN0oyJmbLRSXEJ8kp4E0qoRqA14LpmRyQdmFl3cmSw-xQFauA6sFzQcmH69fOADj3hkEgra0S5LdPxODrsndb4y4yxKSrthULUwrA1LfmMs0RZyfaY0mB3YqYV9LAEksYL-7l9JkRl02DF88WoqtKxz74-10qJWwpX0hhI-u_1bQyso_1y_15rSlZCG0HFFI5hAhdjgH71Z1dx8sKV3M79ZIiiBpf64WcGtJNYIFPjVie6mxV5JAJxoieRk5NC1PVUYTfwoKCwWAZNE4IkQ-pkOxKUfevI-z_1ceONfT2UsXxJqFyDMtLfC7oDDnbmmxJ1571Ymv6qYURrEOT4H5kIOZnl5i0C10aT8EQg4Q-aSqwFPQ8SnVA0qX4CjDMAWjY_1YvdkZOfyClD_1bLC3jnEwjVIfzIODkfL0vyil9sagVCE3aGRGRKIIOClyP2lEv6gRdIW4G9kXIFQ"
  }

  return request({url: searchURL, headers: headers, qs: qs})
}

function gotHTML(err, body, cb) {
  var parsedHTML = $.load(body.toString())
  var frontPageList = getListItems(parsedHTML)
  var frontPageShares = getFrontPageShares(frontPageList)
  var validLinks = []
  frontPageShares.map(function(shareHTML) {
    var links = $.load(shareHTML)('a')
    if (links.length === 0) return
    var firstLink = links.attr('href')
    var link = url.parse(firstLink)
    validLinks.push(qs.parse(link.query))
  })
  cb(err, validLinks)
}

function getListItems(html) {
  return html('#rso li').map(function(i, li) {
    li = $(li)
    return li.html()
  })
}

function getFrontPageShares(frontPageList) {
  var i = 0
  for (; i < frontPageList.length; i++) {
    var h3 = $.load(frontPageList[i])('h3')
    if (h3.length > 0 && h3.html().match('Pages that include matching images')) break
  }
  frontPageList = frontPageList.splice(i + 1, frontPageList.length)
  return frontPageList
}