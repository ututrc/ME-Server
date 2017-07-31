Router.route("/features/:featureID/build", function() {
  this.wait(Meteor.subscribe("applications"));
  this.wait(Meteor.subscribe("assets"));
  this.wait(Meteor.subscribe("features"));
  this.wait(Meteor.subscribe("featureassets"));
  this.wait(Meteor.subscribe("annotations"));
  this.layout("GlobalView");
  this.next();
  if (this.ready()) {
      this.render("ThreeEditor", {
        data: function() {
          var assets = ARML.data.assets.find({application: Meteor.user().latestApplication});
          var formattedAssets = [];
          assets.map(function(asset) {
            formattedAssets.push({value: asset._id, label: asset.name})
          });
          var feature = ARML.data.features.findOne({_id: this.params.featureID});
          return {
            feature: feature._id,
            assets: formattedAssets
          };
        }
      });
  }
});
