var request = require('request')
var zlib = require('zlib')
var $ = require('cheerio')
var concat = require('concat-stream')
var _ = require('underscore')
var url = require('url')
var qs = require('querystring')

module.exports = function(imageURL, cb) {
  var unGzip = zlib.createGunzip()
  searchByImage(imageURL).pipe(unGzip).pipe(concat(function(err, body) {
    gotHTML(err, body, cb)
  }))
}

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

function searchByImage(imageURL) {
  var baseURL = "http://images.google.com/searchbyimage?"
  var query = { 
    image_url: imageURL,
    image_content: '',
    filename: '',
    num: '100',
    hl: 'en',
    bih: '498',
    biw: '1440'
  }
  return request({url: baseURL + qs.stringify(query), headers: headers})
}

function gotHTML(err, body, cb) {
  var parsedHTML = $.load(body.toString())
  var frontPageList = getListItems(parsedHTML)
  var frontPageShares = getFrontPageShares(frontPageList)
  var validURLs = []
  frontPageShares.map(function(shareHTML) {
    validURLs.push(getURL(shareHTML))
  })
  var pageURLs = getPageURLs(parsedHTML)
  var pendingRequests = pageURLs.length
  pageURLs.map(function(pageURL) {
    var unGzip = zlib.createGunzip()
    request({url: pageURL, headers: headers}).pipe(unGzip).pipe(concat(function(err, body) {
      pendingRequests--
      var html = $.load(body.toString())
      var linkList = getListItems(html)
      linkList.map(function(shareHTML) {
        validURLs.push(getURL(shareHTML))
      })
      if (pendingRequests === 0) cb(err, validURLs)
    }))
  })
}

function getPageURLs(html) {
  var navs = html('#navcnt td')
  navs = _.compact(navs.map(function(i, nav) {
    nav = $(nav)
    if (nav.hasClass('navend')) return
    if (nav.hasClass('cur')) return
    return "http://images.google.com" + nav.find('a').attr('href')
  }))
  return navs
}

function getURL(linksHTML) {
  var links = $.load(linksHTML)('a')
  if (links.length === 0) return
  var firstLink = links.attr('href')
  var link = url.parse(firstLink)
  return qs.parse(link.query)
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