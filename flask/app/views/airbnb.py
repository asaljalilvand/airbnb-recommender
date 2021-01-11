from flask import Blueprint, render_template, request
import pandas as pd
import json
from .clustering import clusterDataframe, filter, CheckIfIn

airbnb = Blueprint('airbnb', __name__, static_folder='static')
listingDF = pd.read_csv('./app/static/lstaverageDist.csv')


@airbnb.route('/')
def index():
    return render_template('index.html')


@airbnb.route('/filter_map')
def filter_map():
    lat = float(request.args.get('lat'))
    long = float(request.args.get('long'))
    r = float(request.args.get('radius'))
    import sys
    print('radios{}'.format(r), file=sys.stderr)
    return CheckIfIn(listingDF, long, lat, r)


@airbnb.route('/cluster')
def cluster():
    k = request.args.get('k')
    weights = {}
    for key in request.args:
        if key == 'k':
            continue
        weights[key] = int(request.args.get(key))
    result, estimated_clusters, featureDescriptions = clusterDataframe(listingDF, int(k), weights)
    return json.loads(json.dumps({"result": result, "estimated_clusters": estimated_clusters,
                                  "featureDescriptions": featureDescriptions}))


@airbnb.route('/filter')
def filterListings():
    args = request.args;
    filters = {}
    tmp = request.args.get('property_type')
    if tmp != 'Any':
        filters['property_type'] = tmp
    '''tmp = request.args.get('host_response_time')
    if tmp != 'Any':
        filters['host_response_time'] = tmp'''
    if request.args.get('superhost') == '1':
        filters['host_is_superhost'] = 1
    if request.args.get('bathrooms') != '-1':
        filters['bathrooms'] = int(request.args.get('bathrooms'))
    if request.args.get('bedrooms') != '-1':
        filters['bedrooms'] = int(request.args.get('bedrooms'))
    if request.args.get('beds') != '-1':
        filters['beds'] = int(request.args.get('beds'))

    amen = request.args.get('amenities').split(',')
    if 'all' in amen:
        amen = None
    p = request.args.get('price')
    price = None
    if p == '10':
        price = [10, 1000]
    elif p == '1000':
        price = [1000, 2000]
    elif p == '2000':
        price = [2000, 3000]
    return json.loads(json.dumps({"result": filter(filters, amen, listingDF, None, price)}))
