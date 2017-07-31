Router.route("/apidoc", function() {
  this.wait(Meteor.subscribe("applications"));
  this.wait(Meteor.subscribe("features"));
  this.layout("GlobalView");
  if (this.ready()) {
      this.render("ApiDoc");
  }
});

Router.route("/import-arml", function() {
  if (this.ready()) {
      this.render("Import");
  }
});
