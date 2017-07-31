var container;
var camera, scene, renderer, control;
var sceneFeatureAssets;

var annotationMaterial, annotationGeometry;

var featureID = "";

Template.ThreeEditor.onCreated(function(){
  featureID = Router.current().params.featureID;
  sceneFeatureAssets = ARML.data.featureassets.find({feature: featureID});

  (function(){
    var initializing = true;
    sceneFeatureAssets.observe({
      removed: function(oldDoc) {
        if(!initializing){
          var object = scene.getObjectByName(oldDoc._id);
          if(object.userData.id == Session.get("activeObject"))
            SetActiveObject(null);

          scene.remove( object );

        }
      },
      added: function(doc) {
        if(!initializing){
          initFeatureAsset(doc);
        }
      }
    });
    initializing = false;
  })();

});

Template.ThreeEditor.onRendered(function() {

  Session.set("editMode","feature");
  Session.set("activeAnnotation","null");


  $('#SceneInspector a').click(function (e) {
    e.preventDefault();
    $(this).tab('show');
  })

  var featureCursor = ARML.data.features.find({_id: featureID});

  String.prototype.format = function () {

    var str = this;
    for ( var i = 0; i < arguments.length; i ++ ) {

      str = str.replace( '{' + i + '}', arguments[ i ] );

    }
    return str;

  };

  init();
  animate();
  initObjects();

  function init() {
    //geometry = new THREE.BoxGeometry( 100, 100, 100 );

    container = document.createElement( 'div' );
    document.getElementById("threeEditor").appendChild( container );
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 10000 );

    camera.position.z = 1000;
    scene.add( camera );

    annotationMaterial = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    annotationGeometry = new THREE.SphereGeometry( 15, 16, 16 );

    scene.add( new THREE.AmbientLight( 0xffffff ) );
    /*var light = new THREE.SpotLight( 0xffffff, 1.5 );
    light.position.set( 0, 1500, 200 );
    light.castShadow = false;
    scene.add( light );*/

    var directionalLight = new THREE.DirectionalLight( 0xffeedd );
				directionalLight.position.set( 0, 0, 1 ).normalize();
				scene.add( directionalLight );

    var planeGeometry = new THREE.PlaneGeometry( 2000, 2000 );
    planeGeometry.rotateX( - Math.PI / 2 );
    var planeMaterial = new THREE.ShadowMaterial();
    planeMaterial.opacity = 0.2;

    var plane = new THREE.Mesh( planeGeometry, planeMaterial );
    plane.position.y = -200;
    plane.receiveShadow = true;
    scene.add( plane );

    var helper = new THREE.GridHelper( 1000, 100 );
    helper.position.y = - 199;
    helper.material.opacity = 0.25;
    helper.material.transparent = true;
    scene.add( helper );

    var axis = new THREE.AxisHelper();
    axis.position.set( -500, -500, -500 );
    scene.add( axis );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setClearColor( 0xf0f0f0 );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( $("#threeContainer").width(), $("#threeContainer").height() );
    renderer.shadowMap.enabled = true;
    container.appendChild( renderer.domElement );


    // Controls

    control = new THREE.TransformControls( camera, renderer.domElement );
		control.addEventListener( 'change', render );
    control.addEventListener( 'change', saveAssetTransforms);
		scene.add( control );

    window.addEventListener( 'resize', onWindowResize, false );

    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.damping = 0.2;
    controls.addEventListener( 'change', render );
    controls.addEventListener( 'start', function() {

      cancelHideTransorm();

    } );

    controls.addEventListener( 'end', function() {

      delayHideTransform();

    } );

    var hiding;

    function delayHideTransform() {

      cancelHideTransorm();

    }


    function cancelHideTransorm() {

      if ( hiding ) clearTimeout( hiding );
    }
  }

  function onWindowResize() {

    //camera.aspect = $("#threeContainer").width() / $("#threeContainer").height();

    renderer.setSize( $("#threeContainer").width(), $("#threeContainer").height() );
    camera.updateProjectionMatrix();

    render();

  }

  function render() {

    control.update();
    renderer.render( scene, camera );

  }

  function animate() {

    control.update();
    requestAnimationFrame( animate );
    render();

  }

  function attachControls(event){

    var mouse = new THREE.Vector3();
    mouse.x = ( event.offsetX / renderer.domElement.clientWidth ) * 2 - 1;
		mouse.y = - ( event.offsetY  / renderer.domElement.clientHeight ) * 2 + 1;
    mouse.z = 0.5;

    var raycaster = new THREE.Raycaster();
		raycaster.setFromCamera( mouse, camera );
		var intersects = raycaster.intersectObjects( scene.children, true );

    //Search all intersect for an object that has the right properties to be an feature asset
    intersects.forEach(function(hit) {
      if ( hit.object.parent != null && hit.object.parent.parent != null) {
        var target = hit.object.parent.parent;
        if(target.userData.id != null) {
          if(target != null) {
            SetActiveObject(target.userData.id);
            return;
          }
        }
        if(target.type == "Sprite") {
          if(target != null) {
            Session.set("activeAnnotation",target.name);
            Session.set("editMode", "annotation");
            return;
          }
        }
      }
    });

  }

  function initObjects(){
    THREE.Loader.Handlers.add( /\.dds$/i, new THREE.DDSLoader() );

    sceneFeatureAssets.forEach(function(featureasset){
      if(featureasset != null)
        initFeatureAsset(featureasset);
    });
  }

  // Events
  $(container).dblclick(function(event) {
    addAnnotation(event);
    Session.set("editMode","annotation");
    saveAssetTransforms();
  });

  $(container).click(function(event) {
    attachControls(event);
  });

});

