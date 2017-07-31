Router.route('/applications', function() {
    this.wait(Meteor.subscribe("applications"));

    if (this.ready()) {
      this.layout("GlobalView");
      this.render("ApplicationsGridView");
    }
});

Router.route('/applications/:id/build', function() {
    this.wait(Meteor.subscribe("applications"));

    if (this.ready()) {
      var currentApp = this.params.id;

      Meteor.users.update(Meteor.userId(), {
        $set: {
          latestApplication: currentApp
        }
      });
      Session.setPersistent("currentApplication",currentApp);

      Router.go("/");

    }
});

Router.route("/applications/:id/edit", function() {
  this.wait(Meteor.subscribe("applications"));
  this.layout("GlobalView");
  //this.next();
  if (this.ready()) {
      this.render("UpdateApplication", {
        data: function() {
          var data = ARML.data.applications.findOne({_id: this.params.id});
          return data;
        }
      });
  }
});
