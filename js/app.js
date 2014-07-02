window.takke = window.takke || {};

takke.App = $.Class.extend({

    acceptedTypes: ["image/jpg", "image/jpeg", "image/png", "image/gif"],

    originalImageSizes: {
        width: 614,
        height: 373
    },

    init: function (options) {
        $.extend(this, options);

        this.takke = $("<img>", {
            "src": "img/takke.png"
        }).css({"position": "absolute"});

        this.loading = $("#loading");

    },

    initializeCanvas: function (imageElement) {
        var canvas = document.createElement('canvas'),
            context = canvas.getContext('2d');
        canvas.width = imageElement.width();
        canvas.height = imageElement.height();
        context.drawImage(imageElement.get(0), 0, 0);
        return canvas;
    },

    afterDetection: function (workspace, comp) {
        for (var i = 0; i < comp.length; i++) {
            var width = comp[i].width * 1.4,
                ratio = width / this.originalImageSizes.width,
                height = this.originalImageSizes.height * ratio;

            var cloned = this.takke.clone().css({
                "margin-left": comp[i].x - ((width - comp[i].width)/2),
                "margin-top": comp[i].y - (height / 1.2),
                "width": width,
                "height": height
            });

            workspace.prepend(cloned);
        }

        this.loading.hide();
    },

    run: function (image) {

        var canvas = this.initializeCanvas(image),
            workspace = $(this.workspaceSelector);

        ccv.detect_objects({
            "canvas": ccv.grayscale(ccv.pre(image.get(0))),
            "cascade": cascade,
            "interval": 5,
            "min_neighbors": 1,
            "async": true,
            "worker": 1 })(
                this.afterDetection.bind(this, workspace)
            );

        image.remove();

        this.loading.show();

        workspace.append(canvas)

    },

    render: function () {
        var canvas = $(this.workspaceSelector);

        canvas.on('dragenter', function (event) {
            event.stopPropagation();
            event.preventDefault();
            canvas.addClass('dragged');
        });

        canvas.on('dragover', function (event) {
             event.stopPropagation();
             event.preventDefault();
        });

        canvas.on('drop', function (event) {
            canvas.addClass('dropped');
            event.preventDefault();
            var files = event.originalEvent.dataTransfer.files,
                file = files[0];
            if (this.acceptedTypes.indexOf(file.type) == -1) {
                window.alert("Please drop a valid image.");
            } else {
                this.readDroppedImage(file);
            }
        }.bind(this));

    },

    readDroppedImage: function (file) {

        var canvas = $(this.workspaceSelector),
            reader = new FileReader();

        reader.onloadend = function () {

            var previewImage = $("<img>", {
                src: reader.result
            });

            canvas.html(previewImage);

            this.run(previewImage);

        }.bind(this);

        reader.readAsDataURL(file);
    },

    save: function() {
        var workspace = $(this.workspaceSelector);
        window.open(workspace.find('canvas').get(0).toDataURL("image/jpeg"));
    }

});
