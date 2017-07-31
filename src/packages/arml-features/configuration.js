packageConfig = {};
packageConfig.name = "Features";
packageConfig.route = "features";
packageConfig.collection = "features";
packageConfig.mainNavigation = true;

ARML.tabs.push(packageConfig);

ARML.data.features = new orion.collection(packageConfig.collection, {
  singularName: 'feature',
  pluralName: 'features',
  link: {
    title: 'Features'
  },
  tabular: {
    columns: [
      { data: "name", title: "Name" },
      { data: "enabled", title: "Enabled"}
    ]
  }
});

ARML.schemas.features = new SimpleSchema({
  name: {
    type: String,
    label: "Name"
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

  application: {
    type: String,
      autoform: {
        type: "hidden",
        label: false
      }
  },

  anchor: orion.attribute('hasOne', {
    label: 'Anchor asset',
    optional: true
  }, {
    titleField: 'name',
    collection: ARML.data.assets,
    publicationName: 'feature-anchorasset-relation',
    additionalFields: ['_id', 'type', 'application'],
    filter: function(userId) {
      var latestApplication = Meteor.users.findOne({_id: userId}).latestApplication;
      return { application: latestApplication, files: { $not: { $elemMatch: { type: {$in: ["Target"]}}}}};
    }
  }),

  geolocation: {
    type: String,
    autoform: {
      type: 'leaflet',
      markerColor: 'blue',
      markerIcon: 'asterisk',
      defaultLocation: [60.44966, 22.29479],
      zoomLevel: 18,
      tileLayerProvider: 'OpenStreetMap.Mapnik',
      doubleClickZoom: false
    },
    optional: true
  },

  enabled: {
    type: Boolean,
    label: "Enabled"
  }
});

ARML.data.features.attachSchema(ARML.schemas.features);

ReactiveTemplates.request('collections.' + packageConfig.collection + '.index', 'armlBootstrapCollectionsIndex');

InsertFeatureSchema = new SimpleSchema({
  name: {
    type: String,
    label: "Nimi"
  },
  application: {
    type: String
  },

  description: orion.attribute('summernote', {
    label: 'Kuvaus',
    optional: true
  }),

  tags: orion.attribute('tags', {
    label: 'Tags',
    optional: true,
    autoform: {
      tagsSource: "/api/tags/"
    }
  }),

  anchor: orion.attribute('hasOne', {
    label: 'Kuvake',
    optional: true
  }, {
    titleField: 'name',
    collection: ARML.data.assets,
    publicationName: 'wizard-feature-anchorasset-relation',
    additionalFields: ['_id', 'type', 'application'],
    filter: function(userId) {
      var latestApplication = Meteor.users.findOne({_id: userId}).latestApplication;
      return { application: latestApplication, files: { $not: { $elemMatch: { type: {$in: ["Target"]}}}}};
    }
  }),
  target : orion.attribute('hasOne', {
    label: "Kohdennusmalli",
    optional: false
  }, {
    titleField: "name",
    collection: ARML.data.assets,
    publicationName: "wizard-viewpoint-sector-trackable-relation",
    additionalFields: ['application', 'files'],
    filter: function(userId) {
      var latestApplication = Meteor.users.findOne({_id: userId}).latestApplication;
      return { application: latestApplication, files: { $elemMatch: { type: {$in: ["Target"]} } }};
    }
  }),
  geolocation: {
    type: String,
    autoform: {
      type: 'leaflet',
      markerColor: 'blue',
      markerIcon: 'asterisk',
      defaultLocation: [60.44966, 22.29479],
      zoomLevel: 18,
      tileLayerProvider: 'OpenStreetMap.Mapnik',
      doubleClickZoom: false,
      label: "Geolokaatio"
    },
    optional: true
  },

  zoneid: {
    type: String,
    label: 'Alue',
    optional: true
  },

  enabled: {
    type: Boolean,
    label: "Käytössä"
  }
});


ARML.data.features.allow({
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

function currentApplication() {
  if(Meteor.isClient){
    return Session.get("currentApplication");
  }
  return "global";
}
