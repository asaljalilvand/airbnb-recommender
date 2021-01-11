from sklearn.preprocessing import StandardScaler
import pandas as pd
import json
from sklearn.cluster import KMeans

""" format can be seen here
filters={'host_response_time':'within an hour'
        #,'host_verifications':'reviews'
         #,'nbr':'Casey'
         }
verification=['reviews']
amen=['wifi','TV']
"""


def CheckIfIn(df, long, lat, r):
    from math import sin, cos, sqrt, atan2, radians
    import math
    ds = df.copy()

    def dist(row):
        R = 6373.0
        lat1 = radians(dist.lat)
        lon1 = radians(dist.longi)
        lat2 = radians(row['latitude'])
        lon2 = radians(row['longitude'])

        dlon = lon2 - lon1
        dlat = lat2 - lat1

        a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
        c = 2 * atan2(sqrt(a), sqrt(1 - a))

        distance = (R * c)
        return distance

    dist.lat = lat
    dist.longi = long
    ds['r'] = ds.apply(dist, axis=1)
    r = r / 1000
    x = ds.loc[ds['r'] <= (r)]
    y = ds.loc[ds['r'] > (r)]
    meanPriceIn = x.price.mean()
    meanPriceOut = y.price.mean()
    meanDistIn = x['ave_dist'].mean()
    meanDistOut = y['ave_dist'].mean()
    meanReviewIn = x['review_scores_rating'].mean()
    meanReviewOut = y['review_scores_rating'].mean()
    inside = x.shape[0]/ds.shape[0]
    outside=1-inside
    str_res='<ul><li>'+(str  (round(inside*100,2)         ) + '% of the listings are inside the domain</li><li>'
             + str(round(outside*100,2)        ) + '% of the listings are outside the domain</li><li>'
             + str(round(meanDistIn,2)         ) + ' minutes is average transportation time to tourist sites for listings in the domain</li><li>'
             + str(round(meanDistOut,2)        ) + ' minutes is average transportation time to tourist sites for listings out of the domain</li><li>'
             + str(round(meanReviewIn,2)       ) + ' average review score  for listings in the domain</li><li>'
             + str(round(meanReviewOut,2)      ) + ' average review score for listings out of the domain</li></ul>')
    return str_res


##-------- applying filters and stuff
def filter(filters, amen, ds, dist, price):
    if dist != None:
        for dis in dist:
            ds = ds.loc[ds[dis] < dist[dis]]
    # checking if df is empty
    if ds.shape[0] == 0:
        return list(ds['id'])
    if filters != None:
        for filts in filters:
            ds = ds.loc[ds[filts] == filters[filts]]
    # checking if df is empty
    if ds.shape[0] == 0:
        return list(ds['id'])
    if amen != None:
        for elements in amen:
            ds = ds.loc[ds['amenities'].str.contains(elements)]
    if price != None:
        ds = ds.loc[ds['price'] >= price[0]]
        ds = ds.loc[ds['price'] <= price[1]]
    print(ds.shape)
    return list(ds['id'])


### filter is applied before clustering so be careful not to send empty DF
###---------------------------------------
def Cluster(weights, ds, nclusters):
    # checking if df is empty

    textft = ['id', 'name', 'cancellation_policy', 'nbr', 'bed_type',
              'amenities', 'room_type', 'property_type',
              'host_verifications', 'host_response_time',
              'latitude', 'longitude', 'normalPrice']
    # if cluster is empty dont continue
    if ds.shape[0] == 0:
        return ds
    ss = StandardScaler()
    X = ds.copy()
    X.drop(textft, axis=1, inplace=True)
    X[:] = ss.fit_transform(X)
    # applying weights
    if weights is not None:
        for label in weights:
            X[label] = weights[label] * X[label]
    # ------
    kmeans = KMeans(n_clusters=nclusters, algorithm='full')
    kmeans.fit(X)

    X['labels'] = kmeans.predict(X=X)
    ds['labels'] = X['labels']
    return ds


# ----

def clusterDataframe(df, k=10, weights=None):
    textft = ['id', 'cancellation_policy', 'nbr', 'bed_type', 'amenities', 'room_type', 'property_type',
              'host_verifications', 'host_response_time', 'latitude', 'longitude']
    res = Cluster(weights, df, k)
    result = {}
    index = 0
    for listing_id in df['id']:
        result[listing_id] = str(res['labels'][index])
        index = index + 1
    return result, len(set(res['labels'])), describe(res)


"""
#des[('host_response_rate', 'count')] this is how elements can be
# accessed
"""


def describe(res):
    vars = ['price', 'reviews_per_month', 'amenities_num',
            'review_scores_rating', 'labels', 'ave_dist']
    df = pd.DataFrame()
    df = res[vars]
    df = df.groupby('labels').mean()
    des = {}
    for var in vars:
        if var == 'labels':
            continue
        des[var] = json.dumps({"x": df.index.tolist(), "y": df[var].tolist()})
    # x = json.loads(des)
    return des
