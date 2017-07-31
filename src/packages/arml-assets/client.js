AutoForm.addHooks('orionBootstrapCollectionsCreateForm', {
  before: {
    insert: function(doc) {
      this.result(doc);
    },
  }
});

AutoForm.addHooks('orionBootstrapCollectionsUpdateForm', {
  before: {
    update: function(doc) {
      return doc;
    },
  }
});

var hooksObject = {
  before: {
    method: function(doc) {
      doc.application = Session.get("currentApplication");
      this.result(doc);
    }
  },
  onSuccess: function(operation, result, template) {
    Router.go("/assets");
  }
};

Template.registerHelper("assetInsertSchema", assetInsertSchema);

AutoForm.addHooks(['insertAssetForm','updateAssetForm'], hooksObject);

Template.AssetsGridView.helpers({
  assets: function() {
    var assets = ARML.data.assets.find({application: Meteor.user().latestApplication},{sort: ["_id", "asc"] }).fetch();
    return assets;
  }
});

Template.orionAttributesFileUpload.events({
  'change input': function(e) {
  }
});
