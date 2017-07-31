Meteor.publish(packageConfig.collection, function() {
  return ARML.data.annotations.find({},{sort: ["number", "asc"] });
});
