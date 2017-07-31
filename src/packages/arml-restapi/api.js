var Api = new Restivus({
    useDefaultAuth: false,
    prettyJson: true
});

var x2js = new X2JS({
    escapeMode: true,
    arrayAccessForm: "none"
});

function cursorToIdArray(cursor) {
  var array = [];
  cursor.map(function(doc, index, cursor) {
    array.push(doc._id);
  });

  return array;
}

/***
 * Returns arml of given feature
 */
Api.addRoute('feature/:feature_id', {authRequired: false}, {
    get: function() {

        return xmlResponse(404, "Not supported");

    },
    put: function() {
      return  xmlResponse(200, "Done");
    }
});

Api.addRoute('application/:application_id', {authRequired: false}, {
  get: function() {
    var trackingResolution = "";

    /*
    * FOR LEGACY SUPPORT! REMOVE AS SOON AS LEGACY DEVICES ARE UPDATED
    */
    if(this.queryParams.platform == "ios") {
      trackingResolution = "320x240";
    }
    if(this.queryParams.platform == "android") {
      trackingResolution = "640x360";
    }

    if(this.queryParams.trackingresolution != undefined) {
      trackingResolution = this.queryParams.trackingresolution;
    }

    var applicationId = this.urlParams.application_id;

    var application  = ARML.data.applications.findOne({ _id: applicationId });

    var queryLanguage = this.queryParams.language;
    var languageToUse;
    var usingDefaultLanguage = true;
    if(queryLanguage != undefined) {

      // check if language is available in applications languages
      var found = false;
      application.languages.map(function(item) {
        if(item.short == queryLanguage) {
          found = true;
        }
      });

      // change language if found
      if(found) {
        languageToUse = queryLanguage;
        usingDefaultLanguage = false;
      }
    }

    // Get all features that have :application_id as application
    var applicationFeatures = ARML.data.features.find({ application: applicationId, enabled: true }, {sort: {name: 1}});

    if(applicationFeatures.count() === 0) {
      return xmlResponse(404, { status: "Not found" });
    }

    // most things can be found with application id
    var applicationTargets = ARML.data.assets.find({ application: applicationId, files: { $elemMatch: { type: {$in: ["Target"]} } }}).fetch();
    var applicationViewpoints = ARML.data.viewpoints.find({ application: applicationId }).fetch();
    var applicationTrackers = ARML.data.trackers.find({ application: applicationId }).fetch();

    var applicationSectors = [];

    /*
    Add all sectors from all application viewpoints to the sectors array
    Add the sector id field that is now found in the database
    */
    applicationViewpoints.map(function(viewpoint, viewpoint_index) {
      var viewpoint_id = viewpoint._id;
      viewpoint.sector.map(function (sector, sector_index) {
        sector._id = viewpoint_id + "_" + sector_index;
        applicationSectors.push(sector);
      });
    });

    var armlElements = {};

    //Application information
    armlElements.application = {name: application.name, description: application.description};

    if(application.indoormap != undefined)
      armlElements.application.indoormap = application.indoormap.url;

    /*
    Add all trackers in the application to the ARML
    Last tracker to be processed becomes the defautlTracker, basically is random
    */
    var defautlTracker;
    armlElements.trackers = {tracker: []};
    applicationTrackers.map(function(doc, index) {
      armlElements.trackers.tracker.push(armlTracker(doc));
      defautlTracker = doc;
    });

    //Add all targets from the application to ARML
    armlElements.trackables = {trackable: []};
    applicationTargets.map(function(doc, index) {
      armlElements.trackables.trackable.push(armlTrackable(doc, defautlTracker, trackingResolution));
    });

    //Add all viewpoints from the application to ARML
    armlElements.viewpoints = {viewpoint: []};
    applicationViewpoints.map(function(doc, index) {
      armlElements.viewpoints.viewpoint.push(armlViewpoint(doc));
    });

    //Add all sectors from the application to ARML
    armlElements.sectors = {sector: []};
    applicationSectors.map(function(doc, index) {
      armlElements.sectors.sector.push(armlSector(doc));
    });

    /*
    Features
    Compile a feature from all the linked data
    */
    armlElements.features = {feature: []};

    applicationFeatures.map(function(doc, index) {
      // If other than the default language asked, fetch the translated information
      if(!usingDefaultLanguage) {
        var translation = ARML.data.translations.findOne({original: doc._id, language: languageToUse});
        if(translation) {
          doc.name = translation.name;
          doc.description = translation.description;
        }
      }
      var compiledFeature = doc;

      //Get all featureAssets asigned to the feature
      var featureAssets = ARML.data.featureassets.find({feature: doc._id, editorOnly: false});
      var assetIds = [];
      var featureAssetIds = [];
      featureAssets.map(function(doc, index) {
        assetIds.push(doc.asset);
        featureAssetIds.push(doc._id);
      });

      // Get actual asset entries
      var assets = ARML.data.assets.find({ _id: {$in: assetIds} }).fetch();
      compiledFeature.assets = assets;

      //Get annotations from db
      var annotations = ARML.data.annotations.find({featureasset: {$in: featureAssetIds}}).fetch();
      if(!usingDefaultLanguage) {
        // Get translation for each annotations
        annotations.map(function(annotation) {
          var translation = ARML.data.translations.findOne({original: annotation._id, language: languageToUse});
          if(translation) {
            annotation.name = translation.name;
            annotation.description = translation.description;
          }
        });
      }

      compiledFeature.annotations = annotations;

      armlElements.features.feature.push(armlFeature(compiledFeature));
    });

    var arml = armlResponseRoot(armlElements);

    return xmlResponse(200, arml);
  }
});

