Package.describe({
  name: 'ututrc:three-editor',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  api.use('ecmascript');
  api.use('aldeed:autoform@5.6.0');
  api.use('templating');
  api.use('limemakers:three');
  api.use('ututrc:arml-core');
  api.use('aldeed:delete-button');
  api.use('reactive-var');

  api.use('iron:router@1.0.7');

  api.addFiles([
    'server.js'
  ], 'server');

  api.addFiles([
      'configuration.js',
      'templates.html',
      'styles.css',
      'client.js',
      'routes.js'
  ], 'client');


});
