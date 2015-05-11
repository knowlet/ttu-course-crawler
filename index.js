var request = require('request');
var cheerio = require('cheerio');

var courseURL = 'http://selquery.ttu.edu.tw/Main/ListClass.php';
request(courseURL, function (error, response, html) {
  if (!error && response.statusCode == 200) {
    var SelDp = [];
    var $ = cheerio.load(html);
    var length = $("[name='SelDp']").children().length;
    console.log(length);
    $("[name='SelDp'] option").each(function(i, element) {
      var course = {};
      course.name = $(element).text();
      course.value = $(element).attr("value");
      request(courseURL + "?SelDp=" + course.value, function (error, response, html) {
        if (!error && response.statusCode == 200) {
          var SelCl = [];
          var $ = cheerio.load(html);

          $("[name='SelCl'] option").each(function(i, element) {
            var tmp = {};
            tmp.class = $(element).text();
            tmp.value = $(element).attr("value");
            SelCl.push(tmp);
          });
          course.class = SelCl;
          SelDp.push(course);
          if (i == length - 1)
            console.log(JSON.stringify(SelDp));
        }
      });
    });
  }
});