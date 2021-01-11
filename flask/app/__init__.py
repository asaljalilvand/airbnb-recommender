from flask import Flask
from flask_cors import CORS
from flask_restful import Api

from app.config import Config

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)  # Allows for cross-origin calls

from app.views.airbnb import airbnb

app.register_blueprint(airbnb, url_prefix='/')
