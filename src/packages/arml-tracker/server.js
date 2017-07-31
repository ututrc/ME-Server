Meteor.publish(packageConfig.collection, function() {
  return ARML.data.trackers.find();
});
