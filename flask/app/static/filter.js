

function getWeights() {
    features = ['host_response_rate', 'host_is_superhost', 'host_identity_verified',
        'accommodates', 'bathrooms', 'bedrooms', 'beds', 'price',
        'security_deposit', 'cleaning_fee', 'guests_included', 'extra_people',
        'number_of_reviews', 'review_scores_rating', 'review_scores_accuracy',
        'review_scores_cleanliness', 'review_scores_checkin',
        'review_scores_communication', 'review_scores_location',
        'review_scores_value', 'reviews_per_month', 'hv', 'hrt', 'rt',
        'amenities_num', 'res', 'ave_dist'];
    params = "&";
    for (i = 0; i < features.length; i++) {
        params += "&" + features[i] + "=" + document.getElementById(features[i]).value;
    }
    return params;
}