Meteor.publish(packageConfig.collection, function() {
  return ARML.data.applications.find({},{sort: ["_id", "asc"] });
});
