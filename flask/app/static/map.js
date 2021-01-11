var map, listings, labels, reviews, markers, listigIndice, userCircle, layerControl;
//var markerLatLngs;
var colors = ['yellow', 'green', 'red', 'blue', 'orange', 'OLIVE', 'brown', 'AQUA', 'magenta', 'violet', 'TEAL', 'navy', 'Salmon',
    'LightSeaGreen', 'DeepPink', 'lime', 'black', 'Tan', 'Maroon', 'OrangeRed'];
var tourisctAttratcion = {
    "Federation Square": [-37.817961, 144.969059],
    "Royal Botanic Gardens Victoria": [-37.830349, 144.979606],
    "National Sports Museum": [-37.818860, 144.983707],
    "Arts Centre Melbourn": [-37.820169, 144.968115],
    "National Gallery of Victoria": [-37.822519, 144.968950],
    "Eureka Skydeck": [-37.821332, 144.964699],
    "Royal Arcade": [-37.814664, 144.963622],
    "Royal Exhibition Building": [-37.804655, 144.971639],
    "Melbourne Zoo": [-37.784101, 144.951569],
    "Shrine of Remembrance": [-37.830523, 144.973441],
    "Parliament House": [-37.811000, 144.973833],
    "Immigration Museum": [-37.819108, 144.960487]
};
var touristLayers = [];

function addDrawingControl() {
    var drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    var drawControl = new L.Control.Draw({
        draw: {
            polygon: false,
            polyline: false,
            rectangle: false,
            circle: true,
            marker: false,
            circlemarker: false

        },
        edit: {
            featureGroup: drawnItems, //REQUIRED!!
            remove: true
        }
    });
    map.addControl(drawControl);

    userCircle = null;
    map.on(L.Draw.Event.CREATED, function (e) {
        var type = e.layerType,
            layer = e.layer;
        if (type === 'circle') {
            userCircle = layer
        }
        drawnItems.addLayer(layer);
        getAreaStatistics();
    });

    map.on(L.Draw.Event.DRAWSTART, function (e) {
        drawnItems.clearLayers();//delete other circles, only allow one circle at a time
    });

    map.on(L.Draw.Event.EDITED, function (e) {
        var layers = e.layers;
        layers.eachLayer(function (layer) {
            userCircle = layer
        });
        getAreaStatistics();
    });
    map.on(L.Draw.Event.DELETESTART, function (e) {
        userCircle = null
    });
}

function getAreaStatistics() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            response = this.responseText;
            L.popup()
                .setLatLng(userCircle.getLatLng())
                .setContent(response)
                .openOn(map);
        }
    }
    xhttp.open("GET", "filter_map?lat=" + userCircle.getLatLng().lat + "&long=" +
        userCircle.getLatLng().lng + "&radius=" + userCircle.getRadius(), true);
    xhttp.send();
}

