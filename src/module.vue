<template>
    <private-view title="Deploy to netlify">
        <div class="netlify-deploy-module">
            <v-info icon="cloud_upload" :title="$t('deploy_message')" type="info" v-if="access_token && !error">
                <v-button :disabled="processing" @click="preview" small>
                    <v-icon name="preview" left /> {{ $t('preview') }}
                </v-button>
                <v-button :disabled="processing" @click="deploy" small>
                    <v-icon name="cloud_upload" left /> {{ $t('deploy') }}
                </v-button>
            </v-info>
            <v-info icon="privacy_tip" :title="$t('not_authenticated')" type="info" class="center" v-if="!access_token">
                <p class="content">{{ $t('authorize_message') }}{{ `sdfsdf${access_token}` }}</p>
                <v-button :href="authHref" :target="'_self'"> {{ $t('authorize') }} </v-button>
            </v-info>

            <v-info icon="warning" :title="$t(error + '.title')" type="danger" v-if="error">
                <span
                    >{{ $t(error + '.message') }} <br /><br />
                    <a v-if="$t(error + '.link') !== ''" :href="$t(error + '.link')">
                        <v-icon name="link" left x-small />Info
                    </a>
                </span>
            </v-info>

            <v-table
                v-if="access_token && !error"
                :headers="[
                    {
                        text: 'State',
                        value: 'state',
                        width: 120,
                        align: 'center',
                    },
                    {
                        text: 'Title',
                        value: 'title',
                        width: 550,
                    },
                    {
                        text: 'Date',
                        value: 'date',
                        width: 200,
                    },
                    {
                        text: 'Deployed in',
                        value: 'deploy_time',
                        width: 200,
                    },
                    {
                        text: 'Screenshot',
                        value: 'screenshot_url',
                        width: 200,
                    },
                ]"
                :items="deploys"
                rowHeight="8"
                show-resize
                @click:row="onRowClick"
            >
                <template #item.state="{ item }">
                    <div class="deploy-state">
                        <v-icon :class="item.state" :name="deployState(item.state)" right />

                        <!-- <div class="deploy-state__label font-light" v-if="item.state">
                            {{ item.state }}
                        </div> -->
                    </div>
                </template>

                <template #item.title="{ item }">
                    <span v-if="item.title" class="deploy-title">{{ item.title }}</span>
                    <span v-else-if="item.error_message" class="deploy-title danger">{{ item.error_message }}</span>
                    <span v-else class="deploy-title">---</span>
                </template>

                <template #item.date="{ item }">
                    <div>
                        <display-datetime :value="item.created_at" :type="'timestamp'" relative /><br />
                        <!-- <display-datetime
                            :value="item.created_at"
                            :type="'timestamp'"
                            :format="'short'"
                            class="subdued font-light"
                        /> -->
                    </div>
                </template>

                <template #item.deploy_time="{ item }">
                    <span class="deploy-time" v-if="item.deploy_time">{{ item.deploy_time }}s</span>
                    <span v-else>---</span>
                </template>

                <template #item.screenshot_url="{ item }">
                    <img :src="item.screenshot_url" role="presentation" class="deploy-screenshot" />
                </template>
            </v-table>
        </div>
    </private-view>
</template>

<script>
import axios from 'axios';
import moment from 'moment';

