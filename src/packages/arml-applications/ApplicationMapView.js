var markerIcon = L.AwesomeMarkers.icon({
   icon: 'star',
   markerColor: 'blue'
 });

var zoomLevel = 10;
var tileLayerProvider = 'OpenStreetMap.Mapnik';
var defaultLatLng = L.latLng(60.44, 22.29);
var useDoubleClickZoom = true;

Template.ApplicationMapView.rendered = function() {
  // Create map
  var map = L.map('ApplicationMapView', {
      doubleClickZoom: useDoubleClickZoom
  });

  L.tileLayer.provider(tileLayerProvider).addTo(map);
  map.setView(defaultLatLng, zoomLevel, {
    animate: true
  });

  var featureMarkers = [];
  var features = ARML.data.features.find({ application: Session.get("currentApplication")});
  features.map(function(feature) {
    var latlng = feature.geolocation.split(",");
    var marker = L.marker(latlng, {icon: markerIcon, });
    featureMarkers.push(marker);

    var popupContent = "<a href='/admin/features/" + feature._id + "'>" + feature.name + "</a><br>" + feature.description;
    marker.bindPopup(popupContent).openPopup();

    marker.addTo(map);
  });

  var overlays = ARML.data.overlays.find({ application: Session.get("currentApplication")});
  overlays.map(function(overlay) {
    var northWest = overlay.northWest.split(",");
    var southEast = overlay.southEast.split(",");
    var imageBounds = [northWest, southEast];
    var fileUrl = overlay.file.url;

    L.imageOverlay(fileUrl, imageBounds, {opacity: 0.5}).addTo(map);
  });
};
