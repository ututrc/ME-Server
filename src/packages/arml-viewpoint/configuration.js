packageConfig = {};
packageConfig.name = "Viewpoints";
packageConfig.route = "admin/viewpoints";
packageConfig.collection = "viewpoints";
packageConfig.mainNavigation = false;

ARML.tabs.push(packageConfig);

ARML.data.viewpoints = new orion.collection(packageConfig.collection, {
  singularName: 'viewpoint',
  pluralName: 'viewpoints',
  link: {
    title: 'Viewpoints'
  },
  tabular: {
    columns: [
      { data: "name", title: "Name"},
      { data: "application", title: "Application",
        render: function(value) {
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

ARML.schemas.viewpoints = new SimpleSchema({
  name: {
    type: String,
    label: "Name"
  },

  description: {
    type: String,
    label: "Description",
    optional: true
  },

  application: {
    type: String,
      autoform: {
        type: "hidden",
        label: false
      }
  },
  geolocation: {
    type: String,
    autoform: {
      type: 'leaflet',
      markerColor: 'green',
      markerIcon: 'eye-open',
      defaultLocation: [60.44966, 22.29479],
      zoomLevel: 18,
      tileLayerProvider: 'OpenStreetMap.Mapnik',
      doubleClickZoom: false
    },
    optional: true
  },
  position: {
    type: Vector3Schema,
    optional: true,
    label: "Virtual position"
  },
  environment: orion.attribute('hasOne', {
    label: 'Virtual environment',
    optional: true
  }, {
    titleField: 'name',
    collection: ARML.data.assets,
    publicationName: 'viewpoint-environmentasset-relation',
    additionalFields: ['_id', 'type', 'application'],
    filter: function(userId) {
      var latestApplication = Meteor.users.findOne({_id: userId}).latestApplication;
      return { application: latestApplication, files: { $not: { $elemMatch: { type: {$in: ["Target"]}}}}};
    }
  }),
  zoneid: {
    type: String,
    label: "Zone ID",
    optional: true
  },
  'sector': {
      type: [Object],
      optional: true
  },
  'sector.$.startAngle' : {
    type: Number,
    label: "Start angle",
    decimal: false,
    min: 0,
    max: 360,
    optional: false,
    defaultValue: 0
  },
  'sector.$.endAngle' : {
    type: Number,
    label: "Start angle",
    decimal: false,
    min: 0,
    max: 360,
    optional: false,
    defaultValue: 360
  },
  'sector.$.trackable' : orion.attribute('hasOne', {
    label: "Trackable",
    optional: false
  }, {
    titleField: "name",
    collection: ARML.data.assets,
    publicationName: "viewpoint-sector-trackable-relation",
    additionalFields: ['application', 'files'],
    filter: function(userId) {
      var latestApplication = Meteor.users.findOne({_id: userId}).latestApplication;
      return { application: latestApplication, files: { $elemMatch: { type: {$in: ["Target"]} } }};
    }
  })

});


ARML.data.viewpoints.allow({
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

ARML.data.viewpoints.attachSchema(ARML.schemas.viewpoints);

ReactiveTemplates.request('collections.' + packageConfig.collection + '.index', 'armlBootstrapCollectionsIndex');
