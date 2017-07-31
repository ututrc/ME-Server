packageConfig = {};
packageConfig.name = "Translations";
packageConfig.route = "translations";
packageConfig.collection = "translations";
packageConfig.mainNavigation = false;

ARML.tabs.push(packageConfig);

ARML.data.translations = new Mongo.Collection('translations');

Schema = {};
Schema.translation = new SimpleSchema({
    original: {
      type: String,
      autoform: {
        type: "hidden",
        label: false
      }
    },
    name: {
        type: String,
        label: "Name"
    },
    description: orion.attribute('summernote', {
      label: 'Description'
    }),
    language: {
        type: String,
        label: "Language"
    }
});

Schema.existingTranslation = new SimpleSchema({
    _id: {
      type: String,
      autoform: {
        type: "hidden",
        label: false
      }
    },
    original: {
      type: String,
      autoform: {
        type: "hidden",
        label: false
      }
    },
    name: {
        type: String,
        label: "Name"
    },
    description: orion.attribute('summernote', {
      label: 'Description'
    }),
    language: {
        type: String,
        label: "Language"
    }
});



ARML.data.translations.allow({
  update: function (userId, doc) {
    if(Meteor.userId())
      return true;

    return false;
  },
  insert: function (userId, doc) {
    if(Meteor.userId())
      return true;

    return false;
  }
});
