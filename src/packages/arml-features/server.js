Meteor.publish(packageConfig.collection, function() {
  return ARML.data.features.find({},{sort: ["_id", "asc"] });
});

Meteor.methods({
  featureCustomInsert: function(doc){

    var feature = {
      name: doc.name,
      description: doc.description,
      geolocation: doc.geolocation,
      enabled: doc.enabled,
      tags: doc.tags,
      application: doc.application,
      anchor: doc.anchor
    };
    var featureID = ARML.data.features.insert(feature);

    var featureasset = {
      name: "Kohdennus",
      feature: featureID,
      asset: doc.target,
      scale: {x: 1, y: 1, z: 1},
      application: doc.application
    };
    ARML.data.featureassets.insert(featureasset);

    var viewpoint = {
      application: doc.application,
      name: doc.name,
      description: "Automatically created for feature " + doc.name,
      geolocation: doc.geolocation,
      zoneid: doc.zoneid,
      sector: [{
        startAngle: 0,
        endAngle: 360,
        trackable: doc.target
      }]
    }
    ARML.data.viewpoints.insert(viewpoint);
  }
});