function initFeatureAsset(featureasset) {
  var asset = ARML.data.assets.findOne({_id: featureasset.asset});
  if(asset) {
    console.log("Initializing asset "+asset.name);

    var modelFile;
    _.each(asset.files, function(doc) {
      if(doc.type=="Model") {
        modelFile = doc;
      }
    });

    //Load the object content
    if(modelFile) {
      console.log("Loading model file "+modelFile.file.url + " from asset id "+asset._id);

      var mtlLoader = new THREE.MTLLoader();

      mtlLoader.setBaseUrl('/api/serveFileByFilename/' + asset._id + '/');
      mtlLoader.load('/api/serveFileByFileType/' + asset._id + '/mtl' , function(materials){

        var objLoader = new THREE.OBJLoader();

        materials.preload();
        objLoader.setMaterials(materials);

        objLoader.load(asset, '/api/serveFileByFileType/' + asset._id + '/obj',
          //onSuccess
          function(object, asset){
            //Create the 3D object

            console.log("Asset loaded: " + asset.name);

            group = new THREE.Object3D();

            group.name = featureasset._id;

            group.userData.assetid = asset._id;
            group.userData.featureid = featureasset.feature;
            group.userData.id = featureasset._id;

            //Make OBJ import compatible with Unity units
            //object.rotation.set(-90,90,90);
            object.scale.set(100,100,100);
            object.updateMatrix();

            if(featureasset) {
              group.position.x = featureasset.position.x;
              group.position.y = featureasset.position.y;
              group.position.z = featureasset.position.z;

              group.rotation.x = featureasset.rotation.x;
              group.rotation.y = featureasset.rotation.y;
              group.rotation.z = featureasset.rotation.z;

              group.scale.x = featureasset.scale.x;
              group.scale.y = featureasset.scale.y;
              group.scale.z = featureasset.scale.z;
              group.updateMatrix();
            }

            mesh = object;
            group.add(mesh);
            scene.add(group);

            initFeatureAssetAnnotations(featureasset);


            if(Session.get("activeObject") != null) {
              SetActiveObject(Session.get("activeObject"));
            }

          },
          //onProgress
          function ( xhr ) {
            if ( xhr.lengthComputable ) {
              var percentComplete = xhr.loaded / xhr.total * 100;
              console.log( Math.round(percentComplete, 2) + '% downloaded' );
            }
          },
          //onError
          function ( xhr ) { }
        );

      });

    }
  }
}

