var mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
  })
  .then(() => {
    console.log("Connected to Mongoose ");
  })
  .catch(err => {
    console.log("Mongoose Error: ", err);
  });

  const MongooseSchema = mongoose.Schema;

  const urlSchema = new MongooseSchema({
    idx: { type: Number},
    url: { type: String, unique: true}
  })

  const URL = mongoose.model('URL', urlSchema, 'Urls');

  const getSize = function(){
    URL.countDocuments(function(err, count){
      if(err) return { error: err }
      else return { value: count };
    });
  }

  const add = function(url, done){
    let result = getSize();
    var index = -1;
    if(result && result.value) index = result.value + 1;
    else index = 1;

    let record = {idx: index, url: url}
    //if(count !== undefined && count.hasOwnProperty('count')){
    URL.create(record, function(err, data){
     
      if(err) return done(err);
      return done(null, data);
    })
  }

  const getById = function(id, done){
    URL.find({ idx: id }, function(err, record){
      if(err) return done(err);
      else return done(null, record[0].url);
    })
  }

  const getByURL = function(url, done){
    URL.find({ url: url }, function(err, record){
      if(err) return done(err);
      else return done(null, record[0].url);
    })
  }

  exports.add = add;
  exports.getById = getById;
  exports.getByURL = getByURL;