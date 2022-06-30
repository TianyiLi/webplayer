'use strict';
importScripts('./assets/webstomp.js')
// this is for webworker
self.onmessage = function (d) {
    let func = d.data.func;
    let data = d.data.data;
    func === 'config' && configure(data);
    func === 'send' && sendMessage(data);
}
let config = {
    ip: 'smock.transtep.com',
    port: 61614,
    user: 'user',
    password: 'password',
    heartbeat: 20000,
    subscribe: ['/topic/app'],
    publish: ['/queue/app'],
    debug: true
};
let messageList = [];
let maximumMessage = 500;
let filterMatch = undefined;
let registerMatch = '';
let conn = {};
function configure(_config) {
    _config = _config ? _config : {};
    _config.ip && (config.ip = _config.ip);
    _config.port && (config.port = _config.port);
    _config.user && (config.user = _config.user);
    _config.heartbeat && (config.heartbeat = _config.heartbeat);
    _config.subscribe && (config.subscribe = _config.subscribe);
    _config.publish && (config.publish = _config.publish);
    _config.maximumMessage && (maximumMessage = _config.maximumMessage);
    _config.filter && (filterMatch = new Regex(`(${filter.join('|')})`));
    _config.register && (registerMatch = _config.register.join(' '));
    _config.debug && (config.debug = _config.debug)
    conn = webstomp.client(`ws://${config.ip}:${config.port}/stomp`, { debug: false });
    conn.connect(config.user, config.password, function () {
        setInterval(function () {
            sendMessage({ trig_chan: '/topic/heartbeats', data: {} })
        }, config.heartbeat);
        postMessage({ func: 'init', text: 'connect!' })
    }, onError);
    if (!config.debug) {
        console.log = function () { };
    }
}

function onError(err) {
    postMessage({ func: 'error', msg: 'worker terminated' })
    close();
}

function onStompMessage(msg) {
    if (msg.body === '') return;
    let state;
    try {
        state = !!(~registerMatch.indexOf(JSON.parse(msg.body).e));
    } catch (error) {

    }
    if (!state) return false;

    postMessage({ func: 'message', msg: msg.body, timestamp: new Date().toLocaleTimeString() });
}

function sendMessage(data) {
    let channel = data.trig_chan ? data.trig_chan : config.publish;
    if (typeof data.data === 'object') data = JSON.stringify(data.data);
    console.log(data)
    conn.send(channel, data);
}