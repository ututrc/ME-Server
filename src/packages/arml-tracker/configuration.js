packageConfig = {};
packageConfig.name = "Trackers";
packageConfig.route = "admin/trackers";
packageConfig.collection = "trackers";
packageConfig.mainNavigation = false;

ARML.tabs.push(packageConfig);

ARML.data.trackers = new orion.collection(packageConfig.collection, {
  singularName: 'tracker',
  pluralName: 'trackers',
  link: {
    title: 'Trackers'
  },
  tabular: {
    columns: [
      { data: 'name', title: "Name"},
      { data: "uri", title: "Uri"},
      { data: "application", title: "Application",
        render: function(value) {
          if(value != undefined)
            return ARML.data.applications.findOne({"_id": value}).name;
        }
      }
    ]
  }
});

ARML.schemas.tracker = new SimpleSchema({
  name: {
    type: String,
    label: "Name"
  },

  uri: {
    type: String,
    label: "Uri"
  },

  application: {
    type: String,
      autoform: {
        type: "hidden",
        label: false
      }
  }
});

ARML.data.trackers.attachSchema(ARML.schemas.tracker);

ReactiveTemplates.request('collections.' + packageConfig.collection + '.index', 'armlBootstrapCollectionsIndex');
