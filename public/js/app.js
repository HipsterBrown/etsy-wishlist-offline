$('document').ready(function(){
  console.log('Ready for Etsy action!');

  var apiKey = "xx09emkh4xk0j6co24m7q436";
  var limit = 24;
  var trendingUrl = "https://openapi.etsy.com/v2/listings/trending.js?limit="+limit+"&includes=Images:1&api_key="+apiKey;
  var interestingUrl = "https://openapi.etsy.com/v2/listings/interesting.js?limit="+limit+"&includes=Images:1&api_key="+apiKey;
  var resultsBox =  $('#results');
  var wishBox = $('.wishlist');
  var searchForm = $('#search-form');
  var itemButton = $('.item-button');
  var openButton = $('button[data-action=wishlist-open]');


  function loadItems(url, title) {
    var itemsBox = $('.items');

    if(itemsBox) {
      itemsBox.prepend("<p class='loading' data-animate='fade-in'>Loading...</p>");
    } else {
      resultsBox.append("<p class='loading' data-animate='fade-in'>Loading...</p>");
    }

    if(!title) {
      title = "Neat";
    }

    $.ajax({
      url: url,
      dataType: "jsonp",
      beforeSend: removeItems,
      success: processData
    }).then(function(){
      resultsBox.prepend("<h2 class='results-title' data-animate='fade-in'>"+title+" Items</h2>");
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

  }

  function removeItems() {
    var items = $('#results .item');
    var resultsTitle = $('.results-title');

    if(items.length > 0) {
      resultsTitle.attr('data-animate', 'fade-out');
      items.attr('data-animate', 'fade-out');
    }
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
        loadingMessage.attr('data-animate', 'fade-out');
      }

      resultsBox.empty();
      resultsBox.append(resultsFrag);
      checkButtons();
    } else {
      resultsBox.html("<p>Nothing found.</p>");
    }
  }

  function renderResults(data) {
    var resultTemplate = $("#template-result").html();

    resultTemplate = Hogan.compile(resultTemplate);

    return resultTemplate.render(data);
  }

  function addWish(e){
    var parentItem = $(this).parents('.item');
    var itemID = $(parentItem).attr('data-id');
    var itemLink = $(parentItem).find('.item-link').attr('href');
    var itemImg = $(parentItem).find('.item-img').attr('src');
    var itemDesc = $(parentItem).find('.item-img').attr('alt');
    var itemTitle = $(parentItem).find('.item-title').text();
    var itemPrice = $(parentItem).find('.item-price').attr('data-price');

    if (parentItem.hasClass('item')) {
      var itemJSON = {
        'listing_id': itemID,
        'url': itemLink,
        'Images': [
          {
            'url_570xN': itemImg
          }
        ],
        'description': itemDesc,
        'title': itemTitle,
        'price': itemPrice ? itemPrice : false
      };

      storeItem(itemJSON);
      checkButtons();
    }
  }

  function removeWish(e) {
    var parentItem = $(this).parents('.item');
    var itemID = parentItem.attr('data-id');

    var savedItems = JSON.parse(localStorage.items);

    savedItems.forEach(function(savedItem, i, arr){
      if(savedItem.listing_id == itemID) {
        savedItems.splice(i, 1);
      }
    });

    var newList = JSON.stringify(savedItems);
    localStorage.setItem('items', newList);

    $(window).trigger('storage');
    checkButtons();
  }

  function storeItem(data) {
    var store = localStorage.getItem('items');
    var storeJSON;

    if(store) {
      storeJSON = JSON.parse(store);
      if(Array.isArray(storeJSON)) {
        storeJSON.push(data);
      } else {
        storeJSON = new Array();
        storeJSON.push(data);
      }
    } else {
      storeJSON = new Array();
      storeJSON.push(data);
    }

    var storeString = JSON.stringify(storeJSON);
    localStorage.setItem('items', storeString);

    $(window).trigger('storage');
  }

  function renderList(e) {
    var savedItems = JSON.parse(localStorage.items);
    //console.log(savedItems.length);

    var wishBox = $('.wishlist');
    var listFrag = "<ul class='items'>";

    $.each(savedItems, function(i, item) {
      listFrag += renderResults(item);
    });

    listFrag += "</ul>";

    wishBox.find('.items').remove();
    wishBox.append(listFrag);

    checkButtons();
  }

  function showList(e) {
    $(this).parents('.wishlist').toggleClass('is-open');

    if( $('.wishlist').hasClass('is-open') ) {
      renderList();
    }
  }

  function checkButtons() {
    var items = $('.item');

    $.each(items, function(i, item){
      var addButton = $(item).find('button[data-action=wishlist-add]');
      var removeButton = $(item).find('button[data-action=wishlist-remove]');
      var itemID = $(item).attr('data-id');
      var savedItems = JSON.parse(localStorage.items);
      var isSaved = false;

      $.each(savedItems, function(x, savedItem){
          if(savedItem.listing_id == itemID) {
              isSaved = true;
          }
      });

      if(isSaved && addButton) {
          addButton.removeClass('item-add').addClass('item-remove').attr('data-action', 'wishlist-remove').html('<span class="icon-list"></span> Remove');
      } else if (removeButton) {
          removeButton.removeClass('item-remove').addClass('item-add').attr('data-action', 'wishlist-add').html('<span class="icon-list"></span> Wishlist');
      }
    });
  }

  openButton.on('click', showList);
  $(window).on('storage', renderList);
  resultsBox.on('click', 'button[data-action=wishlist-add]', addWish);
  resultsBox.on('click', 'button[data-action=wishlist-remove]', removeWish);
  wishBox.on('click', 'button[data-action=wishlist-remove]', removeWish);
  searchForm.on('submit', searchEtsy);
  itemButton.on('click', triggerLoad);
  loadItems(trendingUrl, "Trending");

  setTimeout(function(){
    $('.footer').attr('data-animate', 'fade-in');
  }, 5000);
});
