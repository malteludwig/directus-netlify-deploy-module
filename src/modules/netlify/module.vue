<template>
    <private-view title="Deploy to netlify">
        <div class="netlify-deploy-module">
            <v-info icon="cloud_upload" :title="$t('deploy_message')" type="info" v-if="authorized && !error">
                <v-button :disabled="loading" @click="preview" small>
                    <v-icon name="preview" left /> {{ $t('preview') }}
                </v-button>
                <v-button :disabled="loading" @click="deploy" small>
                    <v-icon name="cloud_upload" left /> {{ $t('deploy') }}
                </v-button>
            </v-info>

            <!-- <v-info
                icon="privacy_tip"
                :title="$t('authentication_necessary')"
                type="info"
                class="center"
                v-if="!authorized"
            >
                <p class="content">{{ $t('authorize_message') }}</p>
            </v-info> -->

            <v-info icon="warning" :title="$t(error + '.title')" type="danger" v-if="error">
                <span
                    >{{ $t(error + '.message') }} <br /><br />
                    <a v-if="$t(error + '.link') !== ''" :href="$t(error + '.link')">
                        <v-icon name="link" left x-small />Info
                    </a>
                </span>
            </v-info>

            <v-table
                v-if="authorized && !error"
                :headers="[
                    {
                        text: 'State',
                        value: 'state',
                        width: 100,
                        align: 'center',
                    },
                    {
                        text: 'Date',
                        value: 'date',
                        width: 200,
                    },
                    {
                        text: 'Title',
                        value: 'title',
                        width: 400,
                    },
                    {
                        text: 'Deployed in',
                        value: 'deploy_time',
                        width: 150,
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
                        <v-icon :class="item.state" :name="deployState(item.state)" />

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
// import moment from 'moment';

export default {
    name: 'deploy-to-netlify',
    inject: ['system'],
    i18n: {
        // `i18n` option, setup locale info for component
        messages: {
            en: {
                authentication_necessary: 'Loading',
                authorize_message: '',
                deploy_message: 'Publish',
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
                authentication_necessary: 'Chargement',
                authorize_message: ``,
                deploy_message: 'Publier',
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
                authentication_necessary: 'Loading',
                authorize_message: '',
                deploy_message: 'Veröffentlichen',
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
            loading: false,
            activeDeployID: null,
            activeBuildState: '',
            authorized: null,
            previewURL: '',
            error: '',
            api: null,
        };
    },
    created() {
        console.log(this);
    },
    async mounted() {
        this.loading = true;
        this.api = this.system.api;
        this.loadDeploys();
        this.getSiteURL();
    },
    methods: {
        checkBuildState() {
            if (this.deploys[0].state === 'ready') {
                this.loading = false;
                this.activeDeployID = null;
                // this.activeBuildState = null;
            } else {
                let that = this;
                setTimeout(() => {
                    that.loadSingleDeploy(this.activeDeployID);
                }, this.refreshDelay);
            }
        },

        /*
         *   loads a list of deploys
         */
        async loadDeploys() {
            this.loading = true;
            const deploys = await this.api.get('/custom/netlify/deploys').catch((error) => {
                this.error = 'deploy_info_error';
                this.authorized = false;
            });
            this.authorized = true;
            this.updateDeployData(deploys.data);
            // this.loadSingleDeploy(deploys.data[0].id);
        },

        /*s
         *   loads a single deploy
         */
        async loadSingleDeploy(deploy_id) {
            if (this.loading) {
                const response = await this.api.get(`/custom/netlify/deploy?id=${deploy_id}`).catch((error) => {
                    this.error = 'deploy_info_error';
                    this.authorized = false;
                });

                this.activeBuildState = response.data.state;
                this.deploys[0] = response.data;
                this.checkBuildState();
            }
        },
        updateDeployData(data) {
            this.deploys = data.filter((deploy) => deploy.context === 'production');
            if (this.loading || data[0].state === 'building' || data[0].state === 'enqueued') {
                this.loading = true;
                this.activeDeployID = data[0].id;
                this.checkBuildState();
            }
        },

        onRowClick(item) {
            if (item.state !== 'error') {
                const url = `https://${item.id}--${item.name}.netlify.com`;
                window.open(url, '_blank');
            }
        },

        /*
         *   trigger build hook
         */
        async triggerDeploy() {
            this.loading = true;
            const response = await this.api.get('/custom/netlify/build').catch((error) => {
                this.error = 'build_hook_error';
            });
            this.loadDeploys();
        },
        deploy() {
            if (this.authorized) {
                this.triggerDeploy();
            }
        },

        /*
         *   loads site information from netlify api
         */
        async getSiteURL() {
            this.loading = true;

            const response = await this.api.get('/custom/netlify/url').catch((error) => {
                this.error = 'site_info_error';
            });
            this.setPreviewURL(response.data.site_url);
        },
        setPreviewURL(siteUrl) {
            this.previewURL = `${siteUrl}?preview`;
        },
        preview() {
            window.open(this.previewURL, '_blank');
        },

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
