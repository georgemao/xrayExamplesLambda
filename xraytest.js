// This example shows a poorly written piece of code. There is no error handling and always returns success.
// Xray is enabled and tracing all calls. We can use Xray to identify the errors very effectively

'use strict'
var AWSXRay = require('aws-xray-sdk-core');
var AWS  = AWSXRay.captureAWS(require('aws-sdk'));
var s3 = new AWS.S3();
var docClient = new AWS.DynamoDB.DocumentClient();


exports.handler = function (event, context, callback) {
    //console.log("ENV: "+process.env.AWS_XRAY_DAEMON_ADDRESS);
    
    // Try to upload to a bucket that does not exist - will Fail
    AWSXRay.captureAsyncFunc('Put to doesnotexistbucket', function(subsegment) {
      var params ={
        Bucket: 'doesnotexistbucket',
        Key:'key',
        Body:'mybody'
      };

      s3.putObject(params, function(err, data){
        if(err){
          subsegment.addAnnotation('error', 'error');
          subsegment.addMetadata('error', err.stack);
        }
        
        subsegment.close();
      });
      
    });
    
    // Upload to a bucket that exists - IAM role does not provide permissions to -- will fail
    AWSXRay.captureAsyncFunc('Put to awsgeorge', function(subsegment) {
      var params ={
          Bucket: 'awsgeorge',
          Key:'key',
          Body:'mybody'
      };
      
      s3.putObject(params, function(err, data){
        if(err){
          subsegment.addAnnotation('error', 'error');
          subsegment.addMetadata('error', err.stack);
        }
        subsegment.close();
      });
    });
    
    // Perform a DDB Scan - will succeed
    var params = {
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
    
    callback(null, {"body" : "success!!!"} )
}
