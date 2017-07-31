packageConfig = {};
packageConfig.name = "Assets";
packageConfig.route = "assets";
packageConfig.collection = "assets";
packageConfig.mainNavigation = true;

ARML.tabs.push(packageConfig);

ARML.data.assets = new orion.collection(packageConfig.collection, {
  singularName: 'asset',
  pluralName: 'assets',
  link: {
    title: 'Assets'
  },
  tabular: {
    columns: [
      { data: "name", title: "Name" },
      { data: "files", title: "Type",
        render: function(value) {
          var types = "";
          var availableMainTypes = ["Target", "Model", "Image"];
          if(value != undefined) {
            for (var i in value) {
              for (var t in availableMainTypes) {
                if(value[i] != undefined && value[i].type != undefined) {
                  if(value[i].type.includes(availableMainTypes[t]) && !types.includes(availableMainTypes[t])) {
                    if(types.length > 0)
                      types+=", ";

                    types += availableMainTypes[t];
                  }
                }
              }
            }

          }
          if(types.length == 0) {
            types = "N/A";
          }
          return types;
        }
      },
      { data: "external", title: "External" }
    ]
  }
});

ARML.data.assets.allow({
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
    if(Meteor.userId()) {
      var linkedFeatureAssets = ARML.data.featureassets.find({asset: doc._id});
      if(linkedFeatureAssets.count() == 0)
        return true;
    }

    return false;
  }
});

assetContentSchema = new SimpleSchema({
  file: orion.attribute('file', {
    label: "File",
    optional: true
  }),
  type: {
    type: String,
    allowedValues: ["Image", "Model", "Target"]
  },
  quality: {
    type: String,
    optional: true
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

assetsSchema = new SimpleSchema({
  name: {
    type: String,
    label: "Name"
  },
  description: orion.attribute('summernote', {
    label: 'Description',
    optional: true
  }),
  preview: orion.attribute('image', {
    label: "Preview",
    optional: true
  }),
  files: {
    type: Array,
    optional: true
  },
  "files.$": {
    type: assetContentSchema,
    optional: true
  },
  external: {
    type: String,
    optional: true,
    label: "External URI"
  },
  position: {
    type: Vector3Schema,
    optional: true
  },
  rotation: {
    type: Vector3Schema,
    optional: true
  },
  scale: {
    type: Vector3Schema,
    optional: true
  },
  application: {
    type: String,
    autoform: {
      type: "hidden",
      label: false
    }
  }

});

assetInsertSchema = new SimpleSchema({
  name: {
    type: String,
    label: "Name"
  },
  preview: orion.attribute('image', {
    label: "Preview",
    optional: true
  }),
  files: {
    type: Array,
    optional: true
  },
  "files.$": {
    type: assetContentSchema,
    optional: true
  },
  application: {
    type: String,
    autoform: {
      type: "hidden",
      label: false
    }
  }

});

ARML.schemas.assets = assetsSchema;

ARML.data.assets.attachSchema(ARML.schemas.assets);

// Uploads
ARML.data.uploads = new Mongo.Collection("uploads");
ARML.data.uploads.allow({
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
// Need for schema?

ReactiveTemplates.request('collections.' + packageConfig.collection + '.index', 'armlBootstrapCollectionsIndex');

function currentApplication() {
  if(Meteor.isClient){
    return Session.get("currentApplication");
  }
  return "global";
}

// // Filesystem storage for unzipped uploads
// Uploads = new FS.Collection("uploads", {
//   stores: [new FS.Store.FileSystem("uploads", {path: "~/uploads"})]
// });
// Uploads.allow({
//   'insert': function() {
//     // TODO: do some authentication
//     return true;
//   }
// });
