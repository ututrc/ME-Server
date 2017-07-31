Template.registerHelper("InsertFeatureSchema", InsertFeatureSchema);

var hooksObject = {
  before: {
    method: function(doc) {
      doc.application = Session.get("currentApplication");
      this.result(doc);
    }
  },
  onSuccess: function(operation, result, template) {
    Router.go("/features");
  }
};

AutoForm.addHooks(['insertFeatureForm', 'updateFeatureForm'], hooksObject);

Template.InsertFeatureView.rendered = function() {
  var overlay = ARML.data.overlays.findOne({ application: Session.get('currentApplication')});
  if(overlay) {
    var northWest = overlay.northWest.split(",");
    var southEast = overlay.southEast.split(",");
    var imageBounds = [northWest, southEast];
    var fileUrl = overlay.file.url;

    L.imageOverlay(fileUrl, imageBounds, {opacity: 0.5}).addTo(afLeaflet.maps['anchor-geolocation-map']);
    L.imageOverlay(fileUrl, imageBounds, {opacity: 0.5}).addTo(afLeaflet.maps['geolocation-map']);
  }

};

Template.FeatureGridView.helpers({
  features: function() {
    var features = [];

    if(Meteor.user() && Meteor.user().latestApplication) {
      features = ARML.data.features.find({application: Meteor.user().latestApplication},{sort: ["_id", "asc"] }).fetch();
    }
    return features;
  }
});
