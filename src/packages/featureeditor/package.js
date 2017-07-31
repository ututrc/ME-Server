Package.describe({
  name: 'ututrc:featureeditor',
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
  api.versionsFrom('1.1.0.2');

  api.use('mongo');
  api.use('templating');

  api.use('iron:router@1.0.7');

  api.use('session');
  api.use('u2622:persistent-session@0.3.5');
  api.use('underscore@1.0.3');

  api.use('aldeed:collection2@2.3.1');
  api.use('aldeed:autoform@5.3.0');

  api.use('ututrc:arml-core');

  api.addFiles('templates.html');
  api.addFiles('configuration.js');
  api.addFiles('routes.js',"client");
  api.addFiles('server.js',"server");
  api.addFiles('client.js',"client");
});
