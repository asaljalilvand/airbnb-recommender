var numItems = 10000;
var perPage = 10;

function show(start, end) {
    // var listingsInPage = listings.slice(start, end);
    listingsInPage = [];
    for (i = start; i < Math.min(listigIndice.length, end); i++) {
        listingsInPage.push(listings[listigIndice[i]])
    }
    var html = '<h3>Listings</h3><ul class="places">';
    for (var i = 0; i < listingsInPage.length; i++) {
        l = listingsInPage[i];
        html += '<li class="place" id="'+l.id+'">' + l.roomType + ' in ' + l.propType + '<br><b>' + l.name + '</b><br>'
            + l.bathroom + ' bathromms.' + l.bedrooms + ' bedrooms.' + l.beds + ' beds<br>' + l.price + 'AU$/Night</li>';
    }
    html += '</ul><br>';
    document.getElementById('list').innerHTML = html;

    var li = document.getElementsByTagName("li");
    for (var i = 0; i < li.length; i++) {
        li[i].addEventListener("click", panToListing);
    }
}

$('#pagination-container').pagination({
    items: numItems,
    itemsOnPage: perPage,
    prevText: "&laquo;",
    nextText: "&raquo;",
    displayedPages: 3,
    edges: 1,
    onPageClick: function (pageNumber) {
        var showFrom = perPage * (pageNumber - 1);
        var showTo = showFrom + perPage;
        show(showFrom, showTo)
    }
});