Api.addRoute('serveFileByFilename/:asset_id/:filename', {authRequired: false}, {
  get: function() {
    var file = ARML.data.uploads.findOne({asset: this.urlParams.asset_id, name: this.urlParams.filename});

    if(file) {
      var fileUrl = file.url;
    // Return redirection to gridfs url
      return {
        statusCode: 302,
        headers: {
          'Content-Type': 'text/plain',
          'Location': fileUrl
        },
        body: 'Location:' + fileUrl
      }
    } else {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'text/plain',
        }
      }
    }
  }
});

Api.addRoute('serveFileByFileType/:asset_id/:filetype', {authRequired: false}, {
  get: function() {
    // Find if asset has a obj, mtl or some other type given
    var file = ARML.data.uploads.findOne({
      asset: this.urlParams.asset_id,
      fileType: this.urlParams.filetype
    });

    var fileUrl = "";

    if(file) {
      fileUrl = file.url;
    }
    // Return redirection to gridfs url
    return {
      statusCode: 302,
      headers: {
        'Content-Type': 'text/plain',
        'Location': fileUrl
      },
      body: 'Location:' + fileUrl
    }
  }
});


function getTrackersByTrackables(trackables) {
  var trackable_ids = cursorToIdArray(trackables);
  // Trackables define trackers
  var tracker_ids = [];
  trackables.map(function(doc, i, cursor) {
    tracker_ids.push(doc.tracker);
  });
  var trackers = ARML.data.trackers.find({_id: {$in: tracker_ids}});

  return trackers;
}

function xmlResponse(status, body) {
  return {
       statusCode: status,
       headers: {
         'Content-Type': 'application/xml',
         'X-Custom-Header': 'custom value'
       },
       body: x2js.json2xml_str(body)
     };
}

/***
 * Creates an object that has required properties for xml generation
 * @returns {{}}
 */
function armlResponseRoot(elements) {
    var response = {};
    response.arml = {};
    var arml = response.arml;
    response.arml._xmlns = "http://ar.utu.fi/arml";
    response.arml["_xmlns:xlink"]="http://www.w3.org/1999/xlink";
    response.arml["_xmlns:gml"]="http://www.opengis.net/gml";
    arml.arelements = elements;

    return response;
}

/***
 * Formats tracker for xml generation
 * @param tracker
 * @returns {{Tracker: {_id: (_id|{$in}|*), uri: {_xlink:href: (resultTracker.Tracker.uri|{_xlink:href}|ARML.schemas.tracker.uri|{type, label}|string)}}}}
 */
function armlTracker(doc) {
    var element = {
      _id: doc._id,
      name: doc.name,
      uri: {
          "_xlink:href": "#"+doc.uri
      }
    };

    return element;
}

/***
 * Formats sector element for xml generation
 * @param sector
 * @returns {{sector: {_id: (_id|{$in}|*), trackable: {_id: (trackable|{$in}|resultSector.sector.trackable|{_id}|*)}, gml:ArcByCenterPoint: {_gml:id: (SimpleSchema.id|{type, label}|string), _numArc: number, gml:pos: string, gml:radius: (SimpleSchema.radius|{type, decimal, label}), gml:startAngle: (SimpleSchema.startangle|{type, decimal, label, min, max}), gml:endAngle: (SimpleSchema.endangle|{type, decimal, label, min, max})}}}}
 */
