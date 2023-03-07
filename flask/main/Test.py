from flask import request, Flask,g,jsonify, json, current_app as app
from flask_restx import Resource, Api,Namespace
import io
import cv2
import re
import os
import numpy as np
from PIL import ImageFont, ImageDraw, Image
import matplotlib.pyplot as plt
from skimage.util import invert
from main.OCR import detect_one

#class 가져오기
# from main.ImgSearch import ImageSearch
import sys
sys.path.append("/home/sblim/FontProject/tensorflow_system/models/research/object_detection/images/map/fontsearching")
from font_recommendation_based_on_stroke_elements_eunji import StrokeRecommendation
sys.path.append('/home/sblim/FontProject/tensorflow_system/models/research/object_detection')

# 지애 모델로 바꾸고 돌려보기
# from object_detection_for_system_v2_eunji import ObjectDetection
from object_detection_for_system_v2_jiae import object_detection_main
import time
# sys.path.append("/home/sblim/FontProject/tensorflow_system/models/research/object_detection/images/map/fontsearching/img2vec_pytorch")
# from img_to_vec import Img2Vec

# img2vec = Img2Vec(model="inception")



Test = Namespace('Test')

def ImgPreprocessing(pic_data):
    #byte 단위로 읽어들이기
    input_stream = io.BytesIO()
    pic_data.save(input_stream)
    data = np.fromstring(input_stream.getvalue(), dtype=np.uint8)
    real_img = cv2.imdecode(data,1) # 컬러 사진
    real_img = cv2.cvtColor(real_img,cv2.COLOR_BGR2GRAY)
    
    #이미지 확인하기
    # plt.imshow(real_img)
    # plt.show()
    # plt.savefig(real_img,dpi=300,)
    # #erosion
    # kernel2 = cv2.getStructuringElement(cv2.MORPH_RECT,(3,3))
    # erosion=cv2.erode(real_img,kernel2,iterations=1)
    
    # #OpenCV 이미지 이진화
    # max_output_value = 255
    # neighborhood_size = 99
    # subtract_from_mean = 10
    # image_binarized = cv2.adaptiveThreshold(erosion,
    #                                         max_output_value,
    #                                         cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
    #                                         cv2.THRESH_BINARY,
    #                                         neighborhood_size,
    #                                         subtract_from_mean)
    # kernel = np.ones((5,5),np.uint8)
    
    img = cv2.imdecode(data,0)

    kernel2 = cv2.getStructuringElement(cv2.MORPH_RECT,(3,3))
    # erosion
    erosion=cv2.erode(img,kernel2,iterations=1)
    ero_invert = invert(erosion)
    max_output_value = 255   # 출력 픽셀 강도의 최대값
    neighborhood_size = 99
    subtract_from_mean = 10
    image_binarized = cv2.adaptiveThreshold(ero_invert,
                                        max_output_value,
                                        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                        cv2.THRESH_BINARY,
                                        neighborhood_size,
                                        subtract_from_mean)
    
    return(image_binarized)
    

'''fetch test : 리액트 log에 찍기'''
@Test.route('/users')
class TestUsers(Resource):
    def get(self):
        filename = os.path.join(app.static_folder, 'test.json')

        with open(filename,'r',encoding='UTF8') as test_file:
            data = json.load(test_file)
        return (data)


@Test.route('/fontresult')
class SendResult(Resource):
    def get(self):
        filename = os.path.join(app.static_folder, 'font_res_2.json')

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
        
        
        # g.preprossed = ImgPreprocessing(pic_data)

        # plt.imshow(preprossed, cmap='gray')
        # plt.imshow(pic_data,cmap='gray')
        # plt.show()

        

        #  cmd 창에서 확인하기
        print(pic_data)
        print(filename)

        # dir_path = os.path.dirname(os.path.realpath(__file__))
        # dir_path = dir_path +"\Result"
        # saved_file_path = os.path.join(dir_path,filename)
        
        # pic_data.save(saved_file_path, 'JPEG') #saved_file_path 경로에 받은 file 저장
        # plt.savefig(filename,dpi=300,)
        # openCV 테스트
        # test = cv2.imread(filename,cv2.IMREAD_COLOR)
        # print("###OpenCV Test### /n")

        # path_cv = os.listdir(os.path.join(app.config['IMG_FOLDER'],filename))
        # cv2.imwrite('./static/images/img1.jpg',test)
            
        return 'Good!'


