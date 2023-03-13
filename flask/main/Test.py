from flask import request, Flask, json,jsonify ,current_app as app
from flask_restx import Resource, Api,Namespace
import io
import cv2
import re
import os
import numpy as np
import pandas as pd
import math
from PIL import ImageFont, ImageDraw, Image
import matplotlib.pyplot as plt
from skimage.util import invert
from main.OCR import detect_one
from main.ImgProcessing import ImgProcessing
from main.ImgProcessing import SuperRes
#class 가져오기
import sys
sys.path.append("/home/sblim/FontProject/FontSearching")
from font_searching_system_def import search
import time



# 폰트 검색 모델 가져오기
# import sys
# sys.path.append("/home/sblim/FontProject/tensorflow_system/models/research/object_detection/images/map/fontsearching")
# from font_recommendation_based_on_stroke_elements_eunji import StrokeRecommendation
# sys.path.append('/home/sblim/FontProject/tensorflow_system/models/research/object_detection')
# from object_detection_for_system_v2_jiae import object_detection_main
# import time



Test = Namespace('Test')

'''fetch test : 리액트 log에 찍기'''
@Test.route('/users')
class TestUsers(Resource):
    def get(self):
        filename = os.path.join(app.static_folder, 'test.json')

        with open(filename,'r',encoding='UTF8') as test_file:
            data = json.load(test_file)
        return (data)
'''POST 테스트 : '''
@Test.route('/post')
class TestPost(Resource):
    def post(self):
        name = request.args.get('name')
        age = request.args.get('age')
        print(name,age)
        return "POST TEST RESULT :  %s" %name

@Test.route('/fontresult')
class FontResult(Resource):
    def get(self):
        filename = os.path.join(app.static_folder, 'font_res.json')

        with open(filename,'r',encoding='UTF8') as test_file:
            data = json.load(test_file)
        return (data)

@Test.route('/image')
class TestImg(Resource):
    
    def post(file=None):
        if 'file' not in request.files:
            return 'File is missing',404

        # file 받기
        pic_data = request.files['file']
        f = request.files['file']
        filename = pic_data.filename
        filepath = "./main/Result/blob.jpg"
        f.save(filepath)
        #  cmd 창에서 확인하기
        print(pic_data)
        print(filename)
        return 'Good!'