function armlSector(doc) {
    var element = {
      _id: doc._id,
      trackable: {
          "_xlink:href": "#"+doc.trackable
      },
      "gml:ArcByCenterPoint": {
          "_gml:id": doc._id,
          "_numArc": 1,
          "gml:pos": "1.0 1.0",
          "gml:radius": "1",
          "gml:startAngle": doc.startAngle,
          "gml:endAngle": doc.endAngle
      }
    };

    return element;
}

/***
 * Formats viewpoint for xml generation
 * @param viewpoint
 * @returns {{ViewPoint: {_id: (_id|{$in}|*), gml:Point: {gml:pos: string}, sectors: {sector: Array}}}}
 */
function armlViewpoint(doc) {
    var element = {
      _id: doc._id,
      name: doc.name,
      sectors: { sector: []}
    };

    if(doc.geolocation) {
      element["gml:Point"] = {"gml:pos" : doc.geolocation.replace(/,/g," ")};
    }

    if(doc.position != undefined) {
      element.position = doc.position;
    }

    if(doc.environment != undefined) {
      var environmentAsset = ARML.data.assets.findOne({_id: doc.environment});
      if(environmentAsset != undefined)
        element.environment = armlAsset(environmentAsset);
    }

    if(doc.zoneid != undefined)
    {
      element.zoneid = doc.zoneid;
    }

    doc.sector.map(function(sector, i) {
      element.sectors.sector.push({"_xlink:href": "#"+sector._id});
    });

    return element;
}
/**
 * Formats trackable for xml generation
 * @param trackable
 * @returns {{trackable: {_id: (_id|{$in}|*), config: {tracker: {_xlink:href: string, src: (*|ARML.schemas.trackable.src|{type}|string)}}, size: string, gml:ArcByCenterPoint: {_xlink:href: string}}}}
 */
function armlTrackable(doc, tracker, trackingResolution) {
  var srcFile = "";

  if(trackingResolution == undefined) {
    trackingResolution = "";
  }

  if(trackingResolution.length > 0) {
    _.each(doc.files, function(elem) {
      if(elem != undefined && elem.type == "Target" && elem.quality != undefined && elem.quality.toLowerCase() == trackingResolution.toLowerCase()) {
        srcFile = elem;
      }
    });
  }

  //Try again if no platform specific file is found
  if(srcFile.length == 0) {
    _.each(doc.files, function(elem) {
      if(elem != undefined && elem.type == "Target" && (elem.quality == undefined || (elem.quality != undefined && elem.quality.toLowerCase() == ""))) {
        srcFile = elem;
      }
    });
  }

  var previewURL = "";
  if(doc.preview != undefined) {
    if(doc.preview.url != undefined) {
      previewURL = doc.preview.url;
    }
  }

  var element = {
    _id: doc._id,
    name: doc.name,
    preview: previewURL,
    config: {},
    size: "1"
  };

  if(doc.description) {
    element.description = doc.description;
  } else {
    element.description = "";
  }

  if(tracker != undefined && tracker._id != undefined) {
    element.config.tracker = {
        "_xlink:href": "#" + tracker._id,
    };

    if(srcFile && srcFile.file) {
      element.config.tracker.src = srcFile.file.url;
    }
  }

  if(doc.preview) {
    element.image = doc.preview;
  }

  return element;
}

/***
 * Checks of the given asset document has an image file set or not
*/
function assetTypeIs(doc,type) {

  var found = false;

  if(doc.files) {
    doc.files.forEach(function(file) {
      if(file != undefined && file.type.toLowerCase() == type.toLowerCase()) {
        found = true;
      }
    });
  }

  return found;
}

/***
 * Return the URL of model file set to the asset
*/
function getAssetFile(doc, type) {

  var found = "";

  if(doc.files) {
    doc.files.forEach(function(file) {
      if(file.type.toLowerCase() == type.toLowerCase()) {
        if(file.file && file.file.url)
          found = file.file.url;
      }
    });
  }

  return found;
}


/***
 * Formats feature for xml generation
 * @param feature
 * @returns {{Feature: {_id: (_id|{$in}|*), name: *, description: (*|ARML.schemas.features.description|{type, label}|description|{type}|string), Metadata: {from: string, to: string}, Anchor: {_id: (SimpleSchema.id|{type, label}|string), gml:Point: {gml:pos: string}, Model: {href: {_xlink:href: (SimpleSchema.source|{type, label}|Window|string)}}}, trackables: {trackable: Array}, assets: {asset: Array}}}}
 */
