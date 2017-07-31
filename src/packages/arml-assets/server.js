Meteor.publish(packageConfig.collection, function() {
  return ARML.data.assets.find({},{sort: ["_id", "asc"] });
});

Meteor.methods({
  InsertAsset: function (doc)  {
    var asset = {
      name: doc.name,
      preview: doc.preview,
      application: doc.application,
      files: doc.files,
      external: ""
    };

    ARML.data.assets.insert(asset);
  }
});
var db = MongoInternals.defaultRemoteCollectionDriver().mongo.db;
var GridStore = MongoInternals.NpmModule.GridStore;

WebApp.connectHandlers.use('/assetZipUpload',function(req,res){
    var start = Date.now();
    var file = new GridStore(db,'tiedostonimi on itse keksitty','w');

    file.open(function(error,gs){
        file.stream(true); //true will close the file automatically once piping finishes

        file.on('error',function(e){console.log("error", e)});
        file.on('end',function(){
            res.end(); //send end respone
            console.log('Finish uploading, time taken: ' + Date.now() - start);
        });

        req.pipe(file);
    });
});

ARML.data.assets.after.insert(function(userId, doc) {
  if(doc.files != undefined)
    UnzipAssetFiles(doc);
});

ARML.data.assets.after.update(function(userId, doc) {
  if(doc.files != undefined)
    UnzipAssetFiles(doc);
});

function UnzipAssetFiles(asset) {
  FS.debug = true;
  asset.files.map(function(file) {
    if(file.file != undefined && getFileTypeFromString
      (orion.filesystem.collection.findOne({_id: file.file.fileId}).name) == "zip") {

      var orionFileCollectionId = orion.filesystem.collection.findOne({_id: file.file.fileId}).meta.gridFS_id;

        // If there is a upload that has originalZipUrl from file just uploaded, zip has already been unzipped
        if(ARML.data.uploads.find({originalZipUrl: file.file.url}).count() == 0) {

        var readStream = orionFileCollection.findOneStream({_id: new Meteor.Collection.ObjectID(orionFileCollectionId) });
        var bufferParts = [];
        var bufferLength = 0;
        readStream.on('data', function(chunk) {
          bufferParts.push(chunk);
          bufferLength += chunk.length;
        });

        readStream.on('end', function() {
          var body = new Buffer(bufferLength);
          var bodyPos = 0;
          for (var i=0; i < bufferParts.length; i++) {
              bufferParts[i].copy(body, bodyPos, 0, bufferParts[i].length);
              bodyPos += bufferParts[i].length;
          }

          JSZip.loadAsync(body)
          .then(function(zip) {
            for(var key in zip.files) {
              if(zip.files.hasOwnProperty(key)) {
                var filename = zip.files[key].name;

                // Spaghetti magic code ahead.
                // Explanation can be found here: http://stackoverflow.com/questions/32912459/promises-pass-additional-parameters-to-then-chain

                // Let's store some variables we'll be needing later to tempObject and pass it to function that get's called when async operation is ready
                var tempObject = {assetId: asset._id, filename: filename, fileUrl: file.file.url};
                zip.file(zip.files[key].name).async("nodebuffer").then(handleAsyncData.bind(null, tempObject));
              }
            }
          });
        });
      }
    }
  });
}

function handleAsyncData(tempObject, data) {
  console.log("async" + tempObject.filename);
  var upsertStream = orionFileCollection.upsertStream({
    filename: tempObject.filename
  }, function(error, upserted) {
    if(!error) {
      console.log("WRITING FILETYPE:" + getFileTypeFromString(upserted.filename));
      ARML.data.uploads.insert({
        name: upserted.filename,
        fileType: getFileTypeFromString(upserted.filename),
        url: "/gridfs/data/id/" + upserted._id,
        asset: tempObject.assetId,
        size: upserted.length,
        originalZipUrl: tempObject.fileUrl
      });
    }
  });
  // Write the data
  upsertStream.write(data, function(error) {
    console.log("writing");
    upsertStream.end();
    upsertStream = null;
  });
}

function getFileTypeFromString(filename) {
  var temp = filename.split(".");
  if(temp.length == 0 || temp == undefined) return "no type"; // no type found
  else return temp[temp.length - 1]; // return last item
}
