from flask import request, Flask, jsonify
from flask_restx import Resource, Api,Namespace
import io
import json
import cv2
import re
import numpy as np
from PIL import ImageFont, ImageDraw, Image
import matplotlib.pyplot as plt
import platform
from PIL import ImageFont, ImageDraw, Image
import matplotlib.pyplot as plt
from google.cloud import vision
from google.cloud.vision_v1 import AnnotateImageResponse
from enum import Enum

OCR = Namespace('OCR')


class FeatureType(Enum):
    PAGE = 1
    BLOCK = 2
    PARA = 3
    WORD = 4
    SYMBOL = 5

# [START vision_text_detection]
def detect_text(path):
    """Detects text in the file."""
    client = vision.ImageAnnotatorClient()

    # [START vision_python_migration_text_detection]
    with io.open(path, 'rb') as image_file:
        content = image_file.read()
    image = vision.Image(content=content)
    response = client.text_detection(image=image)
    texts = response.text_annotations
    # with open(path[0:-5]+'.txt',"w") as f:
    #     f.write(texts[0].description)

    # 정규식
    idx = 0
    json_string = '{"texts":['
    for text in texts:
        if idx == 0:
            idx = idx +1
            continue
        idx = idx + 1
        temp = re.sub(r'[^\w\s]', '', text.description)
        # print('\n"{}"'.format(text.description))
        if temp =='':
            continue
        text_string = '{{"word": "{}",'.format(temp)
        bound_string = '"vertices": ['
        vertices = (['{{"x": {}, "y": {}}}'.format(vertex.x, vertex.y)
                    for vertex in text.bounding_poly.vertices])
        bound_string = bound_string + '{}'.format(','.join(vertices)) +']'
        text_string = text_string + bound_string +'},'
        json_string = json_string + text_string
    json_string =  json_string+']}'
    if response.error.message:
        raise Exception(
            '{}\nFor more info on error messages, check: '
            'https://cloud.google.com/apis/design/errors'.format(
                response.error.message))
    print(json_string)
    print("형태 만들기 위로 확인")
    # print(dump(json_string))
    # data = json.dumps(json_string)
    # return jsonify(data)
    return(json.dumps(json_string))
    # [END vision_python_migration_text_detection]
# [END vision_text_detection]


@OCR.route('/home')
class OCRRun(Resource):
    def get(self):
        path = './static/test2.jpeg'
        return detect_text(path)
