/**
 *  Feed to create a webhook for IBM Push Notifications service
 *
 *  @param {string} appId - appId to create webhook
 *  @param {string} appSecret - appSecret of the application
 *  @param {string} events - list of the events the webhook should fire on
 *  @return {object} whisk async
 */
var request = require('request');

function main(params) {

    console.log("push trigger feed params: ", params);
    var parsedName = parseQName(params.triggerName);
    var trigger = parsedName.name;
    var namespace = parsedName.namespace;
    var endpoint = 'openwhisk.ng.bluemix.net';
    // URL of the whisk system. The calls of push service will go here.
    var whiskCallbackUrl = 'https://' + whisk.getAuthKey() + "@" + endpoint + '/api/v1/namespaces/' + namespace + '/triggers/' + trigger;
    var appId = params.appId;
    var appSecret = params.appSecret;
    // The URL to create the webhook on push service
    var registrationEndpoint = 'https://mobile.ng.bluemix.net/imfpush/v1/apps/' + appId + '/webhooks';
    //var registrationEndpoint = 'https://imfpushtest1.ng.bluemix.net/imfpush/v1/apps/'+appId+'/webhooks';
    var lifecycleEvent = (params.lifecycleEvent || 'CREATE').trim().toUpperCase();
    if (lifecycleEvent === 'CREATE' || lifecycleEvent === 'UPDATE') {

        var events = params.events;
        var body = {
            name:trigger,
            url: whiskCallbackUrl,
            eventTypes: events
        };
        var options = {
            method: 'POST',
            url: registrationEndpoint,
            body: JSON.stringify(body),
            headers: {
                'appSecret': appSecret,
                'Content-Type': 'application/json'
            }
        };
        request(options, function(error, response, body){
            if (error) {
                return whisk.error();
            }
            return whisk.done({response: body});
        });
    }
    if (lifecycleEvent === 'DELETE') {
        var options = {
            method: 'DELETE',
            url: registrationEndpoint,
            headers: {
                'appSecret': appSecret
            }
        };
        request(options, function(error, response, body) {
            if (error) {
                return whisk.error();
            }
            return whisk.done({response: body});
        });
    }
    return whisk.async();
}

function parseQName(qname) {
    var parsed = {};
    var delimiter = '/';
    var defaultNamespace = '_';
    if (qname && qname.charAt(0) === delimiter) {
        var parts = qname.split(delimiter);
        parsed.namespace = parts[1];
        parsed.name = parts.length > 2 ? parts.slice(2).join(delimiter) : '';
    } else {
        parsed.namespace = defaultNamespace;
        parsed.name = qname;
    }
    return parsed;
}
