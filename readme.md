# Push Service for Node


This is a Node module to work with push notifications for iOS and Android.

It will work with other devices later.


## How it works
```bash
npm install push_service --save
```

```javascript
var push = new require('push_service')({
    apnKeyDevel: 'path/to/developmentKey',
    apnKeyProd: 'path/to/productionKey',
    apnCerDevel: 'path/to/developmentCertificate',
    apnCerProd: 'path/to/productionCertificate',
    apnPassphrase: 'Your APN Passphrase',
    gcmSenderId: 'Your Google GCM SenderID'
});

var message = {
    title: 'Your message title',
    message: 'Your message message',
    to: 'token or array of tokens', // [token1, token2, token3]
    data: { // Your payload
        messageId: 10,
        messageInfo: 'This info you arrive to your device as a payload'
    }
};

push.sendTo('android', message).then(function() {
    console.log('Message sent!');
});

```
