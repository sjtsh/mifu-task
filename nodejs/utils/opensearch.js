'use strict';
const AWS = require('aws-sdk'); // V2 SDK.
const { Client } = require('@opensearch-project/opensearch');
const { AwsSigv4Signer } = require('@opensearch-project/opensearch/aws');

/**
 * Create a client to  use the opensearch service
 */
exports.opensearch = new Client({
    ...AwsSigv4Signer({
        region: 'eu-west-1',
        service: 'es',
        getCredentials: () =>
            new Promise((resolve, reject) => {
                AWS.config.getCredentials((err, credentials) => {
                    if (err) {
                        console.log('Open search connection error ...', err);
                        reject(err);
                    } else {
                        resolve(credentials);
                    }
                });
            }),
    }),
    // node: 'https://search-dev-opensearch-mifu-jjdblvlojndhwcghitdzjxq6zu.eu-west-1.es.amazonaws.com' //TESTING URL ONLY
    node: `https://${process.env.DOMAIN_ENDPOINT}`, // OpenSearch domain URL
});

/**
 * Execute command parameter for search the documents using opensearch.
 * @param {Object} command - The command object that contains index and body.
 * @return {Object[]} Return object with data that contains opensearch result with failed status
 */
exports.send = async (command) => {
    return exports.opensearch
        .search(command)
        .then(({ body }) => {
            return {
                data: body.hits.hits,
                failed: false,
            };
        })
        .catch((err) => {
            console.log('Failed to search documents:', err);
            return {
                failed: true,
                error: err,
            };
        });
};

/**
 * Records that contains list of influencers from infl_data.json file.
 * @param {String} index_name - The index_name contains name of index.
 * @param {Object[]} records - The records array contains information of influencers.
 * @return {Object} Return object as success response with attribute data and failed status
 */
exports.post = async (index_name, records) => {
    try {
        for (const { id, full_name, bio, username, followers_count, posts_count, stats } of records) {
            const platform = id.startsWith('i_') ? 'i_instagram' : id.startsWith('t_') ? 't_tiktok' : '';

            const input = {
                id,
                full_name,
                bio,
                username,
                followers_count,
                is_registered: false,
                platform,
                posts_count,
                stats: {
                    average_comments: stats.average_comments.S,
                    average_views: stats.average_views.S,
                    eng_rate: stats.eng_rate.S,
                    reach: stats.reach.S,
                    average_likes: stats.average_likes.S,
                },
            };
            await exports.opensearch.index({
                id,
                index: index_name,
                body: input,
                refresh: true,
            });
        }

        return {
            failed: false,
            data: 'Docs Uploaded',
        };
    } catch (error) {
        console.error('Failed to post documents:', error);
        return {
            failed: true,
            error: error,
        };
    }
};

/**
 * @params {String} index_name - The index_name contains name of index.
 * @params {String} id - The id contains id of influencers record.
 * @return {Object} Return object as success response with attribute data and failed status
 */
exports.getDoc = async (index_name, id) => {
    return await exports.opensearch
        .get({
            id,
            index: index_name,
        })
        .then(({ body }) => {
            return {
                data: body,
                failed: false,
            };
        })
        .catch((err) => {
            return {
                failed: true,
                error: err,
            };
        });
};

/**
 * @param {Object} params - The params contains multiple attributes of influencers record.
 * @return {Object} Return object as success response with attribute data and failed status
 */
exports.createDoc = async (index_name, params) => {
    const id = params.id;
    delete params.id;

    const input = params;

    return await exports.opensearch
        .index({
            id,
            index: index_name,
            body: input,
            refresh: true,
        })
        .then(({ body }) => {
            return {
                data: body,
                failed: false,
            };
        })
        .catch((err) => {
            return {
                failed: true,
                error: err,
            };
        });
};

/**
 * @param {String} index_name - The index_name contains name of index.
 * @param {Object} param- The params contains multiple attributes of influencers record.
 * @return {Object} Return object as success response with attribute data and failed status
 */
exports.updateDoc = async (index_name, params) => {
    const id = params.id;
    delete params.id;

    const input = params;

    return await exports.opensearch
        .update({
            id,
            index: index_name,
            body: {
                doc: input,
            },
        })
        .then(({ body }) => {
            return {
                data: body,
                failed: false,
            };
        })
        .catch((err) => {
            return {
                failed: true,
                error: err,
            };
        });
};

/**
 * @param {Object} param- The params contains id of influencers record.
 * @return {Object} Return object as success response with attribute data and failed status
 */
exports.deleteDoc = async (index_name, params) => {
    const { id } = params;

    return await exports.opensearch
        .delete({
            id,
            index: index_name,
        })
        .then(({ body }) => {
            return {
                data: body,
                failed: false,
            };
        })
        .catch((err) => {
            return {
                failed: true,
                error: err,
            };
        });
};

/**
 * @param {String} index_name - The index_name contains name of index.
 * @return {Object} Return object as success response with attribute data and failed status
 */
exports.createIndex = async (index_name) => {
    return exports.opensearch.indices
        .create({
            index: index_name,
            body: {
                mappings: {
                    properties: {
                        id: { type: 'keyword', index: false },
                        username: { type: 'text' },
                        full_name: { type: 'text' },
                        bio: { type: 'text' },
                        is_registered: { type: 'boolean' },
                        is_email: { type: 'boolean' },
                        followers_count: { type: 'integer' },
                        posts_count: { type: 'integer' },
                        reels_count: { type: 'integer' },
                        hastags: { type: 'keyword' },
                        platform: { type: 'keyword' },
                        stats: {
                            type: 'object',
                            properties: {
                                average_comments: { type: 'integer' },
                                average_views: { type: 'integer' },
                                eng_rate: { type: 'float' },
                                reach: { type: 'integer' },
                                average_likes: { type: 'integer' },
                            },
                        },
                    },
                },
            },
        })
        .then(({ body }) => {
            return {
                data: body,
                failed: false,
            };
        })
        .catch((err) => {
            return {
                failed: true,
                error: err,
            };
        });
};

exports.batchPut = async (index_name, docs) => {
    return exports.opensearch.helpers
        .bulk({
            datasource: docs,
            onDocument (doc) {
                return { index: { _index: index_name, _id: doc.id } };
            },
            refreshOnCompletion: true
        })
        .then(({ body }) => {
            console.log('Succesfully uploaded new documents', JSON.stringify(body));

            return {
                data: body,
                failed: false,
            };
        })
        .catch((err) => {
            console.log('Error uploading documents', JSON.stringify(err));

            return {
                failed: true,
                error: err,
            };
        });
};
