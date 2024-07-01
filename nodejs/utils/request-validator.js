const { object, string, bool, number, array } = require('yup');
const { PLATFORMS } = require('../services/influencers/influencers');

exports.validateOpenSearchRequest = async (request) => {
    let validation_schema = object({
        full_name: string().nullable(),
        bio: string().nullable(),
        username: string().nullable(),
        min_followers_count: number().nullable(),
        max_followers_count: number().nullable(),
        is_registered: bool().nullable(),
        is_email: bool().nullable(),
        hashtags: array().of(string()).nullable(),
        platform: string().oneOf(PLATFORMS).nullable(),
        posts_count: number().nullable(),
        reels_count: number().nullable(),
        stats: object({
            average_comments: string().nullable(),
            average_views: string().nullable(),
            eng_rate: string().nullable(),
            reach: string().nullable(),
            average_likes: string().nullable(),
        }).nullable(),
    });

    return await exports.validate(request, validation_schema);
};

exports.validate = async function (requestBody, validationSchema) {
    const validationResult = await validationSchema
        .validate(requestBody, {strict: true})
        .catch((err) => {
            if (process.env.ENV === 'dev') console.log(JSON.stringify(err));
            return err;
        });

    return validationResult.errors;
};


