packageConfig = {};
packageConfig.name = "Feature Asset";
packageConfig.route = "admin/featureassets";
packageConfig.collection = "featureassets";
packageConfig.mainNavigation = false;

ARML.tabs.push(packageConfig);

ARML.data.featureassets = new orion.collection(packageConfig.collection, {
  singularName: 'feature asset',
  pluralName: 'feature assets',
  link: {
    title: 'Feature Assets'
  },
  tabular: {
    columns: [
      { data: "name", title: "Name" },
      orion.attributeColumn('hasOne', 'feature', 'Feature', { orderable: true }),
      orion.attributeColumn('hasOne', 'asset', 'Asset', { orderable: true })
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

ARML.schemas.featureassets = new SimpleSchema({
  feature: orion.attribute('hasOne', {
    label: "Feature"
  }, {
    titleField: "name",
    collection: ARML.data.features,
    publicationName: "featureasset-feature-relation",
    additionalFields: ['_id', 'name', 'application'],
    filter: function(userId) {
      var latestApplication = Meteor.users.findOne({_id: userId}).latestApplication;
      return { application: latestApplication};
    }
  }),
  asset: orion.attribute('hasOne', {
    label: "Asset"
  }, {
    titleField: "name",
    collection: ARML.data.assets,
    publicationName: "featureasset-asset-relation",
    additionalFields: ['_id', 'name', 'application'],
    filter: function(userId) {
      var latestApplication = Meteor.users.findOne({_id: userId}).latestApplication;
      return { application: latestApplication};
    }
  }),
  name: {
    type: String,
    label: "Name"
  },
  description: orion.attribute('summernote', {
    label: 'Description',
    optional: true
  }),
  application: {
    type: String,
      autoform: {
        type: "hidden",
        label: false
      }
  },
  editorOnly: {
    type: Boolean,
    defaultValue: false,
    optional: true,
    label: "Use only in Content Editor"
  },
  globalTransform: {
    type: Boolean,
    defaultValue: false,
    optional: true,
    label: "Use global asset transform"
  },
  position: {
    type: Vector3Schema,
    optional: false
  },
  rotation: {
    type: Vector3Schema,
    optional: false
  },
  scale: {
    type: Vector3Schema,
    optional: false
  }
});

ARML.data.featureassets.allow({
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

ARML.data.featureassets.attachSchema(ARML.schemas.featureassets);

ReactiveTemplates.request('collections.' + packageConfig.collection + '.index', 'armlBootstrapCollectionsIndex');
