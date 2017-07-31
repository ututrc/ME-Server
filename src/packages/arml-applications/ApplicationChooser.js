var subscription;

Template.ApplicationChooser.onCreated(function () {
  subscription = this.subscribe(packageConfig.collection);
});


Template.ApplicationChooser.helpers({
  applications: function() {
    return ARML.data.applications.find({ users: { $in: [Meteor.userId()] } });
  }
});

Template.ApplicationChooser.rendered = function() {
  this.$('[data-toggle="dropdown"]').dropdown();
}

Template.applicationItem.helpers({
  selected: function() {
    if(this._id == Meteor.user().latestApplication) {
      return "selected";
    }
    else {
      return "";
    }
  }
});

Template.ApplicationChooser.onRendered(function() {

    var usersLatestApp = Meteor.user().latestApplication;

    if(usersLatestApp != null) {
      var app = ARML.data.applications.findOne({_id: usersLatestApp});

      if(app) {
        setNavBarColor(app.color);
      }
    }
    else {
      // If there is only one app set it to latestApplication
      if(ARML.data.applications.find({ users: { $in: [Meteor.userId()] } }).count() === 1) {
        Meteor.users.update(Meteor.userId(), {
          $set: {
            latestApplication: ARML.data.applications.findOne({ users: { $in: [Meteor.userId()] } })._id
          }
        });
        // and do regular stuff
        var app = ARML.data.applications.findOne({_id: usersLatestApp});
        setNavBarColor(app.color);

      }
    }

})

Template.ApplicationChooser.events({
  "change #Applications_select": function(event, template){
    // Get value of selected: $(event.currentTarget).find(':selected').val()
    var currentApp = $(event.currentTarget).find(':selected').val();

    Meteor.users.update(Meteor.userId(), {
      $set: {
        latestApplication: currentApp
      }
    });

    //var app = ARML.data.applications.findOne({_id: currentApp});
    //setNavBarColor(app.color);
  },
});

function setNavBarColor(appColor) {
  var color = hexToRgb(appColor);
  var colorStringRGBA = 'rgba(' + color.r + ", " + color.g + ", " + color.b + ', 0.25)';
  //$('.navbar').css('background-color', colorStringRGBA);
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}
