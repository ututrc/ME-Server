Template.ApiDoc.helpers({
  apiApplications: function() {
    return ARML.data.applications.find({});
  },
  apiFeatures: function() {
    return ARML.data.features.find({});
  }
});

var x2js = new X2JS({
    escapeMode: true,
    arrayAccessForm: "none"
});

Template.Import.events({
  'submit .new-import': function(event) {
    event.preventDefault();

    // Get value from form element
    const target = event.target;
    const arml = target.arml.value;



    var jsonObj = x2js.xml_str2json( arml );

    // Clear form
    target.arml.value = '';

    var application = jsonObj.arml.arelements.application; // Object
    var features = jsonObj.arml.arelements.features.feature; // Object or array
    var sectors = jsonObj.arml.arelements.sectors.sector; // Object or array
    var trackables = jsonObj.arml.arelements.trackables.trackable; // Object or array
    var trackers = jsonObj.arml.arelements.trackers.tracker; // Object or array
    var viewpoints = jsonObj.arml.arelements.viewpoints.viewpoint; // Object or array

    // Handle application
    // Check if application with same name exists and get its id. Otherwise, create new application and return its id.
    var dbApplication = ARML.data.applications.findOne({ name: application.name });
    if(!dbApplication) {
      dbApplication = {};
      dbApplication.name = application.name;
      dbApplication.description = application.description;
      console.log("insert to database mock");
      // insert into database -> ...

    }


    // Handle features
    var mongoFeatures = [];
    features.map(function(feature) {
      var mongoFeature = {};
      mongoFeature._id = feature._id;
      mongoFeature.name = feature.name;
      mongoFeature.description = feature.description;
      mongoFeature.externalurl = "not importable";
      mongoFeature.anchor = feature.anchor.asset;

      // Handle object or array
      if(Array.isArray(feature.assets)) {
        mongoFeature.assets = [];
        feature.assets.map(function(asset) {
          mongoFeature.assets.push(asset._id);
        });
      }
      else {
        mongoFeature.assets = [ feature.assets.asset._id ];
      }

      mongoFeature.editorEnvironment = "not importable"; // this is null?

      // Features geolocation is in anchor
      mongoFeature.geolocation = feature.anchor.Point.pos.__text;

      // Trackables are defined elsewhere in ARML
      if(Array.isArray(feature.trackables.trackable)) {
        mongoFeature.trackables = [];
        feature.trackables.trackable.map(function(trackable) {
          var trackableId = trackable["_xlink:href"].slice(1, trackable["_xlink:href"].length-1);
          mongoFeature.trackables.push(trackableId);
        });
      }
      else {
        var trackable = feature.trackables.trackable;
        var trackableId = trackable["_xlink:href"].slice(1, trackable["_xlink:href"].length-1);
        mongoFeature.trackables = [ trackableId ];
      }

      mongoFeature.enabled = true;
      mongoFeature.application = application.name; // This needs to be fetched from db or inputed by user
      mongoFeatures.push(mongoFeature);
    });

    // Handle viewpoints
    var mongoViewpoints = [];
    viewpoints.map(function(viewpoint) {
      var mongoViewpoint = {};
      mongoViewpoint._id = viewpoint._id;
      mongoViewpoint.name = viewpoint.name;
      mongoViewpoint.description = "not importable";
      mongoViewpoint.geolocation = viewpoint.Point.pos.__text;
      mongoViewpoint.sector = { startAngle: 1, endAngle: 1, trackable: "asdf"}
      mongoViewpoint.application = application.name;

      mongoViewpoints.push(mongoViewpoint);
    });

  }
});