@Test.route('/crop')
class TestCrop(Resource):
    def __init__(self,data):
        self.imgpath = ''
        self.filename = ''
    
    def makeImage(self,tmp_path,filename):
        one_letter = cv2.imread(tmp_path,cv2.IMREAD_GRAYSCALE)
        h,w = one_letter.shape
        control = 0 # 0은 세로연결, 1은 가로 연결
        #갭 이미지 만들기
        # print(w,h)
        if w > h:
            max_l = w
            gap = int((max_l - h)/2)
            control = 0
        elif w< h:
            max_l = h
            gap = int((max_l - w) /2)
            control = 1
        else:
            max_l = w
            control =-1
        # 여백용 이미지 비율 구하기
        ratio = int(0.25 * max_l)


        if control ==0 :
            gap_img = np.ones((gap+ratio,max_l),dtype=np.uint8) *255
        elif control == 1:
            gap_img = np.ones((max_l,gap+ratio),dtype=np.uint8) *255
        else:
            gap_img = np.ones((max_l,ratio),dtype=np.uint8) *255

        print("이미지 여백 만들기 전 shape 확인")
        print(gap_img.shape)
        print(one_letter.shape)
        

        if control ==1 :
            # g_h, g_w = gap_img.shape
            # ol_h,ol_w = one_letter.shape
            # if (g_w != ol_w):
            #     gap_img = np.ones((g_h,ol_h),dtype=np.uint8) *255
            tmp = cv2.hconcat([gap_img,one_letter,gap_img])
            h,w = tmp.shape
            make_big = np.ones((ratio,w),dtype=np.uint8) *255
            finn = cv2.vconcat([make_big,tmp,make_big])
        elif control ==0:
            # g_h, g_w = gap_img.shape
            # ol_h,ol_w = one_letter.shape
            # if (g_h != ol_h):
            #     gap_img = np.ones((ol_h,g_w),dtype=np.uint8) *255
            tmp = cv2.vconcat([gap_img,one_letter,gap_img])
            h,w = tmp.shape
            make_big = np.ones((h,ratio),dtype=np.uint8) *255
            finn = cv2.hconcat([make_big,tmp,make_big])
        else:
            # g_h, g_w = gap_img.shape
            # ol_h,ol_w = one_letter.shape
            # if (g_w != ol_w):
            #     gap_img = np.ones((g_h,ol_h),dtype=np.uint8) *255
            tmp = cv2.hconcat([gap_img,one_letter,gap_img])
            h,w = tmp.shape
            make_big =  np.ones((ratio,w),dtype=np.uint8) *255
            finn = cv2.vconcat([make_big,tmp,make_big])

        print(finn)
        mypath = "/home/sblim/FontProject/tensorflow_system/models/research/object_detection/images/map/input_img/"
        onepath = mypath+filename+".jpg"

        s_finn = SuperRes(finn)
        backtorgb = cv2.cvtColor(s_finn,cv2.COLOR_GRAY2RGB)
        
        c3img = np.repeat(s_finn[:,:,np.newaxis],3,-1)
        cv2.imwrite(onepath, c3img)

        
        # 저장했던 이미지 파일 삭제하기
        # if os.path.exists("./main/Crop/"):
        #   for file in os.scandir("./main/Crop/"):
        #     os.remove(file.path)
        print("잘 들어왔는지 디렉토리 가서 확인")



    def onebyoneCrop(self):

        json = detect_one(self.imgpath)
        word_length = len(json['texts'][0]['symbol'])
        print(json)
        word_img = cv2.imread(self.imgpath,cv2.IMREAD_GRAYSCALE)
        word_img_p = oneimgprocessing(word_img,"3")
        for i in range(word_length):
            filename = json['texts'][0]['symbol'][i]['text']
            # if 'x' in json['texts'][0]['symbol'][i]['vertices'][0]:
            #     x = int(json['texts'][0]['symbol'][i]['vertices'][0]['x'])
            # else:
            #     x = 0
            # if 'y' in json['texts'][0]['symbol'][i]['vertices'][0]:
            #     y = int(json['texts'][0]['symbol'][i]['vertices'][0]['y'])
            # else:
            #     y = 0
            # if 'x' in json['texts'][0]['symbol'][i]['vertices'][1]:
            #     w = int(json['texts'][0]['symbol'][i]['vertices'][1]['x'] - x)
            # else:
            #     w = 0
            # if 'y' in json['texts'][0]['symbol'][i]['vertices'][2]:
            #     h = int(json['texts'][0]['symbol'][i]['vertices'][2]['y'] - y)
            # else:
            #     h = 0
            x = int(json['texts'][0]['symbol'][i]['vertices'][0]['x'])
            y = int(json['texts'][0]['symbol'][i]['vertices'][0]['y'])
            w = int(json['texts'][0]['symbol'][i]['vertices'][1]['x'] - x)
            h = int(json['texts'][0]['symbol'][i]['vertices'][2]['y'] - y)

            if x < 0:
                x = 0
            if y < 0:
                y = 0
            if w < 0:
                w = 1
            if h < 0:
                h = 1
            print(x,y,w,h)
            crop_one_img = word_img_p[y:y+h,x:x+w]
            # oneimgprocessing(crop_one_img,filename)
            tmp_path = "./main/Crop/"+filename+".jpg"

            if w < 100 or h < 100:
                print("need resize")
                ratio_w = int(math.ceil(100 / w))
                ratio_h = int(math.ceil(100 / h))
                if ratio_h < ratio_w:
                    resize_ratio = ratio_w
                else:
                    resize_ratio = ratio_h
                img_resize = cv2.resize(crop_one_img, None, fx=resize_ratio, fy=resize_ratio, interpolation = cv2.INTER_CUBIC)
                # img_resized_b = imgbinarized(img_resize)
                cv2.imwrite(tmp_path,img_resize)
            else:
                cv2.imwrite(tmp_path, crop_one_img)  

            self.makeImage(tmp_path,filename)
            


    def Imagecrop(self,x_1,y_1,w_1,h_1):
        real_img = cv2.imread("./main/Result/blob.jpg",cv2.IMREAD_GRAYSCALE) # gray
        # 이미지 크롭해서 반환하기
        x = int(x_1)
        y = int(y_1)
        w = int(w_1)
        h = int(h_1)
        if x <= 0 :
            x = 1
        if y <= 0 :
            y = 1
        
        crop_img = real_img[y:y+h,x:x+w]
        self.imgpath = "./main/Crop/crop.jpg"
        cv2.imwrite(self.imgpath, crop_img)


        #이미지 전처리 및 저장
        ImgProcessing(crop_img,"test")

        
        # self.onebyoneCrop()

    def post(self):
        start = time.time()
        word = request.form['word']
        x = request.form['x']
        y = request.form['y']
        w = request.form['w']
        h = request.form['h']
        self.Imagecrop(x,y,w,h) # 이미지 자르기
        end = time.time()
        print("@@이미지 저장까지 걸린 시간@@")
        print(end - start , '\n\n')

        
        d = dict()
        obj = search(app.config['IMG2VEC'])
        # obj = search(Img2Vec(model="inception"))
        d['result'] = obj.font_searching(word)
        end = time.time()
        print("@@총 걸린 시간@@")
        print(end - start , '\n\n')
        return (jsonify(d))