export default {
    name: 'deploy-to-netlify',
    i18n: {
        // `i18n` option, setup locale info for component
        messages: {
            en: {
                authorize_message: 'You must authorize with netlify before you can publish content.',
                deploy_message: 'Deploy changes to netlify',
                authorize: 'Authorize',
                preview: 'Preview',
                deploy: 'Deploy',
                build_hook_error: {
                    title: 'No build hook found',
                    message: 'You must add a build hook first.',
                    link: 'https://docs.netlify.com/configure-builds/build-hooks',
                },
                deploy_info_error: {
                    title: 'Failed to load deploys',
                    message: 'Please check siteId var is correct, or create a new site on netlify.',
                },
                site_info_error: {
                    title: 'Site not found',
                    message: 'Please check siteId var is correct, or create a new site on netlify.',
                },
            },
            fr: {
                authorize_message: `Pour publier le contenu il faut activer l'Authentification auprès de netlify.`,
                deploy_message: 'Publier sur netlify',
                authorize: 'Authentification',
                preview: 'Apperçu',
                deploy: 'Publier',
                build_hook_error: {
                    message: `Il faut d'abord créer un build hook. `,
                    title: 'No build hook found',
                    link: 'https://docs.netlify.com/configure-builds/build-hooks',
                },
                deploy_info_error: {
                    title: 'Failed to load deploys',
                    message: 'Please check siteId var is correct, or create a new site on netlify.',
                },
                site_info_error: {
                    title: 'Site not found',
                    message: 'Please check siteId var is correct, or create a new site on netlify.',
                },
            },
            de: {
                authorize_message: 'Bei netlify authentifizieren um Inhalte zu veröffentlichen.',
                deploy_message: 'Veröffentlichen auf netlify',
                authorize: 'Authentifizieren',
                preview: 'Vorschau',
                deploy: 'Veröffentlichen',
                build_hook_error: {
                    message: `Sie müssen zunächst einen Build hook anlegen.`,
                    title: 'No build hook found',
                    link: 'https://docs.netlify.com/configure-builds/build-hooks',
                },
                deploy_info_error: {
                    title: 'Failed to load deploys',
                    message: 'Please check siteId var is correct, or create a new site on netlify.',
                },
                site_info_error: {
                    title: 'Site not found',
                    message: 'Please check siteId var is correct, or create a new site on netlify.',
                },
            },
        },
    },
    data: function() {
        return {
            deploys: {},
            refreshDelay: 1000,
            processing: false,
            activeDeployID: null,
            activeBuildState: '',
            buildInfo: '',
            access_token: null,
            CLIENT_ID: '', // see rollup.config.js
            SITE_ID: '', // see rollup.config.js
            NETLIFY_TOKEN_STORAGE_ID: '',
            buildHook: null,
            client: null,
            authHref: '',
            state: null,
            previewURL: '',
            error: '',
        };
    },
    mounted() {
        // if there is a hash in the url netlify has redirected to this page
        const hash = document.location.hash;
        if (localStorage.getItem(NETLIFY_TOKEN_STORAGE_ID)) {
            this.access_token = localStorage.getItem(NETLIFY_TOKEN_STORAGE_ID);
            // console.log(this.access_token);
            this.loadDeployData();
            this.getSiteInfo();
        } else if (hash) {
            this.handleAccessToken();
        } else {
            this.initAuthInfo();
        }
    },
    methods: {
        initAuthInfo() {
            // We generate a random state that we'll validate when Netlify redirects back to
            // our app.
            const redirectURI = document.location.href;
            this.state = Math.random();
            localStorage.setItem(this.state, true);
            this.authHref =
                'https://app.netlify.com/authorize?' +
                'client_id=' +
                CLIENT_ID +
                '&response_type=token' +
                '&redirect_uri=' +
                redirectURI +
                '&state=' +
                this.state;
        },

        async handleAccessToken() {
            console.log('handleAccessToken');
            // The access token is returned in the hash part of the document.location
            //   #access_token=1234&response_type=token
            const response = document.location.hash
                .replace(/^#/, '')
                .split('&')
                .reduce((result, pair) => {
                    const keyValue = pair.split('=');
                    result[keyValue[0]] = keyValue[1];
                    return result;
                }, {});

            // Remove the token so it's not visible in the URL after we're done
            document.location.hash = '';

            if (!localStorage.getItem(response.state)) {
                // We need to verify the random state we set before starting the request,
                // otherwise this could be an access token from someone else than our user
                alert('You are not authorized to do this.');
                return;
            }
            // clear local storage
            localStorage.removeItem(response.state);
            this.access_token = response.access_token;

            // save access token for later use
            localStorage.setItem(NETLIFY_TOKEN_STORAGE_ID, response.access_token);

            // start loading
            this.loadDeployData();
            this.getSiteInfo();
        },

        updateDeployData(data) {
            this.deploys = data.filter((deploy) => deploy.context === 'production');
            if (this.processing || data[0].state === 'building' || data[0].state === 'enqueued') {
                this.processing = true;
                this.activeDeployID = data[0].id;
                this.checkBuildState();
            }
        },

        handlePreviewURL(data) {
            this.previewURL = `${data.url}?preview`;
        },

        checkBuildState() {
            if (this.deploys[0].state === 'ready') {
                this.processing = false;
                this.activeDeployID = null;
                // this.activeBuildState = null;
            } else {
                let that = this;
                setTimeout(() => {
                    that.loadSingleDeployData(this.activeDeployID);
                }, this.refreshDelay);
            }
        },

        /*
         *   loads a list of deploys
         */
        async loadDeployData() {
            axios
                .get('https://api.netlify.com/api/v1/sites/' + SITE_ID + '/deploys?access_token=' + this.access_token)
                .then((response) => {
                    this.updateDeployData(response.data);
                })
                .catch((error) => {
                    this.error = 'deploy_info_error';
                    // this.initAuthInfo();
                });
        },

        /*
         *   loads a single deploy
         */
        async loadSingleDeployData(deploy_id) {
            if (this.processing) {
                axios
                    .get('https://api.netlify.com/api/v1/deploys/' + deploy_id + '?access_token=' + this.access_token)
                    .then((response) => {
                        console.log('loadSingleDeployData --- loaded', response);
                        this.activeBuildState = response.data.state;
                        this.deploys[0] = response.data;
                        this.checkBuildState();
                    })
                    .catch((error) => {
                        this.error = 'deploy_info_error';
                    });
            }
        },

        /*
         *   loads site information from netlify api
         */

        async getSiteInfo() {
            this.processing = true;
            axios
                .get('https://api.netlify.com/api/v1/sites/' + SITE_ID + '?access_token=' + this.access_token)
                .then((response) => {
                    this.handlePreviewURL(response.data);
                })
                .catch((error) => {
                    this.error = 'site_info_error';
                });
        },

        /*
         *   loads information about exsting build hook
         */
        async getBuildHookId() {
            this.processing = true;
            const that = this;
            axios
                .get(
                    'https://api.netlify.com/api/v1/sites/' + SITE_ID + '/build_hooks?access_token=' + this.access_token
                )
                .then((response) => {
                    that.buildHook = response.data[0].url;
                    that.triggerDeploy();
                })
                .catch((error) => {
                    this.error = 'build_hook_error';
                });
        },

        /*
         *   trigger build hook
         */
        async triggerDeploy() {
            this.processing = true;
            axios
                .post(this.buildHook)
                .then(this.loadDeployData)
                .catch((error) => {
                    this.error = 'build_hook_error';
                });
        },

        onRowClick(item) {
            if (item.state !== 'error') {
                const url = `https://${item.id}--${item.name}.netlify.com`;
                window.open(url, '_blank');
            }
        },

        deploy() {
            if (!this.buildHook) {
                this.getBuildHookId();
            } else {
                this.triggerDeploy();
            }
        },

        preview() {
            window.open(this.previewURL, '_blank');
        },

        // formatDate(date) {
        //     //   return moment(date).format('DD/MM/YYYY') + ' at '+moment(date).format('hh:mm A')
        //     return moment(date).calendar(null, {
        //         sameDay: '[Today at] hh:mm A',
        //         nextDay: '[Tomorrow]',
        //         nextWeek: '[Next] dddd',
        //         lastDay: '[Yesterday at] hh:mm A',
        //         lastWeek: 'ddd [at] hh:mm A',
        //         sameElse: 'DD/MM/YYYY',
        //     });
        // },

        deployState(state) {
            let icon = '';
            switch (state) {
                case 'ready':
                    icon = 'check_circle';
                    break;
                case 'building':
                case 'enqueued':
                case 'uploaded':
                case 'uploading':
                case 'processing':
                    icon = 'autorenew';
                    break;
                case 'error':
                    icon = 'error';
                    break;
                default:
                    icon = '';
                    break;
            }
            return icon;
        },
    },
};
</script>

<style lang="scss">
.netlify-deploy-module {
    padding: var(--page-padding);
    padding: var(--content-padding);
    padding-top: 0;

    .font-bold {
        font-weight: 500;
    }
    .font-light {
        font-weight: 200;
    }
    .subdued {
        color: var(--foreground-subdued);
    }
    .ready {
        color: var(--success);
    }
    .error {
        color: var(--danger);
    }
    .enqueued,
    .processing,
    .uploaded,
    .uploading,
    .building {
        color: var(--warning);
    }
    .deploy-state,
    .deploy-title,
    .deploy-time,
    .deploy-date {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        line-height: 1.15;
    }

    .deploy-state {
        &__label {
            margin-top: 10px;
            color: var(--foreground-subdued);
        }
    }
    .deploy-title {
        color: var(--foreground-subdued);
    }
    .deploy-time {
        color: var(--foreground-subdued);
    }
    .deploy-date {
        color: var(--foreground-normal);
    }

    .deploy-screenshot {
        display: inline-block;
        width: auto;
        height: 100%;
        vertical-align: -30%;
        border-radius: var(--border-radius);
    }

    .v-icon {
        width: 34px;

        &.enqueued,
        &.processing,
        &.uploaded,
        &.uploading,
        &.building {
            -webkit-animation: spin 2s linear infinite;
            -moz-animation: spin 2s linear infinite;
            animation: spin 2s linear infinite;
        }
    }

    .v-button {
        color: var(--white);
        background-color: var(--blue-500);
        --v-button-color-hover: var(--white);
        --v-button-background-color-hover: var(--green);
        .v-icon {
            color: var(--green-500);
        }
    }

    .v-info {
        padding: var(--content-padding);
        .content {
            max-width: 600px;
            color: var(--foreground-subdued);
            .v-button {
                margin: 0px 10px 30px 10px;
                display: inline-block;
                .content {
                    color: white;
                }
            }
            a {
                color: var(--primary);
            }
        }
    }
    h1 {
        margin-bottom: 20px;
    }

    .v-table {
        --v-table-sticky-offset-top: var(--layout-offset-top);
        display: contents;
        ::v-deep > table {
            min-width: calc(100% - var(--content-padding)) !important;
            margin-left: var(--content-padding);
            tr {
                margin-right: var(--content-padding);
            }
        }
    }
}
@-moz-keyframes spin {
    100% {
        -moz-transform: rotate(360deg);
    }
}
@-webkit-keyframes spin {
    100% {
        -webkit-transform: rotate(360deg);
    }
}
@keyframes spin {
    100% {
        -webkit-transform: rotate(360deg);
        transform: rotate(360deg);
    }
}
</style>
