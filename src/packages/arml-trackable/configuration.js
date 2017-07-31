packageConfig = {};
packageConfig.name = "Trackables";
packageConfig.route = "admin/trackables";
packageConfig.collection = "trackables";

ARML.tabs.push(packageConfig);

ARML.data.trackables = new orion.collection(packageConfig.collection, {
  singularName: 'trackable',
  pluralName: 'trackables',
  link: {
    title: 'Trackables'
  },
  tabular: {
    columns: [
      { data: "name", title: "Name"},
      { data: "src", title: "Src"},
      { data: "application", title: "Application",
        render: function(value) {
          if(value != undefined)
            return ARML.data.applications.findOne({"_id": value}).name;
        }
      }
    ]
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

ARML.schemas.trackable = new SimpleSchema({
  name: {
    type: String
  },

  src: {
    type: String
  },

  application: {
    type: String,
      autoform: {
        type: "hidden",
        label: false
      }
  },

  tracker: orion.attribute('hasOne', {
    label: "Tracker"
  }, {
    titleField: "name",
    collection: ARML.data.trackers,
    publicationName: "trackable-tracker-relation",
    additionalFields: ['application'],
    filter: function(userId) {
      var latestApplication = Meteor.users.findOne({_id: userId}).latestApplication;
      return { application: latestApplication};
    }
  }),

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

  file: orion.attribute('file', {
    label: "File",
    optional: true
  }),

  thumbnail: orion.attribute('file', {
    label: "Thumbnail",
    optional: true
  }),

  surfaceAsset: orion.attribute('hasOne', {
    label: '3D Editor Visualization surface',
    optional: true
  }, {
    titleField: 'source',
    collection: ARML.data.assets,
    publicationName: 'trackable-asset-relation',
    additionalFields: ['_id', 'type', 'application'],
    filter: function(userId) {
      var latestApplication = Meteor.users.findOne({_id: userId}).latestApplication;
      return { application: latestApplication, type: "Model"};
    }
  })
});

ARML.data.trackables.attachSchema(ARML.schemas.trackable);

ReactiveTemplates.request('collections.' + packageConfig.collection + '.index', 'armlBootstrapCollectionsIndex');
