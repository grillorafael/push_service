'use_strict';

var gcm = require('node-gcm');
var apn = require('apn');
var Q = require("q");
var path = require('path');
var _ = require('underscore');

function Push(opts) {
    this.opts = {
        apnKeyDevel: '',
        apnKeyProd: '',
        apnCerDevel: '',
        apnCerProd: '',
        apnPassphrase: '',
        gcmSenderId: ''
    };

    _.extend(this.opts, opts);
}

Push.prototype.pushTo = function(platform, data) {
    if(platform == 'android') {
        return this.GCMPush(data);
    }
    else if(platform == 'ios') {
        return this.IOSPush(data);
    }
    else {
        console.log('Unsupported platform:', platform);
    }
};

Push.prototype.GCMPush = function(config) {
    var deferred = Q.defer();
    if(this.opts.gcmSenderId) {
        var sender = new gcm.Sender(this.opts.gcmSenderId);
        var message = new gcm.Message();

        message.addData('title', config.title);
        message.addData('message', config.message);

        message.delay_while_idle = 10;

        var registrationIds = [];
        if (config.to instanceof Array) {
            registrationIds = config.to;
        } else {
            registrationIds.push(config.to);
        }

        for (var property in config.data) {
            message.addData(property, config.data[property]);
        }

        sender.send(message, registrationIds, 4, deferred.resolve);
    }
    else {
        setTimeout(function() {
            deferred.reject('Please inform you Google GCM SenderID');
        });
    }

    return deferred.promise;
};

Push.prototype.IOSPush = function(config) {
    var cer = process.env.NODE_ENV == 'production' ? this.opts.apnCerProd : this.opts.apnCerDevel;

    var key = process.env.NODE_ENV == 'production' ? this.opts.apnKeyProd : this.opts.apnKeyDevel;

    var options = {
        gateway: process.env.NODE_ENV == 'production' ? "gateway.push.apple.com" : "gateway.sandbox.push.apple.com",
        production: process.env.NODE_ENV == 'production',
        passphrase: this.opts.apnPassphrase,
        cert: cer,
        key: key,
    };

    var apnConnection = new apn.Connection(options);
    var device = new apn.Device(config.to);
    var note = new apn.Notification();

    note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
    note.badge = config.badge || 1;
    note.sound = config.sound || "default";
    note.alert = config.message;
    note.payload = config.data;

    apnConnection.pushNotification(note, device);
    var deferred = Q.defer();
    deferred.resolve();
    return deferred.promise;
};

module.exports = Push;
