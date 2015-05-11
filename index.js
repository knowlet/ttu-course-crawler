var request = require('request');
var cheerio = require('cheerio');
var courseURL = 'http://selquery.ttu.edu.tw/Main/ListClass.php';
(function (callback){
  request(courseURL, function (error, response, html) {
    if (!error && response.statusCode == 200) {
      var SelDp = [];
      var $ = cheerio.load(html);
      var length = $("[name='SelDp']").children().length;
      $("[name='SelDp'] option").each(function (i, element) {
        var course = {};
        course.name = $(element).text();
        course.value = $(element).attr("value");
        request(courseURL + "?SelDp=" + course.value, function (error, response, html) {
          if (!error && response.statusCode == 200) {
            var SelCl = [];
            var $ = cheerio.load(html);

            $("[name='SelCl'] option").each(function (i, element) {
              var tmp = {};
              tmp.class = $(element).text();
              tmp.value = $(element).attr("value");
              SelCl.push(tmp);
            });
            course.class = SelCl;
            SelDp.push(course);
            if (i == length - 1)
              callback && callback(SelDp);
          }
        });
      });
    }
  });  
})(function (Course) {
  Course.forEach(function (SelDp, i, Dp) {
    SelDp.class.forEach(function (SelCl, j, Cl) {
      request.post({
        url: courseURL,
        form: {
          'SelTh': '99X99',
          'SelBd': 'A1',
          'SelRm': '',
          'SelDy': '1',
          'SelSn': '1',
          'SelDp': SelDp.value,
          'SelCl': SelCl.value
        }
      }, function (err, response, html) {
        if (!err && response.statusCode == 200) {
          var res = [];
          var $ = cheerio.load(html);
          
          $(".cistab tr[bgcolor]").each(function (i, element) {
            var children = $(element).children();
            var cistab = {
              "cNum": $($(children).get(0)).clone().children().remove().end().text(),
              "cName": {
                "name": $($(children).get(1)).text(),
                "href": $($(children).get(1).firstChild).attr("href")
              },
              "teaName": $($(children).get(2)).text(),
              "credit": $($(children).get(4)).text(),
              "limit": $($(children).get(5)).text().split("/").pop()
            }
            res.push(cistab);
          });
          SelCl.course = res;
          // console.log('i: ' + i + ' j: ' + j + ' dp: ' + Dp.length + ' cl: ' + Cl.length);
          if ((i == Dp.length - 1) && (j == Cl.length - 1))
            // console.log('hello');
            console.log(JSON.stringify(Course));
        }
      });
    });
  });
});