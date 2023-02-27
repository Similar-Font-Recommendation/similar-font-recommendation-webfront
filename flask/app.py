import os
from flask_cors import CORS
from flask import Flask, jsonify,request, render_template, url_for
# API
from flask_restx import Resource, Api 
from main.OCR import OCR 
from main.Test import Test

app = Flask(__name__)
CORS(app)
app.config['DEBUG'] = True

#img file path config
app.config['IMG_FOLDER'] = os.path.join('static','images') 
app.config['JSONIFY_PRETTYPRINT_REGULAR'] = True

#API
api = Api(app, version='1.0', title='Flask API', description='Flask API', doc="/api-docs")
api.add_namespace(OCR,'/api/OCR')
api.add_namespace(Test,'/api/Test')



if __name__ == '__main__':
    app.run(host='0.0.0.0')