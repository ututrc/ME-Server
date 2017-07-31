Options.set('forbidClientAccountCreation', false);

/*Accounts.onCreateUser((options, user) => {

  // Catch profile (for some reason it will be lost otherwise...)
  user.profile = options.profile;
  // Added custom fields
  user.latestApplication = null;
  return user;
});*/

Meteor.publish('userData', function() {
  if(!this.userId) return null;
  return Meteor.users.find({_id: this.userId},
    {fields: {'latestApplication': 1}});
});

Meteor.users.allow({
  update: function(userId, docs, fields, modifier) {
    return true;
  }
});
