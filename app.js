'use strict';

// Require objects.
const express  = require('express');
const app      = express();
const aws      = require('aws-sdk');

const config   = require('./config.js');
const queueUrl = {};
const receipt  = {};

// Load your AWS credentials and try to instantiate the object.
// aws.config.loadFromPath(__dirname + '/config.json');
aws.config.region = config.region;

// Instantiate SQS.
const sqs = new aws.SQS();

// Creating a queue.
app.get('/create/:queueName', function (req, res) {
    const params = {
        QueueName: req.params.queueName
    };

    sqs.createQueue(params, function(err, data) {
        if(err) return res.json({'app_message': 'Error on createQueue', err, params});

        queueUrl[req.params.queueName] = data.queueUrl;
        res.send(data);
    });
});

// Listing our queues.
app.get('/list/:queueName', function (req, res) {
    sqs.listQueues(function(err, data) {
        if(err) return res.send(err);

        res.send(data);
    });
});

// Sending a message.
// NOTE: Here we need to populate the queue url you want to send to.
// That variable is indicated at the top of app.js.
app.get('/send/:queueName', function (req, res) {
    const params = {
        MessageBody: req.query.m,
        QueueUrl: queueUrl[queueName],
        DelaySeconds: 0
    };

    sqs.sendMessage(params, function(err, data) {
        if(err) return res.send(err);


        res.send(data);
    });
});

// Receive a message.
// NOTE: This is a great long polling example. You would want to perform
// this action on some sort of job server so that you can process these
// records. In this example I'm just showing you how to make the call.
// It will then put the message "in flight" and I won't be able to 
// reach that message again until that visibility timeout is done.
app.get('/receive/:queueName', function (req, res) {
    const params = {
        QueueUrl: queueUrl[queueName],
        VisibilityTimeout: 600 // 10 min wait time for anyone else to process.
    };

    sqs.receiveMessage(params, function(err, data) {
        if(err) return res.send(err);

        res.send(data);
    });
});

// Deleting a message.
app.get('/delete/:queueName', function (req, res) {
    const params = {
        QueueUrl: queueUrl[queueName],
        ReceiptHandle: receipt
    };

    sqs.deleteMessage(params, function(err, data) {
        if(err) return res.send(err);

        res.send(data);
    });
});

// Purging the entire queue.
app.get('/purge/:queueName', function (req, res) {
    const params = {
        QueueUrl: queueUrl[queueName],
    };

    sqs.purgeQueue(params, function(err, data) {
        if(err) return res.send(err);

        res.send(data);
    });
});

// Start server.
const server = app.listen(process.env.APP_PORT || 8080, function (){
    const host = server.address().address;
    const port = server.address().port;

    console.log('AWS SQS example app listening at http://%s:%s', host, port);
});
