Meteor.publish(packageConfig.collection, function() {
  return ARML.data.featureassets.find({},{sort: ["_id", "asc"] });
});
