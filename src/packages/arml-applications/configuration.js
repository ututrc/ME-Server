packageConfig = {};
packageConfig.name = "Applications";
packageConfig.route = "admin/applications";
packageConfig.collection = "applications";
packageConfig.mainNavigation = false;

ARML.tabs.push(packageConfig);

ARML.data.applications = new orion.collection(packageConfig.collection, {
  singularName: 'application',
  pluralName: 'applications',
  link: {
    title: 'Applications'
  },
  tabular: {
    columns: [
      { data: "name", title: "Name" },
      { data: "description", title: "Description" },
      { data: "color", title: "Color",
        render: function(value) {
          return "<button type='button' class='btn btn-sm' style='background-color: " + value + "'>Color</button>";
        }
      }
    ]
  }
});

ARML.data.applications.attachSchema(new SimpleSchema({
  name: {
    type: String
  },
  description: orion.attribute('summernote', {
    label: 'Description'
  }),

  color: {
    type: String,
    autoform: {
      type: "bootstrap-minicolors"
    }
  },

  users: orion.attribute('hasMany', {
    label: 'Users'
  }, {
    titleField: "profile.name",
    collection: Meteor.users,
    publicationName: 'application-user-relation'
  }),

  indoormap: orion.attribute('file', {
    label: "Indoor map",
    optional: true
  }),

  "languages.$.short": {
    type: String
  },

  "languages.$.name": {
    type: String
  }

}));

ReactiveTemplates.set('adminSidebar', 'armlBootstrapSidebar');
