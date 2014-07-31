var reduceKeypath = require('../reduce-keypath');
var requestAnimationFrame = require('raf');
var KeyTreeStore = require('key-tree-store');
var relativeKeypath = require('../relative-keypath');

KeyTreeStore.prototype.keys = function (keypath) {
    var keys = Object.keys(this.storage);
    return keys.filter(function (k) {
        return (k.indexOf(keypath) === 0);
    });
};

function Template () {
    this._callbacks = new KeyTreeStore();
    this._changes = {};
    this.html = document.createDocumentFragment();
    this.isRenderQueued = false;
}

Template.prototype.update = function (keypath, value) {
    var keys = this._callbacks.keys(keypath);
    var self = this;

    keys.forEach(function (key) {
        if (key === keypath) {
            self._changes[key] = value;
        } else {
            self._changes[key] = reduceKeypath(value, relativeKeypath(keypath, key));
        }
    });

    if (!this.isRenderQueued) this.queueRender();
};

Template.prototype.queueRender = function () {
    requestAnimationFrame(this.doRender.bind(this));
    this.isRenderQueued = true;
};

Template.prototype._update = function (keypath, value) {
    if (this._callbacks.storage[keypath]) {
        this._callbacks.storage[keypath].forEach(function (cb) {
            cb(value);
        });
    }
};

Template.prototype.doRender = function () {
    var keypaths = Object.keys(this._changes);
    for (var i=0, len = keypaths.length; i < len; i++) {
        this._update(keypaths[i], this._changes[keypaths[i]]);
    }
    this._changes = {};
    this.isRenderQueued = false;
};

Template.prototype.addCallback = function(keypath, cb) {
    this._callbacks.add(keypath, cb);
};

module.exports = Template;