function addAnnotation(event) {

  camera.updateMatrixWorld();
  var mouse = new THREE.Vector3();
  mouse.x = ( event.offsetX / renderer.domElement.clientWidth ) * 2 - 1;
  mouse.y = - ( event.offsetY  / renderer.domElement.clientHeight ) * 2 + 1;
  mouse.z = 0.5;

  var raycaster = new THREE.Raycaster();
  raycaster.setFromCamera( mouse, camera );

  var intersects = raycaster.intersectObject( GetActiveObject(), true );

  var featureAssetIds = [];
  sceneFeatureAssets.map(function(doc, index) {
    featureAssetIds.push(doc._id);
  });
  var existingAnnotations = ARML.data.annotations.find({featureasset: {$in: featureAssetIds}});

  var particle;
  var annotationObject = new THREE.Mesh(annotationGeometry, annotationMaterial);
  annotationObject.name = existingAnnotations.count()+1;
  if ( intersects.length > 0 ) {

    var index = 0;
    _.forEach(intersects, function(obj){
      if(obj.object.type == "Sprite"){
        index += 1;
      }
    });

    if(intersects[index].object.type !== "Sprite"){

      var msg = "empty";

      var textSprite = makeTextSprite(annotationObject.name);

      var worldPos = intersects[index].point;
      var activeObject = GetActiveObject();
      activeObject.worldToLocal(intersects[ index ].point);
      textSprite.position.copy( intersects[ index ].point );
      annotationObject.position.copy( intersects[ index ].point);

      activeObject.add(textSprite);
      activeObject.add(annotationObject);

      var parentFeatureAssetID = intersects[index].object.parent.parent.userData.id;
      if(parentFeatureAssetID) {
        var insertedID = ARML.data.annotations.insert( {
          featureasset: parentFeatureAssetID,
          number: annotationObject.name,
          name: "Name",
          description: "Description",
          position: {
            x: intersects[index].point.x,
            y: intersects[index].point.y,
            z: intersects[index].point.z
          }
        } );

        if(insertedID != undefined) {
          Session.set("activeAnnotation", insertedID);
          Session.set("editMode", "annotation");
          $('#SceneInspector a[href="#annotations"]').tab('show');
          annotationObject.name = insertedID+"_mesh";
          textSprite.name = insertedID;
        }
      }

    }
  }
}

function initFeatureAssetAnnotations(featureasset){

  var annotations = ARML.data.annotations.find({featureasset: featureasset._id});

  var asset = null;

  scene.children.forEach(function(a){
    if(a.userData != undefined && a.userData.id == featureasset._id) {
      asset = a;
    }
  });

  if(asset != null) {

    asset.children.forEach(function (child) {
      if(child.type=="Sprite" || child.type=="Mesh")
        asset.remove(child);
    });

    annotations.forEach(function (annotation) {
      var annotationObject = new THREE.Mesh(annotationGeometry, annotationMaterial);
      annotationObject.name = annotation._id+"_mesh";

      var textSprite = makeTextSprite(annotation.number);
      textSprite.name = annotation._id;

      var pos = new THREE.Vector3(annotation.position.x, annotation.position.y, annotation.position.z);

      asset.add(annotationObject);
      asset.add(textSprite);

      annotationObject.position.copy(pos);
      textSprite.position.copy(pos);
    });
  }
}

