var loadingTemplate = require('./templates/loading.hbs');
Syphon = require('backbone.syphon');

module.exports = function(Views, DraftManager,
                          Backbone, Marionette, $, _) {
    Views.Loading = Marionette.ItemView.extend({
        template: loadingTemplate,
        title: "Loading Data",
        message: "Please wait",
        initialize: function() {
            console.log('loading init');
        },
        serializeData: function() {
            console.log("loading serialize");
            return {
                title: Marionette.getOption(this, "title"),
                message: Marionette.getOption(this, "message")
            };
        }
    });

    Views.Form = Marionette.ItemView.extend({
        events: {
            "click button.js-submit": "submitClicked"
        },

        initialize: function () {
        },

        submitClicked: function (e) {
            e.preventDefault();
            var data = Syphon.serialize(this);
            this.trigger("form:submit", data);
        },

        onFormDataInvalid: function (errors) {
            var $view = this.$el;

            var clearFormErrors = function () {
                var $form = $view.find('form');
                $form.find(".help-inline.error").each(function () {
                    $(this).remove();
                });
                $form.find(".control-group.error").each(function () {
                    $(this).removeClass("error");
                });
            };

            var markError = function (value, key) {
                var $controlGroup = $view.find("#link-" + key).parent();
                var $errorEl = $("<span>", {class: "help-inline error", text: value});
                $controlGroup.append($errorEl).addClass("error");
            };

            clearFormErrors();
            _.each(errors, markError);
        }
    });
};