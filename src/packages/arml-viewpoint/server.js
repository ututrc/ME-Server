Meteor.publish(packageConfig.collection, function() {
  return ARML.data.viewpoints.find({},{sort: ["_id", "asc"] });
});
