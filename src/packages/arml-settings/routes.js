Router.route("/settings", function() {
  this.layout("GlobalView");
  this.wait(Meteor.subscribe('application-settings'));
  this.render("ApplicationSettingsView");
});

Router.route("/settings/reset", function() {
  this.layout("GlobalView");
  this.wait(Meteor.subscribe('application-settings'));
  this.render("ApplicationSettingsResetView");
});