'''POST 테스트 : '''
@Test.route('/post')
class TestPost(Resource):
    def post(self):
        name = request.args.get('name')
        age = request.args.get('age')
        print(name,age)
        return "POST TEST RESULT :  %s" %name


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
        if control ==1 :
            gap_img = np.ones((max_l,gap+ratio),dtype=np.uint8) *255
        elif control == 0:
            gap_img = np.ones((max_l,gap+ratio),dtype=np.uint8) *255
        else:
            gap_img = np.ones((max_l,ratio),dtype=np.uint8) *255
        if control ==1 :
            tmp = cv2.hconcat([gap_img,one_letter,gap_img])
            h,w = tmp.shape
            make_big = np.ones((ratio,w),dtype=np.uint8) *255
            finn = cv2.vconcat([make_big,tmp,make_big])
        elif control ==0:
            tmp = cv2.vconcat([gap_img,one_letter,gap_img])
            h,w = tmp.shape
            make_big = np.ones((h,ratio),dtype=np.uint8) *255
            finn = cv2.hconcat([make_big,tmp,make_big])
        else:
            tmp = cv2.hconcat([gap_img,one_letter,gap_img])
            h,w = tmp.shape
            make_big =  np.ones((ratio,w),dtype=np.uint8) *255
            finn = cv2.vconcat([make_big,tmp,make_big])

        print(finn)
        mypath = "/home/sblim/FontProject/tensorflow_system/models/research/object_detection/images/map/input_img/"
        onepath = mypath+filename+".jpg"
        cv2.imwrite(onepath, finn)
        print("잘 들어왔는지 디렉토리 가서 확인")



    def onebyoneCrop(self):

        json = detect_one(self.imgpath)
        # filename = "./font_res.json"
        # with open(filename,'r',encoding='UTF8') as test_file:
        #     data = json.load(test_file)
        word_length = len(json['texts'][0]['symbol'])
        print(json,"한글자만 하는거 잘 됨!!!")
        word_img = cv2.imread(self.imgpath,cv2.IMREAD_GRAYSCALE)
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
                w = 0
            if h < 0:
                h = 0
            

            print(x,y,w,h)
            crop_one_img = word_img[y:y+h,x:x+w]
            kernel2 = cv2.getStructuringElement(cv2.MORPH_RECT,(3,3))
            # erosion
            erosion=cv2.erode(crop_one_img,kernel2,iterations=1)
            ero_invert = invert(erosion)
            max_output_value = 255   # 출력 픽셀 강도의 최대값
            neighborhood_size = 99
            subtract_from_mean = 10
            crop_one_binarized = cv2.adaptiveThreshold(ero_invert,
                                                max_output_value,
                                                cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                                cv2.THRESH_BINARY,
                                                neighborhood_size,
                                                subtract_from_mean)


            tmp_path = "./main/Crop/"+filename+".jpg"
            cv2.imwrite(tmp_path, crop_one_binarized)
            self.makeImage(tmp_path,filename)
            


    def Imagecrop(self,x_1,y_1,w_1,h_1):
        # input_stream = io.BytesIO()
        # img.save(input_stream)
        # data = np.fromstring(input_stream.getvalue(), dtype=np.uint8)
        real_img = cv2.imread("./main/Result/blob.jpg",cv2.IMREAD_GRAYSCALE) # 컬러 사진
        # 이미지 크롭해서 반환하기
        x = int(x_1)
        y = int(y_1)
        w = int(w_1)
        h = int(h_1)
        
        crop_img = real_img[y:y+h,x:x+w]
        # crop_img = real_img[:,10:]

        # kernel2 = cv2.getStructuringElement(cv2.MORPH_RECT,(3,3))
        # # erosion
        # erosion=cv2.erode(crop_img,kernel2,iterations=1)
        # ero_invert = invert(erosion)
        # max_output_value = 255   # 출력 픽셀 강도의 최대값
        # neighborhood_size = 99
        # subtract_from_mean = 10
        # image_binarized = cv2.adaptiveThreshold(ero_invert,
        #                                     max_output_value,
        #                                     cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        #                                     cv2.THRESH_BINARY,
        #                                     neighborhood_size,
        #                                     subtract_from_mean)
        image_binarized = crop_img
        self.imgpath = "./main/Crop/crop.jpg"
        # image_binarized.save(self.imgpath)
        # np.save(self.imgpath,image_binarized)
        # im = Image.fromarray(image_binarized)
        # im.save("tes.jpeg")
        cv2.imwrite(self.imgpath, image_binarized)

        self.onebyoneCrop()

        return(image_binarized)   


    def post(self):
        word = request.form['word']
        x = request.form['x']
        y = request.form['y']
        w = request.form['w']
        h = request.form['h']
        # self.filename = img.filename
        # g.filename = self.filename
        # preCrop = self.Imagecrop(x,y,w,h)
        # plt.imshow(preCrop, cmap='gray')
        # plt.show()
        
        ImgSearchPart = ImgSearch()
        data = ImgSearchPart.get()
#         data = {
#     "result": [
#       "Gugi",
#       "롯데마트행복Bold",
#       "어비 남지은체 Bold",
#       "나눔손글씨 중학생",
#       "어비 남지은체",
#       "함렡체 Light",
#       "유토이미지 고딕 R",
#       "온글잎 만두몽키체",
#       "상주다정다감체",
#       "경기천년바탕 Bold",
#       "온글잎 안될과학궤도체",
#       "나눔손글씨 잘하고 있어",
#       "이순신돋움체L",
#       "HY 바다 L"
#     ]
#   }
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
        obj = StrokeRecommendation(app.config['IMG2VEC'])
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