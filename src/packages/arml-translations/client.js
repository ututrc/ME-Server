Template.translations.events({
  'submit .newTranslation': function(event, instance) {
    const data = {
      language: event.target.language.value,
      name: event.target.name.value,
      description: event.target.description.value
    };
    Meteor.call('insertTranslation', data);
  },
});

Template.editTranslation.events({
  'click .deleteTranslation': function(event, instance) {
    Meteor.call('translationRemove', Template.currentData().translation._id, function(error, result) {
      if(error) {
        console.log('error', error);
      }
      else {
        Router.go("/translations/feature/"+result);
      }
    })
  }
});

Template.featureItemClear.events({
  'click .featureItem': function(event, instance) {
    Router.go("/translations/feature/" + Template.currentData()._id);
  }
});

Template.annotationItemClear.events({
  'click .annotationItem': function(event, instance) {
    Router.go("/translations/annotation/" + Template.currentData()._id);
  }
});

Template.listFeatures.helpers({
  features: function() {
    var features = ARML.data.features.find({application: Meteor.user().latestApplication},{sort: ["_id", "asc"] }).fetch();
    features.map(function(feature) {
      feature.translations = ARML.data.translations.find({ original: feature._id },{sort: ["_id", "asc"] }).fetch();
    });
    return features;
  }
});

Template.featureTranslations.helpers({
  featureAnnotations: function(featureID) {
    var featureAssets = ARML.data.featureassets.find({feature: featureID});
    var featureAssetIds = [];
    featureAssets.map(function(doc, index) {
      featureAssetIds.push(doc._id);
    });
    var annotations = ARML.data.annotations.find({featureasset: {$in: featureAssetIds}}).fetch();
    annotations.map(function(annotation) {
      annotation.translations = ARML.data.translations.find({ original: annotation._id },{sort: ["_id", "asc"] }).fetch();
    });
    return annotations;
  }
});

Template.createTranslation.helpers({
  translationAutoformSchema: function() {
    return Schema.translation;
  }
});

Template.editTranslation.helpers({
  translationAutoformSchema: function() {
    return Schema.existingTranslation;
  }
});

var hooksObject = {
  onSuccess: function(formType, result) {
    Router.go("/translations/feature/"+this.currentDoc.original);
  }
};

AutoForm.hooks({
  translationAutoform: hooksObject
});
