Meteor.methods({
  'editor.updateNumbers': function(featureID) {
    var count = 1;

    var featureAssets = ARML.data.featureassets.find({feature: featureID});
    var featureAssetIds = [];
    featureAssets.map(function(doc, index) {
      featureAssetIds.push(doc._id);
    });
    var existingAnnotations = ARML.data.annotations.find({featureasset: {$in: featureAssetIds}});

    existingAnnotations.map(function(entry){
      if(entry !== null){
        ARML.data.annotations.update({_id: entry._id}, {$set: {number: count}});
        ++count;
      } else {
        console.log("Null value!");
      }

    });
  },
  insertFeatureAsset: function(doc){
    doc.editorOnly = false;
    doc.position = {x: 0, y: 0, z: 0};
    doc.rotation = {x: 0, y: 0, z: 0};
    doc.scale = {x: 1, y: 1, z: 1};
    var feature = ARML.data.features.findOne({_id: doc.feature});
    var asset = ARML.data.assets.findOne({_id: doc.asset});
    doc.application = feature.application;
    doc.name = asset.name;
    ARML.data.featureassets.insert(doc);
  },
});
