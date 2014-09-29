var Backbone = require('backbone');
var $ = require('jquery');
Backbone.$ = $;
var Marionette = require('backbone.marionette');
Backbone.Picky = require('./vendor/backbone.picky');

var ListManager = new Marionette.Application();

var dialog = require('./apps/config/marionette/dialog');
Marionette.Region.Dialog = Marionette.Region.extend(dialog);

//////////////////
// Start app includes
/////////////////
var Views = require('./common/views');
//////////////////
// End app includes
/////////////////


ListManager.addRegions({
    mainRegion: "#main-region",
    dialogRegion: Marionette.Region.Dialog.extend({
        el: "#dialog-region"
    }),
    headerRegion: "#menu-region"
});

ListManager.navigate = function(route, options) {
    options = options || {};
    console.log(route);
    Backbone.history.navigate(route, options);
};

ListManager.getCurrentRoute = function() {
    return Backbone.history.fragment;
};

ListManager.on("login:success", function() {
    ListManager.navigate(ListManager.getCurrentRoute(), { trigger: true });
});

ListManager.on("start", function() {
    if(Backbone.history) {
        Backbone.history.start();
    }

    if(this.getCurrentRoute() === "") {
        ListManager.trigger("show:home");
    }

    ListManager.trigger("show:menu");

    console.log("DraftX has started");
});

ListManager.module("Common.Views", Views);

ListManager.start();
