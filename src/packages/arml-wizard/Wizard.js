Template.chooseApplication.helpers({
  applications: function() {
      return ARML.data.applications.find({});
  },
});

Template.chooseApplication.events({
  "change #ApplicationSelect": function(event, template){
    // Get value of selected: $(event.currentTarget).find(':selected').val()
    Session.set("selectedApplication", $(event.currentTarget).find(':selected').val());
  }
});

Template.chooseTracker.helpers({
  trackers: function() {
      var trackers = ARML.data.trackers.find({application: Session.get("selectedApplication")}).fetch();
      return trackers;
  }
});

Template.chooseTracker.events({
  "change #TrackerSelect": function(event, template){
    Session.set("selectedTracker", $(event.currentTarget).find(':selected').val());
  }
});

Template.chooseTrackable.helpers({
  trackables: function() {
    var trackables = ARML.data.trackables.find({application: Session.get("selectedApplication"), tracker: Session.get("selectedTracker")}).fetch();
    return trackables;
  }
});

Template.chooseViewpoint.helpers({
  viewpoints: function() {
    var viewpoints = ARML.data.viewpoints.find({application: Session.get("selectedApplication")}).fetch();
    return viewpoints;
  }
});

Template.chooseFeature.helpers({
  features: function() {
      return ARML.data.features.find({});
  }
});
