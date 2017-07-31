Meteor.methods({
  insertTranslation: function(doc){
    ARML.data.translations.insert(doc);
  },

  autoformTranslationSubmit: function(doc) {
    // Important server-side check for security and data integrity
    check(doc, Schema.translation);

    this.unblock(); // ?
    ARML.data.translations.insert(doc);
  },

  translationUpdate: function(doc) {
    check(doc, Schema.existingTranslation);

    this.unblock();
    ARML.data.translations.update(doc._id, {
      $set: doc
    });
  },

  translationRemove: function(id) {
    var original = ARML.data.translations.findOne({_id: id}).original;
    ARML.data.translations.remove({_id: id});
    //Router.go("/translations/feature/"+original);
    return original;
  }
});

Meteor.publish('translations', function() {
  return ARML.data.translations.find({},{sort: ["_id", "asc"] });
});