function createMap(minPriceNormal, maxPriceNormal, minPrice, maxPrice) {

    var streets = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png");
    var heatmap = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png");

    map = L.map('mapid', {
        center: [-37.840935, 144.9631],
        zoom: 10,
        minZoom: 9,
        maxZoom: 20,
        zoomControl: false
    });
    map.addControl(new L.Control.ZoomMin());
    heatPoints = [];
    for (var i = 0; i < listings.length; i++) {
        heatPoints.push([listings[i].lat, listings[i].long,
            getIntensity(listings[i].normalPrice, minPriceNormal, maxPriceNormal)]);
    }
    heat = L.heatLayer(heatPoints, {
        radius: 25,
        gradient: {0: 'blue', 0.25: 'lime', 0.5: 'yellow', 0.75: 'orange', 1: 'red'}
    });
    heatmapLayer = L.layerGroup([heatmap, heat]);
    var baseMaps = {
        "Streets": streets,
        "Price Heatmap": heatmapLayer
    };

    markers = {};
    listigIndice = [];
    bnbs = [];
    for (var i = 0; i < listings.length; i++) {
        listing = listings[i];
        var listingMarker = L.circleMarker([listing.lat, listing.long],
            {id: listing.id, indexInCSV: i, color: 'rgba(36,62,66,0.48)', radius: 2, fill: true, fillOpacity: 0.3});
        listingMarker.bindPopup(String(listing.roomType + ' in ' + listing.propType + '<br><b>' + listing.name + '</b><br>'
            + listing.bathroom + ' bathromms.' + listing.bedrooms + ' bedrooms.' + listing.beds + ' beds<br>' + listing.price + 'AU$/Night' +
            '<br/><br/><button type="button" class="btn btn-warning" data-toggle="modal" data-target="#myModal">Analyze Reviews</button>'));
        markers[listing.id] = listingMarker;
        bnbs.push(listingMarker);
        listigIndice.push(i);
    }
    addTouristAttractions();
    var airbnbs = L.layerGroup(bnbs);
    var overlayMaps = {
        "Airbnbs": airbnbs,
        "Tourist Attractions": L.layerGroup(touristLayers)
    };
    layerControl = L.control.layers(baseMaps, overlayMaps);
    layerControl.addTo(map);
    map.addLayer(streets);//inital selection of base layer in the map

    map.on('zoomend', function () {
        var currentZoom = map.getZoom();
        this.eachLayer(function (layer) {
            if (layer instanceof L.CircleMarker) {
                layer.setRadius(currentZoom < 17 ? 2 : (currentZoom / 3).toFixed(0));
            }
        });
    });

    map.on('popupclose', function (e) {
        clearWordCloud();
    });
    heatmapLayer.on('add', (e) => {
        d3.select("#heatmap-legend").style("visibility", "visible");
    });
    heatmapLayer.on('remove', (e) => {
        d3.select("#heatmap-legend").style("visibility", "hidden");
    });
    airbnbs.on('add', (e) => {
        ids = Object.keys(markers);
        for (i = 0; i < ids.length; i++) {
            id = ids[i];
            if (!listigIndice.includes(markers[id].options.indexInCSV))
                map.removeLayer(markers[id]);
        }
    });
    drawLegend(minPrice, maxPrice);
}

function getListings(csvFile) {
    d3.csv(csvFile).then(function (data) {
        listings = [];
        groups = ['red', 'green', 'yellow', 'violet'];
        /*data.forEach(function (d) {
                   d['price'] = +d['price'];
               });*/
        data.forEach(function (d) {
            listings.push({
                id: d['id'], lat: d['latitude'], long: d['longitude'],
                name: d['name'], roomType: d['room_type'], propType: d['property_type'],
                bathroom: d['bathrooms'], bedrooms: d['bedrooms'], beds: d['beds'],
                //color: groups[Math.floor(Math.random() * 4)],
                sentiment: d['res'],
                price: d['price'],
                normalPrice: +d['normalPrice']
            });
        });
        maxPriceNormal = d3.max(data, function (d) {
            return +d['normalPrice'];
        });
        minPriceNormal = d3.min(data, function (d) {
            return +d['normalPrice'];
        });
        maxPrice = d3.max(data, function (d) {
            return +d['price'];
        });
        minPrice = d3.min(data, function (d) {
            return +d['price'];
        });

        createMap(minPriceNormal, maxPriceNormal, minPrice, maxPrice);
        addDrawingControl();
        //createHeatMap(minPriceNormal, maxPriceNormal, minPrice, maxPrice);
        show(0, 10);
        addNeighborhoods('../static/neighbourhoods.geojson');

    });
}

function panToListing(l) {
    id = l.target.attributes.id.value;
    map.setView(markers[id].getLatLng(), 18);
    //marker = map.getMarkerById(id).openPopup();
    markers[id].openPopup();
    drawWordCloud(reviews[id]);
    showSentiment(listings[markers[id].options.indexInCSV]['sentiment'])
}


function getReviews(csvFile) {
    d3.csv(csvFile).then(function (data) {
        reviews = {};
        data.forEach(function (d) {
            reviews[d['listing_id']] = {
                'value': JSON.parse(d['comments']),
                'sentiment': JSON.parse(d['sent'])
            };
        });
    });
}

function addNeighborhoods(geojsonFile) {

    d3.json(geojsonFile).then(function (data) {
        neighborhoodGeos = L.geoJson(data, {
            onEachFeature: function (feature, layer) {
                layer.bindPopup(feature.properties.neighbourhood);
                layer.setStyle({fill: true, color: d3.hsl(Math.random() * 360, 0.9, 0.5)});
            }
        });
        layerControl.addOverlay(neighborhoodGeos, "Neighborhoods");
    });

}

