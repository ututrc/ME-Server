Router.route("/translations", function() {
  this.wait(Meteor.subscribe("applications"));
  this.wait(Meteor.subscribe("features"));
  this.wait(Meteor.subscribe("translations"));
  this.wait(Meteor.subscribe("annotations"));
  this.layout("GlobalView");
  if (this.ready()) {
      this.render("translations");
  }
});

Router.route("/translations/create/:original", function() {
  this.wait(Meteor.subscribe("applications"));
  this.wait(Meteor.subscribe("features"));
  this.wait(Meteor.subscribe("translations"));
  this.wait(Meteor.subscribe("annotations"));
  this.layout("GlobalView");
  if (this.ready()) {
      this.render("createTranslation", {
        data: function() {
          var feature = ARML.data.features.findOne({_id: this.params.original});
          if(feature == undefined) {
            var featureId = ARML.data.annotations.findOne({_id: this.params.original}).feature;
            feature = ARML.data.features.findOne({_id: featureId});
          }
          var application = ARML.data.applications.findOne({_id: feature.application });
          var translations = ARML.data.translations.find({original: this.params.original}).fetch();

          var availableLanguages = getAvailableLanguages(application, translations);

          return {
            original: this.params.original,
            feature: ARML.data.features.findOne({_id: this.params.original}),
            languages: availableLanguages
           };
        }
      });
  }
});

Router.route("/translations/edit/:original/:_id", function() {
  this.wait(Meteor.subscribe("applications"));
  this.wait(Meteor.subscribe("features"));
  this.wait(Meteor.subscribe("translations"));
  this.wait(Meteor.subscribe("annotations"));

  this.layout("GlobalView");
  if (this.ready()) {
      this.render("editTranslation", {
        data: function() {
          var feature = ARML.data.features.findOne({_id: this.params.original});
          if(feature == undefined) {
            var featureId = ARML.data.annotations.findOne({_id: this.params.original}).feature;
            feature = ARML.data.features.findOne({_id: featureId});
          }
          var application = ARML.data.applications.findOne({_id: feature.application });
          var translations = ARML.data.translations.find({original: this.params.original}).fetch();

          var availableLanguages = getAvailableLanguages(application, translations);
          var translation = ARML.data.translations.findOne({_id: this.params._id });

          return {
            original: this.params.original,
            feature: ARML.data.features.findOne({_id: this.params.original}),
            languages: availableLanguages,
            translation: ARML.data.translations.findOne({_id: this.params._id })
           };
        }
      });
  }
});

Router.route("/translations/feature/:_id", function() {
  this.wait(Meteor.subscribe("applications"));
  this.wait(Meteor.subscribe("features"));
  this.wait(Meteor.subscribe("translations"));
  this.wait(Meteor.subscribe("featureassets"));
  this.wait(Meteor.subscribe("annotations"));
  this.layout("GlobalView");
  if (this.ready()) {
      this.render("featureTranslations", {
        data: function() {
          var feature = ARML.data.features.findOne({_id: this.params._id});

          if(feature == undefined) {
            var annotation = ARML.data.annotations.findOne({_id: this.params._id});
            if(annotation != undefined) {
              feature = ARML.data.features.findOne({_id: annotation.feature});
            }
          }

          var featureID = feature._id;

          var translations = ARML.data.translations.find({original: featureID});
          // Annotations that refer to feature
          var featureAssets = ARML.data.featureassets.find({feature: featureID});
          var featureAssetIds = [];
          featureAssets.map(function(doc, index) {
            featureAssetIds.push(doc._id);
          });
          var annotations = ARML.data.annotations.find({featureasset: {$in: featureAssetIds}}).fetch();          // Translations for each annotation
          annotations.map(function(annotation) {
            annotation.translations = ARML.data.translations.find({original: annotation._id}).fetch();
          });

          return {
            feature: feature,
            translations: translations,
            annotations: annotations
          };
        }
      });
  }
});

Router.route("/translations/annotation/:_id", function() {
  this.wait(Meteor.subscribe("applications"));
  this.wait(Meteor.subscribe("features"));
  this.wait(Meteor.subscribe("translations"));
  this.wait(Meteor.subscribe("annotations"));
  this.layout("GlobalView");
  if (this.ready()) {
      this.render("annotationTranslations", {
        data: function() {
          var annotation = ARML.data.annotations.findOne({_id: this.params._id});
          var translations = ARML.data.translations.find({original: this.params._id});
          return {
            annotation: annotation,
            translations: translations
          };
        }
      });
  }
});

// Spaghetti bolognese
function getAvailableLanguages(application, translations) {
  var availableLanguages = application.languages;
  var usedLanguages = [];
  availableLanguages.map(function(language) {
    translations.map(function(translation) {
      if(language.short === translation.language) {
        usedLanguages.push(language);
      }
    });
  });

  var languages = [];
  availableLanguages.map(function(language) {
    var found = false;
    usedLanguages.map(function(usedLanguage) {
      if(language === usedLanguage) {
        found = true;
      }
    });
    // If not found
    if(found !== true) {
      languages.push(language);
    }
  });

  // Format languages to correct object type: {label: language.name, value: language.short}
  var formattedLanguages = [];
  languages.map(function(language) {
    formattedLanguages.push({ label: language.name, value: language.short });
  });

  return formattedLanguages;
}
