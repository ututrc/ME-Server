Template.orionBootstrapSidebar.onRendered(function() {
  this.autorun(function() {
    var depend = orion.links._collection.find().fetch();
    $('.orion-links a[data-toggle="collapse"]').collapse();
  });
});

AutoForm.addHooks('orionBootstrapCollectionsCreateForm', {
  before: {
    insert: function(doc) {
      doc.application = Meteor.user().latestApplication;
      this.result(doc);
    },
  }
});

AutoForm.addHooks('orionBootstrapCollectionsUpdateForm', {
  before: {
    update: function(doc) {
      doc.$set.application = Meteor.user().latestApplication;
      return doc;
    }
  }
});

// For armlBootstrapCollectionsIndex ----->

// Selector for filtering admin-index view
Template.armlBootstrapCollectionsIndex.helpers({
  selector: function() {
    return { application: Meteor.user().latestApplication };
  }
});

// Copy-pasted from orionjs sourcecode
Template.armlBootstrapCollectionsIndex.events({
  'click tr': function(event) {
    if (!$(event.target).is('td')) return;
    var dataTable = $(event.target).closest('table').DataTable();
    var rowData = dataTable.row(event.currentTarget).data();
    var collection = rowData._collection();
    if (rowData) {
      if (rowData.canShowUpdate()) {
        var path = collection.updatePath(rowData);
        RouterLayer.go(path);
      }
    }
  }
});

// Copy-pasted from orionjs sourcecode
Template.armlBootstrapCollectionsIndex.onRendered(function() {
  this.autorun(function () {
    RouterLayer.isActiveRoute('');
    Session.set('armlBootstrapCollectionsIndex_showTable', false);
    Meteor.defer(function () {
      Session.set('armlBootstrapCollectionsIndex_showTable', true);
    });
  });
})

// Copy-pasted from orionjs sourcecode
Template.armlBootstrapCollectionsIndex.helpers({
  showTable: function () {
    return Session.get('armlBootstrapCollectionsIndex_showTable');
  }
});

// <--- armlBootstrapCollectionsIndex
