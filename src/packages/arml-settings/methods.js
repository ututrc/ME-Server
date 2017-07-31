Meteor.methods({
  resetApplicationSettings:function() {
     ARML.settings.remove({});

     ARML.settings.insert({name: "serverUrl", description: "Server URL", value: "localhost:8080", default: "localhost:8080", type:"url"});
  },
  updateApplicationSetting: function(_settingId, _settingValue) {

    var settingValue = _settingValue.trim();

    var originalSetting = ARML.settings.findOne({_id: _settingId});

    if(originalSetting) {
      switch (originalSetting.type) {
        case "url":
          check(settingValue, String);
          if(settingValue.substring(0,7) != "http://" && settingValue.substring(0,8) != "https://") {
            settingValue = "http://"+settingValue;
          }
          if(settingValue.slice(-1) != "/") {
            settingValue = settingValue + "/";
          }
          break;
        default:

      }

      ARML.settings.update({_id: _settingId}, {$set: {value: settingValue}});
    }
  }
});

Meteor.publish("application-settings", function () {
  return ARML.settings.find({}); //
});

ARML.settings.allow({
  update: function(userId, doc, fieldnames){
    return (Meteor.user() && fieldnames.length == 1 && fieldnames[0] == "value");
  }
});
