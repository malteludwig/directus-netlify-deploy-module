import ModuleComponent from './module.vue';

export default {
    id: 'netlify-deploy',
    name: 'Publish Site',
    icon: 'cloud_upload',

    routes: [
        {
            path: '/',
            component: ModuleComponent,
        },
    ],
};
