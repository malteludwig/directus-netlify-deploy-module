import ModuleComponent from './module.vue';

export default {
    id: 'netlify',
    name: 'Publish Site',
    icon: 'cloud_upload',

    routes: [
        {
            path: '/',
            component: ModuleComponent,
        },
    ],
};
