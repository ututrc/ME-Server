Router.route("/assets/create", function() {
  this.wait(Meteor.subscribe("applications"));
  this.wait(Meteor.subscribe("assets"));
  this.layout("GlobalView");
  if (this.ready()) {
      this.render("assetWizard");
  }
});

Router.route("/assets", function() {
  this.wait(Meteor.subscribe("applications"));
  this.wait(Meteor.subscribe("assets"));
  this.layout("GlobalView");
  if (this.ready()) {
      this.render("AssetsGridView");
  }
});

Router.route("/assets/:id/edit", function() {
  this.wait(Meteor.subscribe("applications"));
  this.wait(Meteor.subscribe("assets"));
  this.layout("GlobalView");
  //this.next();
  if (this.ready()) {
      this.render("UpdateAssetView", {
        data: function() {
          var asset = ARML.data.assets.findOne({_id: this.params.id});
          return asset;
        }
      });
  }
});
