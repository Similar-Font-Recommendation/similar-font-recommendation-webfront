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
    response = client.document_text_detection(image=image)
    document = response.full_text_annotation
    arr_word =[]
    arr_symbol =[]
    
    # for word in document.pages.blocks.paragraphs.words:
    #     for symbol in word.symbols:
    #         arr_symbol.append(symbol.bounding_box)
    #     arr_word.append(word.bounding_box)

    bp = 1 # bp가 0이면 특수기호이므로 패스하기
    res_json = dict() # l의 json화
    l = [] # word와 symbol의 모임, list
    for page in document.pages:
        for block in page.blocks:
            for paragraph in block.paragraphs:
                for word in paragraph.words:
                    # symjson = dict() # 심볼 모음을 json화
                    symlist =[] # 심볼 모음
                    for symbol in word.symbols:
                            res_text = re.sub(r'[^\w\s]','',symbol.text)
                            vertices =[] #(한글자!)vertex 모임, list
                            if res_text =='': # 특수기호라면
                                bp = 0
                                continue
                            else:
                                for j in symbol.bounding_box.vertices:
                                    vertex = dict() # vertex : x, y ,dict
                                    vertex['x'] = j.x
                                    vertex['y'] = j.y
                                    vertices.append(vertex)
                                s = dict() # 심볼 하나 {}로 묶어서 symlist에 추가해주기
                                s['text'] = res_text
                                s['vertices'] = vertices
                                symlist.append(s) # [{}]

                    if bp == 0: # 특수기호라면
                        bp =1
                    else:
                        # symjson['symbol'] = symlist
                        wertices =[]
                        for j in word.bounding_box.vertices:
                            wertex = dict()
                            wertex['x'] = j.x
                            wertex['y'] = j.y
                            wertices.append(wertex)
                        w = dict() # 단어vertices[{x,y},{x,y}, ...], 심볼[{한글자, vertices[{x,y}{x,y}{x,y}{x,y}]}, ...]
                        w['wertex'] = wertices
                        w['symbol'] = symlist
                        l.append(w)
    res_json['texts'] = l
    print(res_json)
    
    if response.error.message:
        raise Exception(
            '{}\nFor more info on error messages, check: '
            'https://cloud.google.com/apis/design/errors'.format(
                response.error.message))
    return(jsonify(res_json))



@OCR.route('/home')
class OCRRun(Resource):
    def get(self):
        path = './static/test2.jpeg'
        return detect_text(path)
