Template.registerHelper("currentApplication", function(argument){
  return Session.get("currentApplication");
});

Template.registerHelper("notAdmin", function(){
  return (window.location.pathname.indexOf("/admin/") == -1);
});

Template.registerHelper("applicationName", function() {
  var currentApp = ARML.data.applications.findOne({ _id: Session.get("currentApplication") });
  if(currentApp) {
    return currentApp.name;
  }

  return "";
});

Template.mainNavigation.rendered = function(){
  this.$('[data-toggle="dropdown"]').dropdown();
}

Template.GlobalView.rendered = function(){
  this.$('[data-toggle="dropdown"]').dropdown();
}

Template.mainNavigation.helpers({
  tabs: function(){

    var tabs = [];

    _.forEach(ARML.tabs, function(tab) {
      if(tab.mainNavigation == true)
        tabs.push(tab);
    });

     return tabs;
  }
});

Tracker.autorun(function () {
    Meteor.subscribe("userData");
});

Options.set('forbidClientAccountCreation', false);
orion.config.add('SERVER_URL', 'server');
