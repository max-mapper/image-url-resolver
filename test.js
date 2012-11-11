var resolver = require('./')

var searchURL = "http://images.google.com/intl/en_ALL/images/logos/images_logo_lg.gif"

resolver(searchURL, function(err, links) {
  console.log(err, links)
})
