$('document').ready(function(){
  console.log('Ready for Etsy action!');

  var apiKey = "xx09emkh4xk0j6co24m7q436";
  var trendingUrl = "https://openapi.etsy.com/v2/listings/trending.js?limit=12&includes=Images:1&api_key="+apiKey;
  var interestingUrl = "https://openapi.etsy.com/v2/listings/interesting.js?limit=12&includes=Images:1&api_key="+apiKey;
  var resultsBox =  $('#results');
  var searchButton = $('#search');

  var searchForm = $('#search-form');
  searchForm.on('submit', searchEtsy);


  function loadItems(url) {
    resultsBox.html("<p>Loading...</p>");

    $.ajax({
      url: url,
      dataType: "jsonp",
      success: processData
    });
  }

  function searchEtsy(e) {
    e.preventDefault();
    var terms = $('#terms').val();

    if(!terms) {
      resultsBox.html("<p>Please include a search term.</p>");

      return false;
    }

    var searchUrl = "https://openapi.etsy.com/v2/listings/active.js?keywords="+terms+"&limit=12&includes=Images:1&api_key="+apiKey;

    loadItems(searchUrl);
  }

  function processData(data) {
    if(data.ok) {
      console.log(data.results);
      var resultsFrag = "<ul class='items'>";

      $.each(data.results, function(i, item){
        resultsFrag += renderResults(item);
      });

      resultsFrag += "</ul>";

      resultsBox.html(resultsFrag);
    } else {
      resultsBox.html("<p>Nothing found.</p>");
    }
  }

  function renderResults(data) {
    var resultTemplate = $("#template-result").html();

    resultTemplate = Hogan.compile(resultTemplate);

    return resultTemplate.render(data);
  }

  loadItems(trendingUrl);
});
