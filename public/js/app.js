$('document').ready(function(){
  console.log('Ready for Etsy action!');

  var apiKey = "xx09emkh4xk0j6co24m7q436";
  var limit = 24;
  var trendingUrl = "https://openapi.etsy.com/v2/listings/trending.js?limit="+limit+"&includes=Images:1&api_key="+apiKey;
  var interestingUrl = "https://openapi.etsy.com/v2/listings/interesting.js?limit="+limit+"&includes=Images:1&api_key="+apiKey;
  var resultsBox =  $('#results');

  var searchForm = $('#search-form');
  searchForm.on('submit', searchEtsy);

  var itemButton = $('.item-button');
  itemButton.on('click', triggerLoad);


  function loadItems(url, title) {
    var itemsBox = $('.items');

    if(itemsBox) {
      itemsBox.prepend("<p class='loading'>Loading...</p>");
    } else {
      resultsBox.append("<p class='loading'>Loading...</p>");
    }

    if(!title) {
      title = "Neat";
    }

    $.ajax({
      url: url,
      dataType: "jsonp",
      success: processData
    }).then(function(){
      resultsBox.prepend("<h2 class='results-title'>"+title+" Items</h2>");
    });
  }

  function searchEtsy(e) {
    e.preventDefault();
    var terms = $('#terms').val();

    if(!terms) {
      resultsBox.html("<p>Please include a search term.</p>");

      return false;
    }

    var searchUrl = "https://openapi.etsy.com/v2/listings/active.js?keywords="+terms+"&limit="+limit+"&includes=Images:1&api_key="+apiKey;

    loadItems(searchUrl, terms);
  }

  function triggerLoad(e) {
    var target = $(e.target).attr('data-action');
    var itemUrl;

    if(target === "Trending") {
        itemUrl = trendingUrl;
    } else if(target === "Interesting") {
        itemUrl = interestingUrl;
    } else {
      return false;
    }

    loadItems(itemUrl, target);

    //resultsBox.prepend("<h2 class='results-title'>"+target+" Items</h2>");

  }

  function processData(data) {
    if(data.ok) {
      console.log(data.results);
      var loadingMessage = $('.loading');
      var resultsFrag = "<ul class='items'>";

      $.each(data.results, function(i, item){
        resultsFrag += renderResults(item);
      });

      resultsFrag += "</ul>";

      if(loadingMessage) {
        loadingMessage.remove();
      }

      resultsBox.empty();
      resultsBox.append(resultsFrag);
    } else {
      resultsBox.html("<p>Nothing found.</p>");
    }
  }

  function renderResults(data) {
    var resultTemplate = $("#template-result").html();

    resultTemplate = Hogan.compile(resultTemplate);

    return resultTemplate.render(data);
  }

  loadItems(trendingUrl, "Trending");
});