function makeTextSprite( message, parameters )
{
  if ( parameters === undefined ) parameters = {};

  var fontface = parameters.hasOwnProperty("fontface") ?
    parameters.fontface : "Arial";

  var fontsize = parameters.hasOwnProperty("fontsize") ?
    parameters.fontsize : 60;

  var borderThickness = parameters.hasOwnProperty("borderThickness") ?
    parameters.borderThickness : 4;

  var borderColor = parameters.hasOwnProperty("borderColor") ?
    parameters.borderColor : { r:0, g:0, b:0, a:1.0 };

  var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
    parameters.backgroundColor : { r:255, g:255, b:255, a:1.0 };

  //var spriteAlignment = parameters.hasOwnProperty("alignment") ?
  //	parameters["alignment"] : THREE.SpriteAlignment.topLeft;

  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  context.font = "Bold " + fontsize + "px " + fontface;

  // get size data (height depends only on font size)
  var metrics = context.measureText( message );
  var textWidth = metrics.width;

    // canvas.width = 128;
    // canvas.height = 64;
  // background color
  context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + "," + backgroundColor.b + "," + backgroundColor.a + ")";
  // border color
  context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + "," + borderColor.b + "," + borderColor.a + ")";

  context.lineWidth = borderThickness;
  roundRect(context, borderThickness/2, borderThickness/2, textWidth + borderThickness, fontsize * 1.2 + borderThickness, 1);
  // 1.4 is extra height factor for text below baseline: g,j,p,q.

  // text color
  context.fillStyle = "rgba(0, 0, 0, 1.0)";

  context.fillText( message, borderThickness, fontsize + borderThickness);

  // canvas contents will be used for a texture
  var texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;

  var spriteMaterial = new THREE.SpriteMaterial(
    { map: texture } );
  var sprite = new THREE.Sprite( spriteMaterial );
  sprite.scale.set(75,40,1.0);
  return sprite;
}

