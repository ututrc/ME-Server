Package.describe({
  name: 'ututrc:arml-restapi',
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
  api.use('nimble:restivus@0.8.4');

  api.use('twbs:bootstrap@3.3.5');
  api.use('fortawesome:fontawesome@4.4.0');

  api.use([
    'orionjs:accounts@1.6.0',
    'orionjs:attributes@1.6.0',
    'orionjs:base@1.6.0',
    'orionjs:bootstrap@1.5.0',
    'orionjs:collections@1.6.0',
    'orionjs:config@1.6.0',
    'orionjs:core@1.6.0',
    'orionjs:dictionary@1.6.0',
    'orionjs:file-attribute@1.6.0',
    'orionjs:filesystem@1.6.0',
    'orionjs:lang-en@1.6.0',
    'orionjs:relationships@1.6.0',
    'orionjs:summernote@1.6.0'
  ]);

  api.use('ututrc:arml-core');
  api.use('ututrc:arml-x2js');

  api.addFiles('configuration.js');
  api.addFiles('templates.html');
  api.addFiles('api.js',"server");
  api.addFiles('client.js', 'client');
  api.addFiles('routes.js')


});
