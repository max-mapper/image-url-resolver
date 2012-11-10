var resolver = require('./')
resolver(process.argv[2], function(err, links) {
  if (err) return console.log(err)
  console.log(links)
})