from flask import request, Flask, json, current_app as app
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
from main.ImgProcessing import oneimgprocessing
from main.ImgProcessing import SuperRes

# 폰트 검색 모델 가져오기
import sys
sys.path.append("/home/sblim/FontProject/tensorflow_system/models/research/object_detection/images/map/fontsearching")
from font_recommendation_based_on_stroke_elements_eunji import StrokeRecommendation
sys.path.append('/home/sblim/FontProject/tensorflow_system/models/research/object_detection')
from object_detection_for_system_v2_jiae import object_detection_main
import time



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
        print("!!!!!!!!!!!!!!확인하기!!!!!!!!!!")
        print(json)
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
        # input_stream = io.BytesIO()
        # img.save(input_stream)
        # data = np.fromstring(input_stream.getvalue(), dtype=np.uint8)
        real_img = cv2.imread("./main/Result/blob.jpg",cv2.IMREAD_GRAYSCALE) # gray
        # 이미지 크롭해서 반환하기
        x = int(x_1)
        y = int(y_1)
        w = int(w_1)
        h = int(h_1)
        
        crop_img = real_img[y:y+h,x:x+w]
        #이미지 해상도 높이기
        self.imgpath = "./main/Crop/crop.jpg"
        cv2.imwrite(self.imgpath, crop_img)

        self.onebyoneCrop()

    def post(self):
        # word = request.form['word']
        x = request.form['x']
        y = request.form['y']
        w = request.form['w']
        h = request.form['h']
        # self.filename = img.filename
        # g.filename = self.filename
        self.Imagecrop(x,y,w,h) # 이미지 자르기
        # plt.imshow(preCrop, cmap='gray')
        # plt.show()
        
        ImgSearchPart = ImgSearch()
        data = ImgSearchPart.get()
        return (data)

   
## Imgpath test
@Test.route('/search')
class ImgSearch(Resource):
     def get(self):
        start = time.time()
        #객체 생성
        print('\n\n\n@@@@@@@@@@@@@@1. 형태소 추출@@@@@@@@@@@@@@@@')
        end = time.time()
        print(f"{end - start:.5f} sec\n\n\n")
        object_detection_main()
        # osObject = ObjectDetection()
        # tmp = osObject.findObject()
        print('\n\n\n******************1.1. 형태소 추출 완료!!!******************')
        end = time.time()
        print(f"{end - start:.5f} sec\n\n\n")
        print('\n\n\n******************2. 폰트 검색******************')
        end = time.time()
        print(f"{end - start:.5f} sec\n\n\n")
        start_2 = time.time() # 2 -> 3까지 얼마나??
        end_2 = time.time()
        print('\n****2 -> 3 시작\n' )
        print(f"{end_2 - start_2:.5f} sec\n\n\n")
        mypath ="/home/sblim/FontProject/tensorflow_system/models/research/object_detection/images/map/fontsearching/"
        # ##### 3. 획요소 특징 벡터 파일 로드
        bbichim_df = pd.read_csv(mypath+'형태소별 특징벡터/bbichim_clustering_feature_vector.csv').drop(['fontname'], axis=1)
        buri_df = pd.read_csv(mypath+'형태소별 특징벡터/buri_clustering_feature_vector.csv').drop(['fontname'], axis=1)
        kkeokim_df = pd.read_csv(mypath+'형태소별 특징벡터/kkeokim_clustering_feature_vector.csv').drop(['fontname'], axis=1)
        kkokjijum_df = pd.read_csv(mypath+'형태소별 특징벡터/kkokjijum_clustering_feature_vector.csv').drop(['fontname'], axis=1)
        sangtu_df = pd.read_csv(mypath+'형태소별 특징벡터/sangtu_clustering_feature_vector.csv').drop(['fontname'], axis=1)
        stroke_df = [bbichim_df, buri_df, kkeokim_df, kkokjijum_df, sangtu_df]

        # ##### 3 - 1. 클러스터 중심점 벡터 파일 로드
        bbichim_centroid = pd.read_csv(mypath+"클러스터 중심점/bbichim_cluster_centers_.csv")
        buri_centroid = pd.read_csv(mypath+"클러스터 중심점/buri_cluster_centers_.csv")
        kkeokim_centroid = pd.read_csv(mypath+"클러스터 중심점/kkeokim_cluster_centers_.csv")
        kkokjijum_centroid = pd.read_csv(mypath+"클러스터 중심점/kkokjijum_cluster_centers_.csv")
        sangtu_centroid = pd.read_csv(mypath+"클러스터 중심점/sangtu_cluster_centers_.csv")
        centroid_df = [bbichim_centroid, buri_centroid, kkeokim_centroid, kkokjijum_centroid, sangtu_centroid]


        obj = StrokeRecommendation(app.config['IMG2VEC'],stroke_df, centroid_df)
        obj.find_font()
        print('\n\n\n******************2.2. 폰트 검색 완료!!******************')
        end = time.time()
        print(f"{end - start:.5f} sec\n\n\n")

        filename = os.path.join(app.static_folder, 'font_result.json')
        with open(filename,'r',encoding='UTF8') as test_file:
            data = json.load(test_file)

        end_2 = time.time()
        print('\n****2 -> 2.2 폰트 검색 완료까지\n' )
        print(f"{end_2 - start_2:.5f} sec\n\n\n")
        print('\n\n\n******************3. 검색 결과 로드 완료!!******************')
        end = time.time()
        print(f"{end - start:.5f} sec\n\n\n")

        end_2 = time.time()
        print('\n****2 -> 3 검색 결과 로드 완료까지\n' )
        print(f"{end_2 - start_2:.5f} sec\n\n\n")


        return (data)