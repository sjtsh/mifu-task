"use strict";
const DDBKeys = require('/opt/nodejs/services/ddb-keys');
const DB = require('/opt/nodejs/utils/db');
exports.formatCampaignMetaContent = function (campaign_meta_content) {
    return {
        id: DDBKeys.getCampaignNumericId(campaign_meta_content.id),
        content_number: DB.removePrefixedId(DDBKeys.TABLE_CAMPAIGNS_SK.CONTENT_REQUESTED, campaign_meta_content.recType),
        date_due: campaign_meta_content.date_due,
        description_txt: campaign_meta_content.description_txt,
        platform: campaign_meta_content.platform,
        detail_txt: campaign_meta_content.detail_txt,
        content_type: campaign_meta_content.content_type,
        isRequired: campaign_meta_content.isRequired
    };
};
exports.formatInfluencerCampaignContent = function (influencer_campaign_content_media) {
    return {
        influencer_id: influencer_campaign_content_media.influencer_id,
        file_key: influencer_campaign_content_media.file_key,
        date_added: influencer_campaign_content_media.date_added,
        content_number: influencer_campaign_content_media.content_number,
        file_name: influencer_campaign_content_media.file_name,
        campaign_id: influencer_campaign_content_media.campaign_id,
        platform: influencer_campaign_content_media.platform,
    };
};
exports.formatCampaignInfluencerSearch = function (campaign_influencer_search) {
    return {
        name: campaign_influencer_search.name,
        is_hashtags: campaign_influencer_search.hashtags == null ? false : true,
        is_locations: campaign_influencer_search.locations == null ? false : true,
        is_search_query: campaign_influencer_search.search_queries == null ? false : true,
        categories: campaign_influencer_search.categories,
        min_followers: campaign_influencer_search.min_followers,
        max_followers: campaign_influencer_search.max_followers
    };
};
