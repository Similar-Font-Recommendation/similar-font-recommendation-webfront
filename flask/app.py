import os
from flask_cors import CORS
from flask import Flask, jsonify,request, render_template, url_for
# API
from flask_restx import Resource, Api 
from main.OCR import OCR 
from main.Test import Test
import sys
sys.path.append("/home/sblim/FontProject/FontSearching/img2vec_pytorch")

from img_to_vec import Img2Vec


app = Flask(__name__)
CORS(app)
app.config['DEBUG'] = True

#img file path config
app.config['IMG_FOLDER'] = os.path.join('static','images') 
app.config['JSONIFY_PRETTYPRINT_REGULAR'] = True
app.config['IMG2VEC'] =Img2Vec(model="inception")

s_model = app.config['IMG2VEC']


#API
api = Api(app, version='1.0', title='Flask API', description='Flask API', doc="/api-docs")
api.add_namespace(OCR,'/api/OCR')
api.add_namespace(Test,'/api/Test')



if __name__ == '__main__':
    app.run(host='0.0.0.0')