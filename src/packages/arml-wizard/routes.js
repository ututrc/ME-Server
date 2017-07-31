Router.route("/wizard", function() {
  this.wait(Meteor.subscribe("applications"));
  this.wait(Meteor.subscribe("trackers"));
  //this.wait(Meteor.subscribe("trackables"));
  this.wait(Meteor.subscribe("viewpoints"));
  this.wait(Meteor.subscribe("features"));
  this.wait(Meteor.subscribe("overlays"));
  this.layout("GlobalView");
  if (this.ready()) {
      this.render("WizardView");
  }
});
