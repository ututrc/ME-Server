
AutoForm.addInputType("threeCoordinates", {
  template: "ThreeEditor",

  valueOut: function() {
    return this.context.value;
  },

  //Sanitize the context as an object
  contextAdjust: function(context) {
    return context;
  }
});

AutoForm.addInputType("threeCoordinatesComments", {
  template: "ThreeEditorComments",
  valueIsArray: true,

  valueOut: function() {
    return this.context.value;
  },

  //Sanitize the context as an object
  contextAdjust: function(context) {
    return context;
  }
});

Schema = {};
Schema.featureasset = new SimpleSchema({
    feature: {
      type: String,
      autoform: {
        type: "hidden",
        label: false
      }
    },
    asset: {
        type: String,
        label: "Asset"
    }
});
