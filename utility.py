import pandas as pd
import nltk
from collections import Counter
import json
import string

input = pd.read_csv('reviews_dec18.csv')
listings = pd.read_csv('cleansed_listings_dec18.csv', encoding="ISO-8859-1")
listings = listings[['id', 'host_name']]
input.drop('date', axis=1, inplace=True)
input.drop('id', axis=1, inplace=True)
input.drop('reviewer_id', axis=1, inplace=True)
input.drop('reviewer_name', axis=1, inplace=True)
stop_words = set(nltk.corpus.stopwords.words('english'))
table = str.maketrans('', '', string.punctuation)

revDict = {}
for index in range(len(input['comments'])):
    id = input['listing_id'][index]
    comment = input['comments'][index]
    comment = str(comment).lower()
    comment = comment.encode("ascii", errors="ignore").decode()
    if id in listings['id']:
        host_name = listings['host_name'][listings.loc[listings['id'] == id].index[0]]
        host_name = str(host_name).lower()
        host_name_tokenize = nltk.tokenize.word_tokenize(host_name)
        for name in host_name_tokenize:
            comment = comment.replace(name, '')
    words = nltk.tokenize.word_tokenize(comment)
    words = [w.translate(table) for w in words]
    words = [word for word in words if word.isalpha()]
    words = [w for w in words if not w in stop_words]
    comment = ''
    for word in words:
        comment = comment + " " + word
    if id not in revDict:
        revDict[id] = comment
    else:
        revDict[id] = revDict[id] + ' ' + comment

for key in revDict:
    revDict[key] = json.dumps(dict(Counter(revDict[key].split()).items()))
df = pd.DataFrame(list(revDict.items()), columns=['listing_id', 'comments'])
df.to_csv('reviews.csv', encoding='utf-8', index=False)
