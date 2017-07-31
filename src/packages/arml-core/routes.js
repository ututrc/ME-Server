Router.route('/', function() {

    this.wait(Meteor.subscribe("features"));
    this.wait(Meteor.subscribe("overlays"));
    this.wait(Meteor.subscribe("applications"));


    if (this.ready()) {
      this.layout("GlobalView");
      this.render("HomeView");
    }
});
