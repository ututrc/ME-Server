Template.ApplicationListView.onCreated(function () {
  this.subscribe(packageConfig.collection);
});

Template.ApplicationListView.helpers({
  applications: function() {
    return ARML.data.applications.find({ users: { $in: [Meteor.userId()] } });
  }
});

Template.ApplicationsGridView.helpers({
  applications: function() {
    return ARML.data.applications.find({ users: { $in: [Meteor.userId()] } });
  }
});

Template.ApplicationListView.events({
  "click #select-application-list a.list-group-item": function (event, template) {
    var appId = event.target.dataset.appid;

    Session.setPersistent("currentApplication",appId);
    Meteor.call("setCurrentApplication", appId);
  }
});
