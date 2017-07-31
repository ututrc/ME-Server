packageConfig = {};
packageConfig.name = "Annotations";
packageConfig.route = "admin/annotations";
packageConfig.collection = "annotations";
packageConfig.mainNavigation = false;

ARML.tabs.push(packageConfig);

ARML.data.annotations = new orion.collection(packageConfig.collection, {
  singularName: 'annotation',
  pluralName: 'annotations',
  link: {
    title: 'Annotations'
  },
  tabular: {
    columns: [
      { data: "featureasset", title: "Feature Asset"},
      { data: "name", title: "Name"},
      { data: "application", title: "Application",
        render: function(value) {
          if(value != undefined)
            return ARML.data.applications.findOne({"_id": value}).name;
        }
      }
    ]
  }
});

ARML.data.annotations.allow({
  update: function (userId, doc) {
    if(Meteor.userId())
      return true;

    return false;
  },
  insert: function (userId, doc) {
    if(Meteor.userId())
      return true;

    return false;
  },
  remove: function (userId, doc) {
    if(Meteor.userId())
      return true;

    return false;
  }
});

Vector3Schema = new SimpleSchema({
  x: {
    type: Number,
    defaultValue: 0,
    decimal: true
  },
  y: {
    type: Number,
    defaultValue: 0,
    decimal: true
  },
  z: {
    type: Number,
    defaultValue: 0,
    decimal: true
  }
});

ARML.schemas.annotations = new SimpleSchema({
  featureasset: orion.attribute('hasOne', {
    label: "FeatureAsset",
    optional: false
  }, {
    titleField: "name",
    collection: ARML.data.featureassets,
    publicationName: "annotation-featureasset-relation",
    additionalFields: ['application'],
    filter: function(userId) {
      var latestApplication = Meteor.users.findOne({_id: userId}).latestApplication;
      return { application: latestApplication};
    }
  }),
  number: {
    type: Number,
    min: 1
  },
  name: {
    type: String
  },
  description: orion.attribute('summernote', {
    label: 'Description',
    optional: true
  }),
  tags: orion.attribute('tags', {
    label: 'Tags',
    optional: true,
    autoform: {
      tagsSource: "/api/tags/"
    }
  }),
  externalurl: {
    type: String,
    label: "External URL",
    optional: true
  },
  position: {
    type: Vector3Schema,
      autoform: {
        label: false
      }
  }
});

ARML.data.annotations.attachSchema(ARML.schemas.annotations);
function currentApplication() {
  if(Meteor.isClient){
    return Session.get("currentApplication");
  }
  return "global";
}
