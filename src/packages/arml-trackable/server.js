Meteor.publish(packageConfig.collection, function() {
  return ARML.data.trackables.find({});
});
