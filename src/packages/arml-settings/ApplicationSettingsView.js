// Write your package code here!

Template.ApplicationSettingsView.onCreated(function() {
  Meteor.subscribe("application-settings");
});

Template.ApplicationSettingsView.helpers({
  applicationSettingsList: function(){
     return ARML.settings.find({});
  }
});


Template.ApplicationSettingsResetView.events({
  "click button#resetSettings": function(event, template){
    Meteor.call("resetApplicationSettings");
    Router.go("/settings");
  },
  "click button#upgradeDatabase": function(event, template){
    Meteor.call("upgradeDatabase");
    Router.go("/settings");
  }
});

Template.ApplicationSettingsListItem.events({
  "click button": function(event, template) {
    var settingId= event.target.dataset.settingid;
    var settingValue = event.target.dataset.settingdefault;
    Meteor.call("updateApplicationSetting", settingId, settingValue);
  }
});