function roundRect(ctx, x, y, w, h, r)
{
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.lineTo(x+w-r, y);
  ctx.quadraticCurveTo(x+w, y, x+w, y+r);
  ctx.lineTo(x+w, y+h-r);
  ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
  ctx.lineTo(x+r, y+h);
  ctx.quadraticCurveTo(x, y+h, x, y+h-r);
  ctx.lineTo(x, y+r);
  ctx.quadraticCurveTo(x, y, x+r, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function isInArray(value, array) {
  return array.indexOf(value) > -1;
}

function saveAssetTransforms(){
  var activeObject = GetActiveObject();

  if(activeObject != null) {
    ARML.data.featureassets.update({_id: activeObject.userData.id}, {$set: {
      position: {x: activeObject.position.x, y: activeObject.position.y, z: activeObject.position.z},
      rotation: {x: activeObject.rotation._x, y: activeObject.rotation._y, z:  activeObject.rotation._z},
      scale: {x: activeObject.scale.x , y: activeObject.scale.y, z: activeObject.scale.z}}
    });
  }
}

Template.ThreeEditor.onDestroyed(function() {
  // TODO: Tuhoa kaikki luotu sisältö ja eventit
  $(container).remove();
  camera = null;
  scene = null;
  renderer = null;
  control = null;
  cancelAnimationFrame(this.id);

});

function GetActiveObject() {

  var found = null;

  scene.children.forEach(function(asset) {
    if(asset.userData != undefined && asset.userData.id == Session.get("activeObject")) {
      found = asset;
    }
  });

  return found;
}

function SetActiveObject(featureAssetId) {

  if(featureAssetId == null) {
    control.enabled = false;
    Session.set("activeObject",null);
  } else {

    if(featureAssetId != Session.get("activeObject")) {
      Session.set("activeAnnotation",null);
      Session.set("editMode","featureasset");

      scene.children.forEach(function(asset) {
        if(asset.userData != undefined && asset.userData.id == featureAssetId) {

          Session.set("activeObject",featureAssetId);
          $('#SceneInspector a[href="#assets"]').tab('show');
          control.enabled = true;
          control.attach(asset);

          var observeAnnotations = ARML.data.annotations.find({featureasset: featureAssetId});

          (function(){
            var initializing = true;

            observeAnnotations.observe({

              removed: function(oldDoc){
                if(!initializing){

                  setTimeout(function(){
                    Meteor.call('editor.updateNumbers', featureID, (err, res) => {
                      if (err) {
                        alert(err);
                      } else {
                        // alert("err");
                      }
                    });
                    var featureAssetObject = ARML.data.featureassets.findOne({_id: oldDoc.featureasset});

                    if(featureAssetObject)
                      initFeatureAssetAnnotations(featureAssetObject);
                  }, 0);

                }
              }
            });
            initializing = false;
          })();

        }
      });
    }
  }

}

Template.ThreeEditor.helpers({
  currentAnnotations: function() {
    //if(Session.get("activeObject") != null) {
      return ARML.data.annotations.find({featureasset: Session.get("activeObject")});
    /*} else {
      return null;
    }*/
  },
  currentFeature: function() {
    return ARML.data.features.findOne({_id: featureID});
  },
  featureInformation: function() {
    var feature = ARML.data.features.findOne({_id: featureID});

    var info = {name: feature.name};
    info.featureassets = sceneFeatureAssets.count();

    var featureAssetIds = [];
    sceneFeatureAssets.map(function(doc, index) {
      featureAssetIds.push(doc._id);
    });
    var sceneAnnotations = ARML.data.annotations.find({featureasset: {$in: featureAssetIds}});

    info.annotations = sceneAnnotations.count();
    return info;
  },
  activeFeatureAsset: function() {
    return ARML.data.featureassets.findOne({_id: Session.get("activeObject")});
  },
  activeAnnotationObject: function() {
    return ARML.data.annotations.findOne({_id: Session.get("activeAnnotation")});
  },
  activeAnnotation: function() {
    return ARML.data.featureassets.findOne({_id: Session.get("activeAnnotation")});
  },
  currentFeatureAssets: function() {
    featureassets = [];

    var originals = ARML.data.featureassets.find({feature: featureID});

    originals.forEach(function(fa){
      var asset = ARML.data.assets.findOne({_id: fa.asset});
      if(asset) {
        fa.assetname = asset.name;
        if(fa.name == undefined || fa.name.length == 0) {
          fa.name = asset.name;
        }
        featureassets.push(fa);
      }
    });

    return featureassets;
  },
  activeObject: function() {
    return Session.get("activeObject");
  },
  editModeIs: function(mode) {
    return mode == Session.get("editMode");
  },
  controlSnap: function() {
    Tracker.autorun(function () {
      if(control != undefined) {
        return control.translationSnap != null;
      }
    });
    return false;
  },
  controlSpaceLocal: function() {
    if(control != undefined) {
      return (control.space === "local");
    }

    return false;
  }
});

Template.ThreeEditor.events({
  'click #threeMove': function (event, instance) {
      control.setMode( "translate" );
  },
  'click #threeScale': function (event, instance) {
      control.setMode( "scale" );
  },
  'click #threeRotate': function (event, instance) {
      control.setMode( "rotate" );
  },
  'click #threeSpace': function (event, instance) {
      control.setSpace( control.space === "local" ? "world" : "local" );
  },
  'click #threeSnap': function (event, instance) {
      if(control.translationSnap == null) {
        control.setTranslationSnap( 100 );
        control.setRotationSnap( THREE.Math.degToRad( 15 ) );
      } else {
          control.setTranslationSnap(null);
          control.setRotationSnap( THREE.Math.degToRad( null ) );
      }
  },
  'click .modeSelector': function (event, instance) {
    switch ($(event.target).attr("href")) {
      case "#feature":
        Session.set("editMode","feature");
        break;
      case "#assets":
        Session.set("editMode","featureasset");
        break;
      case "#annotations":
        Session.set("editMode","annotation");
        break;
      default:

    }
  }
});

Template.FeatureAssetListItem.events({
  'click .activeElementSelector': function (event, instance) {
    SetActiveObject(instance.data._id);
  }
});

Template.AnnotationListItem.events({
  'click .activeAnnotationSelector': function (event, instance) {
    Session.set("activeAnnotation",instance.data._id);
    Session.set("editMode","annotation");
  }
});

Template.CreateFeatureAsset.helpers({
  featureAssetAutoformSchema: function() {
    return Schema.featureasset;
  }
});

/*Template.CreateFeatureAsset.events({
  'submit .newFeatureAsset': function(event, instance) {
    const data = {
      asset: event.target.asset.value,
      feature: featureID
    };
    Meteor.call('insertFeatureAsset', data);
  },
});*/

Template.FeatureAssetListItem.helpers({
  active: function(){
     return Session.get("activeObject") == Template.currentData()._id;
  }
});

Template.AnnotationListItem.helpers({
  active: function(){
     return Session.get("activeAnnotation") == Template.currentData()._id;
  }
});