function addTouristAttractions() {
    attractions = Object.keys(tourisctAttratcion);
    tourist = L.icon({
        iconUrl: '../static/heritage.png',
        iconSize: [38, 38],
        iconAnchor: [22, 94],
        popupAnchor: [-3, -76]
    });
    for (i = 0; i < attractions.length; i++) {
        touristLayers.push(L.marker(tourisctAttratcion[attractions[i]],
            {icon: tourist}).bindPopup(String(attractions[i])));
    }
}

document.addEventListener("DOMContentLoaded", function (event) {
    getListings('../static/lstaverageDist.csv');
    getReviews('../static/reviews.csv');
    initializeWordCloudSVG();
    initializeGauge();
});

window.onload = function () {
    document.getElementById('cluster-button').addEventListener("click", function () {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                response = JSON.parse(this.responseText);
                cluster_size = parseInt(response['estimated_clusters']);
                descriptions = response['featureDescriptions'];
                labels = response['result'];
                assignLabelToListing();
                makeClusterCheckbox();
                showFeatureHists(descriptions);
            }
        };
        k = document.getElementById('k').value;
        xhttp.open("GET", "cluster?k=" + k + getWeights(), true);
        xhttp.send();
    });
    document.getElementById('filter-map').addEventListener("click", function () {

        if (userCircle != null)
            filterListingsInCircle(userCircle.getLatLng(), userCircle.getRadius())
        else {
            ids = Object.keys(markers);
            for (i = 0; i < ids.length; i++) {
                id = ids[i];
                if (!map.hasLayer(markers[id]))//might have been removed due to previous selections of checkboxes
                {
                    map.addLayer(markers[id])
                    if (!listigIndice.includes(markers[id].options.indexInCSV))
                        listigIndice.push(markers[id].options.indexInCSV)
                }
            }
        }
    });
    document.getElementById('filter-button').addEventListener("click", function () {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                response = JSON.parse(this.responseText);
                filterListingsByUserInput(response['result']);
            }
        };
        params = "";
        //****amenities
        amenities = []
        if (document.getElementById('wifi').checked === true)
            amenities.push("Wifi");
        if (document.getElementById('ac').checked === true)
            amenities.push("Air conditioning");
        if (document.getElementById('gym').checked === true)
            amenities.push("Gym");
        if (document.getElementById('pool').checked === true)
            amenities.push("Pool");
        if (document.getElementById('kitchen').checked === true)
            amenities.push("Kitchen");
        params += "amenities=" + (amenities.length === 0 ? 'all' : amenities.toString());
        //Property Type
        property_type = document.getElementById('property-type').value;
        params += "&property_type=" + property_type;
        //host_response_time
        // host_response_time = document.getElementById('host_response_time').value;
        // params += "&host_response_time=" + host_response_time;
        //superhost
        superhost = document.getElementById('superhost').checked === true ? '1' : '0';
        params += "&superhost=" + superhost;
        bath = document.getElementById('bath').value === '' ? '-1' : document.getElementById('bath').value;
        params += "&bathrooms=" + bath;
        bedroom = document.getElementById('bedroom').value === '' ? '-1' : document.getElementById('bedroom').value;
        params += "&bedrooms=" + bedroom;
        bed = document.getElementById('bed').value === '' ? '-1' : document.getElementById('bed').value;
        params += "&beds=" + bed;
        price = document.getElementById('price-range').value;
        params += "&price=" + price;

        xhttp.open("GET", "filter?" + params, true);
        xhttp.send();
    });

    /*document.getElementById('switch').addEventListener("change", function () {
        if (this.checked) {
            map.addLayer(neigbourhoodGeos)
        } else {
            map.removeLayer(neigbourhoodGeos)
        }
    });
    document.getElementById('tourist-switch').addEventListener("change", function () {
        if (this.checked) {
            for (i = 0; i < touristLayers.length; i++)
                map.addLayer(touristLayers[i])
        } else {
            for (i = 0; i < touristLayers.length; i++)
                map.removeLayer(touristLayers[i])
        }
    });*/
};

