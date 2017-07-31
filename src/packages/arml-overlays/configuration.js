packageConfig = {};
packageConfig.name = "Overlays";
packageConfig.route = "admin/overlays";
packageConfig.collection = "overlays";
packageConfig.mainNavigation = false;

ARML.tabs.push(packageConfig);

ARML.data.overlays = new orion.collection(packageConfig.collection, {
  singularName: 'overlay',
  pluralName: 'overlays',
  link: {
    title: 'Overlays'
  },
  tabular: {
    columns: [
      { data: "name", title: "Name" },
      { data: "application", title: "Application",
        render: function(value) {
          return ARML.data.applications.findOne({"_id": value}).name;
        }
      }
    ]
  }
});

ARML.schemas.overlays = new SimpleSchema({
  name: {
    type: String,
    label: "Name"
  },

  application: {
    type: String,
      autoform: {
        type: "hidden",
        label: false
      }
  },

  file: orion.attribute('file', {
    label: "File",
    optional: true
  }),

  northWest: {
    type: String,
    autoform: {
      type: 'leaflet'
    }
  },

  southEast: {
    type: String,
    autoform: {
      type: 'leaflet'
    }
  }

});

ARML.data.overlays.attachSchema(ARML.schemas.overlays);

ReactiveTemplates.request('collections.' + packageConfig.collection + '.index', 'armlBootstrapCollectionsIndex');