function armlFeature(doc) {
    var element =  {
      _id: doc._id,
      name: doc.name,
      description: doc.description,
      anchor: {},
      trackables: { trackable: [] },
      assets: { asset: [] },
      enabled: doc.enabled,
      annotations: { annotation: []}
    };

    if(doc.anchor) {
      element.anchor = {
        "_id": doc._id + "_anchor"
      };
      if(doc.geolocation) {
        element["gml:Point"] = {
            "gml:pos": doc.geolocation.replace(/,/g," ")
        };
      }

      var anchorAsset = ARML.data.assets.findOne({_id: doc.anchor});
      if(anchorAsset) {
          element.anchor.asset = armlAsset(anchorAsset);
      }
    }

    doc.assets.map(function(asset, i) {

      var visualAssetIndex = 0;

      if(assetTypeIs(asset,"target")) {
        var trackableElement = {
            "_xlink:href": "#"+asset._id
        };

        var featureInstance = armlFeatureAsset(doc._id, asset._id);
        _.extend(trackableElement, featureInstance);
        element.trackables.trackable.push(trackableElement);
      } else {
        var assetElement = armlAsset(asset,  doc._id + "_asset_"+visualAssetIndex);
        visualAssetIndex++;

        var featureAsset = armlFeatureAsset(doc._id, asset._id);
        _.extend(assetElement, featureAsset);
        element.assets.asset.push(assetElement);
      }
    });

    if(doc.annotations){
    doc.annotations.map(function(annotation, i){
      element.annotations.annotation.push({
        "name"  : annotation.name,
        "position": annotation.position.x + "," + annotation.position.y + "," + annotation.position.z,
        "_number": annotation.number,
        "description" : annotation.description

      });
    });
  }


    return element;
}

function armlAssetFile (assetFile) {
  return
}

function armlAsset(asset, feature_id) {
  var element = {
    "_name": asset.name
  };

  var href = "";

  if (asset.external) {
    element["_type"] = "Prefab";
    href = "#"+asset.external;
  } else {
    if(assetTypeIs(asset,"model")){
      element["_type"] = "Model";
      href = getAssetFile(asset, "model");
    } else if (assetTypeIs(asset,"image")){
      element["_type"] = "Image";
      href = getAssetFile(asset, "image");
    }
  }

  element.href = {
      "_xlink:href": href
  };

  if(feature_id) {
    element._id = feature_id;
  }

  if(asset.description) {
    element.description = asset.description;
  } else {
    element.description = "";
  }

  return element;
}

function armlFeatureAsset(featureID, assetID) {
  var element = {};

  var doc = ARML.data.featureassets.findOne({ feature: featureID, asset: assetID, editorOnly: false });

  if(doc) {

    var transformSource = doc;
    if(doc.globalTransform) {
      var assetElement = ARML.data.assets.findOne({_id: assetID});
      if(assetElement != undefined && assetElement.rotation != undefined && assetElement.position != undefined && assetElement.scale != undefined) {
        transformSource = assetElement;
      }
    }

    element.transform = {
      position: {
        x: transformSource.position.x,
        y: transformSource.position.y,
        z: transformSource.position.z
      },
      rotation: {
        x: transformSource.rotation.x,
        y: transformSource.rotation.y,
        z: transformSource.rotation.z
      },
      scale: {
        x: transformSource.scale.x,
        y: transformSource.scale.y,
        z: transformSource.scale.z
      }
    };
  }

  if(doc.description) {
    element.description = doc.description;
  } else {
    doc.description = "";
  }

  return element;
}

Api.addRoute('tags/', {authRequired: false}, {
  get: function() {
    var annotations = ARML.data.annotations.find({}).fetch();
    var tags = [];
    if(annotations) {
      annotations.map(function(annotation, annotation_index) {
        if(annotation.annotations) {
          annotation.annotations.map(function(annotationAnnotation, annotationAnnotation_index) {
            annotationAnnotation.tags.map(function(tag, tag_index) {
              tags.push(tag);
            });
          });
        }
      });
    }

    return uniq_fast(tags);
  }
});

// From http://stackoverflow.com/questions/9229645/remove-duplicates-from-javascript-array
// Removes duplicates from array
function uniq_fast(a) {
    var seen = {};
    var out = [];
    var len = a.length;
    var j = 0;
    for(var i = 0; i < len; i++) {
         var item = a[i];
         if(seen[item] !== 1) {
               seen[item] = 1;
               out[j++] = item;
         }
    }
    return out;
}