function assignLabelToListing() {
    ids = Object.keys(labels);
    for (i = 0; i < ids.length; i++) {
        id = ids[i];
        markers[id].setStyle({
            color: colors[labels[id]]
        });
        if (!map.hasLayer(markers[id]))//might have been removed due to previous selections of checkboxes
        {
            map.addLayer(markers[id])
            if (!listigIndice.includes(markers[id].options.indexInCSV))
                listigIndice.push(markers[id].options.indexInCSV)
        }
    }
}

function makeClusterCheckbox() {
    var checkboxDiv = document.getElementById('cluster-checkbox');
    while (checkboxDiv.firstChild) {
        checkboxDiv.removeChild(checkboxDiv.firstChild);
    }
    d3.select('#cluster-checkbox').append('label').text('Clusters:  ');
    clegend = [];
    for (var i = 0; i < cluster_size; i++) {
        clegend.push('cluster #' + i);
        d3.select("#cluster-checkbox")
            .append('label')
            .text(' Cluster ' + i + ' ')
            .style("background-color", colors[i])
            .append('input')
            .attr('type', 'checkbox').style('width', '10px').style('height', '10px')
            .property('checked', true)
            .property('id', 'c' + i)
            .on("click", function () {
                cluster = this.id.substring(1);
                ids = Object.keys(labels);
                for (var j = 0; j < ids.length; j++) {
                    if (cluster === labels[ids[j]]) {
                        marker = markers[ids[j]];
                        if (this.checked && !map.hasLayer(markers[ids[j]])) {
                            map.addLayer(marker);
                            if (!listigIndice.includes(marker.options.indexInCSV))
                                listigIndice.push(marker.options.indexInCSV)
                        } else if (!this.checked) {
                            map.removeLayer(marker);
                            if (listigIndice.includes(marker.options.indexInCSV))
                            //https://stackoverflow.com/questions/3954438/how-to-remove-item-from-array-by-value
                                listigIndice = listigIndice.filter(function (e) {
                                    return e !== marker.options.indexInCSV
                                })
                        }
                    }
                }
                show(0, 10);
                updateHeatmap();
            });
    }
}

function filterListingsInCircle(centerLatlng, radius) {
    ids = Object.keys(markers);
    for (i = 0; i < ids.length; i++) {
        id = ids[i];
        mll = markers[id].getLatLng();
        var isInside = Math.abs(centerLatlng.distanceTo(mll)) <= radius;
        if (isInside && !map.hasLayer(markers[id])) {
            map.addLayer(markers[id]);
            if (!listigIndice.includes(markers[id].options.indexInCSV))
                listigIndice.push(markers[id].options.indexInCSV)
        } else if (!isInside) {
            map.removeLayer(markers[id]);
            if (listigIndice.includes(markers[id].options.indexInCSV))
                listigIndice = listigIndice.filter(function (e) {
                    return e !== markers[id].options.indexInCSV
                })
        }
    }
    show(0, 10);
    updateHeatmap()
}

function showFeatureHists(descriptions) {
    features = Object.keys(descriptions);
    var traces = [];
    for (i = 0; i < features.length; i++) {
        let data = JSON.parse(descriptions[features[i]]);
        /* var layout = {
             title: features[i],
             autosize: false,
             width: 50,
             height: 50,
             bargap: 0.05,
         };*/
        //Plotly.newPlot('hist' + i.toString(), sample, layout, {staticPlot: true});
        //d3.select("#hist" + i.toString() + "title").html('<h3>' + features[i] + '<h3>');
        var trace = {
            x: data['x'],
            y: data['y'],
            name: features[i],
            type: 'bar'
        };
        traces.push(trace);
    }
    var layout = {
        barmode: 'group'
    };
    Plotly.newPlot('hist0', traces, layout);


}

function filterListingsByUserInput(listingIDs) {
    ids = Object.keys(markers);
    for (i = 0; i < ids.length; i++) {
        id = ids[i];
        included = listingIDs.includes(parseInt(id));
        if (included && !map.hasLayer(markers[id])) {
            map.addLayer(markers[id]);
            if (!listigIndice.includes(markers[id].options.indexInCSV))
                listigIndice.push(markers[id].options.indexInCSV)
        } else if (!included) {
            map.removeLayer(markers[id]);
            if (listigIndice.includes(markers[id].options.indexInCSV))
                listigIndice = listigIndice.filter(function (e) {
                    return e !== markers[id].options.indexInCSV
                })
        }
    }
    show(0, 10);
    updateHeatmap()
}
