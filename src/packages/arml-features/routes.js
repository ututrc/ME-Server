Router.route("/features", function() {
  this.wait(Meteor.subscribe("applications"));
  this.wait(Meteor.subscribe("features"));
  this.layout("GlobalView");
  if (this.ready()) {
      this.render("FeatureGridView");
  }
});

Router.route("/features/create", function() {
  this.wait(Meteor.subscribe("applications"));
  this.wait(Meteor.subscribe("trackers"));
  //this.wait(Meteor.subscribe("trackables"));
  this.wait(Meteor.subscribe("viewpoints"));
  this.wait(Meteor.subscribe("features"));
  this.wait(Meteor.subscribe("overlays"));
  this.layout("GlobalView");
  if (this.ready()) {
      this.render("InsertFeatureView");
  }
});

Router.route("/features/:id/edit", function() {
  this.wait(Meteor.subscribe("applications"));
  this.wait(Meteor.subscribe("features"));
  this.wait(Meteor.subscribe("assets"));
  this.layout("GlobalView");
  //this.next();
  if (this.ready()) {
      this.render("UpdateFeature", {
        data: function() {
          var data = ARML.data.features.findOne({_id: this.params.id});
          return data;
        }
      });
  }
});
