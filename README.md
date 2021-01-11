# Airbnb Recommender System
**Final Project for CSCI 6612: Visual Analytics**

**Dalhousie University, Fall 2019**

## Introduction
This project aims to construct a recommender system for Airbnb listings. 
As the coursename dictates, this project consists of two significant parts,
machine learning, and visualization.On the machine learning side, 
core implementation is a K-means clustering algorithm to clusterlistings.
On the other part, some of the key features are maps, listing details, 
and some analysisto ease the choice among the options.  Although 
establishing a machine learning system topredict some of the features 
in the context of Airbnb is not the goal of this project, we havereached 
some good results in terms of accuracy. Using the recommender system, 
the searchspace for the users will be narrowed down to a select set of 
options to choose from among them.

[Live Demo on Heroku](airbnb-recommender.herokuapp.com)

## Running the project:
```
cd flask
virtualenv -p python3 .\venv
.\venv\bin\activate.bat
pip install -r requirements.txt
python main.py
```
After you have the backend running, please navigate to:
http://localhost:5000/

## Dataset
[Melbourne Airbnb Open Data](https://www.kaggle.com/tylerx/melbourne-airbnb-open-data)
## Map view
Following is the list of available base layers and overlays to choose from
using the toolbox on the top right
 of the map.
* Street view
* Price heatmap view
* Airbnb listings
* Tourist attractions
* Neighborhoods
![](https://raw.githubusercontent.com/AsalJalilvand/airbnb-recommender/master/screenshots/map.png)
## Fitering listings
Use "Open Sidebar" and use the input form and "filter" button.
![](https://raw.githubusercontent.com/AsalJalilvand/airbnb-recommender/master/screenshots/filter.png)

## Filtering area on map
Use the toolbox on the right of map, the circle icon for drawing a circle, 
edit and trash buttons for editing and removing the circle. Once you defined
the circle, use "Filter Area(Select on map)" button for filterin.
<br>
* If you deleted a circle, please use "Filter Area(Select on map)" button again
to see all airbnbs in the map again.
![](https://raw.githubusercontent.com/AsalJalilvand/airbnb-recommender/master/screenshots/area_filter.PNG)  
## Airbnb review sentiment analysis
Select an Airbnb from the listings and click on the "Analyze reviews" button
on the pop-up.
![](https://raw.githubusercontent.com/AsalJalilvand/airbnb-recommender/master/screenshots/sentiment.png)

## Clustering
Select number of clusters with "Number of K-Means clusters" input and 
use sliders to adjust weight of each feature for clustering. Then use "cluster"
button to see the results on map. After each adjustment of sliders you need
to push "cluster" button again to see the results.

**clustering**

![](https://raw.githubusercontent.com/AsalJalilvand/airbnb-recommender/master/screenshots/clustering.png)

**cluster analysis**

![](https://raw.githubusercontent.com/AsalJalilvand/airbnb-recommender/master/screenshots/cluster_analysis.png)

**adjusting weight of attributes**

![](https://raw.githubusercontent.com/AsalJalilvand/airbnb-recommender/master/screenshots/weight_adjust.png)

## Contributors
[Soheil Latifi](mailto:Soheil.Latifi@dal.ca)

[Asal Jalilvand](mailto:Asal.Jalilvand@dal.ca)

[Kewei Ma](mailto:Kewei.Ma@dal.ca)

[Mirerfan Gheibi](https://github.com/mirerfangheibi)
