Meteor.publish(packageConfig.collection, function() {
  return ARML.data.overlays.find();
});
