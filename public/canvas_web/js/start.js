'use strict';

//const vConsole = new VConsole();
//window.datgui = new dat.GUI();

var vue_options = {
    el: "#top",
    mixins: [mixins_bootstrap],
    data: {
        margin: 0,
        link_list: [],
    },
    computed: {
    },
    methods: {
    },
    created: function () {
    },
    mounted: function () {
        proc_load();

        const callbacks = {
            onUpdate : (data) => {
                console.log(data);
                for( var i = 0 ; i < data.length ; i++ ){
                    switch (data[i].which) {
                        case 'search': {
                            this.link_list = data[i].items;
                            break;
                        }
                        case 'next': {
                            $('#sampleCarousel').carousel('next');
                            break;
                        }
                        case 'previous': {
                            $('#sampleCarousel').carousel('prev');
                            break;
                        }
                    }
                }

                window.interactiveCanvas.getHeaderHeightPx()
                    .then(height => {
                        console.log("getHeaderHeightPx:" + height);
                        this.margin = height;
                    })
            },
        };
        window.interactiveCanvas.ready(callbacks);
    }
};
vue_add_data(vue_options, { progress_title: '' }); // for progress-dialog
vue_add_global_components(components_bootstrap);
vue_add_global_components(components_utils);

/* add additional components */

window.vue = new Vue(vue_options);
