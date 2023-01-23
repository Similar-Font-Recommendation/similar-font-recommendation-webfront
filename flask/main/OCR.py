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

def detect_text(path):
    """Detects text in the file."""
    client = vision.ImageAnnotatorClient()
    with io.open(path, 'rb') as image_file:
        content = image_file.read()
    image = vision.Image(content=content)
    response = client.text_detection(image=image)
    texts = response.text_annotations

    # 정규식
    idx = 0
    res_json = dict() # texts
    l = [] # word 와 vertices 모임 , list
    for text in texts:
        if idx == 0:
            idx = idx +1
            continue
        idx = idx + 1
        res_text_desc = re.sub(r'[^\w\s]', '', text.description)
        if res_text_desc =='':
            continue
        # JSON 형태로 만들기
        vertices = [] # verticles : vertex 모임 , list
        vertex = dict() # vertex : x, y , dict
        for j in text.bounding_poly.vertices:
            vertex['x'] = j.x
            vertex['y'] = j.y
            vertices.append(vertex)
        w = dict()
        w['word'] = res_text_desc
        w['vertices'] = vertices
        l.append(w)

    res_json['texts'] = l
    if response.error.message:
        raise Exception(
            '{}\nFor more info on error messages, check: '
            'https://cloud.google.com/apis/design/errors'.format(
                response.error.message))
    print(res_json)
    return(jsonify(res_json))



@OCR.route('/home')
class OCRRun(Resource):
    def get(self):
        path = './static/test2.jpeg'
        return detect_text(path)
