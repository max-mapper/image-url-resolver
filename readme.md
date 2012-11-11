# image url resolver

take an image URL and get the URLs of all pages that the image (or visually similar images) appear on

this module is essentially a scraper for the "search by image" feature of images.google.com

## example

    var resolver = require('image-url-resolver')

    resolver("http://images.google.com/intl/en_ALL/images/logos/images_logo_lg.gif", function(err, links) {
      console.log(err, links)
    })
    
    // links array has objects that looks like this kinda:
    { imgurl: 'http://3.bp.blogspot.com/_qJkN2BemPHE/TLU9hlz9JRI/AAAAAAAABNI/kIeDsz7yGxY/s1600/google+real+time+atish+tech+tricks.PNG',
      imgrefurl: 'http://www.techtricksworld.com/2010/10/google-real-time-search.html',
      h: '145',
      w: '396',
      sz: '12',
      q: 'png google logo'
    }

### BSD LICENSE