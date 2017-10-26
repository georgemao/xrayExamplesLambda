'use strict'
//process.env['AWS_XRAY_DAEMON_ADDRESS'] = '127.0.0.1:3000';

var AWSXRay = require('aws-xray-sdk-core');
var AWS  = AWSXRay.captureAWS(require('aws-sdk'));
AWS.config.update({region:'us-west-2'});
var s3 = new AWS.S3();
var docClient = new AWS.DynamoDB.DocumentClient();

// This is a workaround that is needed for running in SAM Local because it does not generate the _X_AMZN_TRACE_ID
// See: http://docs.aws.amazon.com/lambda/latest/dg/lambda-x-ray.html#lambda-x-ray-env-variables
var segment = new AWSXRay.Segment("999999", "1-59bc04e6-7e2f175630c09bcb8fb154f6");
var ns = AWSXRay.getNamespace();
AWSXRay.setSegment(segment);

exports.handler = function (event, context, callback) {   
    var segment = AWSXRay.getSegment();
     
    console.log(JSON.stringify(segment));

    console.log(process.env.X_AMZN_TRACE_ID);
    console.log(process.env.TESTVAR);
    
    // Try to upload to a bucket that does not exist - will Fail
    params ={
        Bucket: 'doesnotexistblsucket',
        Key:'key',
        Body:'mybody'
    };

    s3.putObject(params, function(err, data){

    });

    // Upload to a bucket that exists - will Succeded
    var params ={
        Bucket: 'awsgeorge',
        Key:'key',
        Body:'mybody'
    };
    
    s3.putObject(params, function(err, data){
        
    });

    
    // Performa a DDB Scan - will succeed
    params = {
        TableName:'Buckets'
    };
    
    docClient.scan(params, function(err, data) {
      if (err) {
        console.log("Error", err);
      } else {
        data.Items.forEach(function(element, index, array) {
          console.log(element);
        });
      }
    });

    

    callback(null, {"body" : "testbody"} )
}