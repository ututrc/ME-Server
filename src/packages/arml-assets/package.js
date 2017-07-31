Package.describe({
    name: 'ututrc:arml-assets',
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

    // api.use('udondan:jszip');

    api.use([
      'mongo',
      'templating',
      'iron:router@1.0.12',
      'underscore@1.0.4',
      'twbs:bootstrap@3.3.5',
      'fortawesome:fontawesome@4.4.0',
      'orionjs:accounts@1.6.0',
      'orionjs:attributes@1.6.0',
      'orionjs:base@1.6.0',
      'orionjs:bootstrap@1.5.0',
      'orionjs:collections@1.6.0',
      'orionjs:config@1.6.0',
      'orionjs:core@1.6.0',
      'orionjs:dictionary@1.6.0',
      'orionjs:file-attribute@1.6.0',
      'orionjs:image-attribute@1.6.0',
      'orionjs:filesystem@1.6.0',
      'orionjs:lang-en@1.6.0',
      'vsivsi:orion-file-collection',
      'arml-jszip',
      'arml-jszip-utils'
    ]);

    api.use('webapp');

    api.use('ututrc:arml-core');

    api.addFiles('templates.html');
    api.addFiles('styles.css');

    api.addFiles('configuration.js');
    api.addFiles('routes.js',"client");
    api.addFiles('server.js',"server");
    api.addFiles('client.js',"client");
});
