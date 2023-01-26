from flask import request, Flask,jsonify, json, current_app as app
from flask_restx import Resource, Api,Namespace
import io
import cv2
import re
import os
import numpy as np
from PIL import ImageFont, ImageDraw, Image
import matplotlib.pyplot as plt
# from skimage.util import invert

Test = Namespace('Test')

def ImgPreprocessing(pic_data):
    #byte 단위로 읽어들이기
    input_stream = io.BytesIO()
    pic_data.save(input_stream)
    data = np.fromstring(input_stream.getvalue(), dtype=np.uint8)
    real_img = cv2.imdecode(data,1) # 컬러 사진
    real_img = cv2.cvtColor(real_img,cv2.COLOR_BGR2GRAY)
    
    #이미지 확인하기
    #plt.imshow(real_img)
    #plt.show()

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


@Test.route('/p')
class TestHome(Resource):
    def get(self):
        print("P")
        return("성공?")


'''fetch test : 리액트 log에 찍기'''
@Test.route('/users')
class TestUsers(Resource):
    def get(self):
        filename = os.path.join(app.static_folder, 'test.json')

        with open(filename,'r',encoding='UTF8') as test_file:
            data = json.load(test_file)
        return (data)
    
@Test.route('/json')
class Testjson(Resource):
    def get(self):
        v = []
        temp = {"x":24, "y":40}
        v.append(temp)
        temp = {"x" : 4 , "y": 33}
        v.append(temp)
        # verticle 따로 모으기


        l = []

        t1={"id":1, "name":"test"}
        t1["verticles"]= v
        l.append(t1)
        t2 ={"id":2, "name":"eunji"}
        t2["verticles"] =v
        l.append(t2)
        # ... 이렇게 쭉 dict를 모으고

        b = dict()
        b['texts'] = l
        #마지막에 최종 dict 추가

        res = json.dumps(b)
        return jsonify(b)


@Test.route('/image')
class TestImg(Resource):
    
    def post(file=None):
        # parsed_request = request.files.get('file')
        # fileName = request.form.get('name')

        if request.method == 'POST':
            if 'file' not in request.files:
                return 'File is missing',404

            # file 받기
            pic_data = request.files['file']
            preprossed = ImgPreprocessing(pic_data)

            plt.imshow(preprossed, cmap='gray')
            plt.show()

            filename = pic_data.filename

            #  cmd 창에서 확인하기
            print(pic_data)
            print(filename)

            dir_path = os.path.dirname(os.path.realpath(__file__))
            dir_path = dir_path +"\Result"
            saved_file_path = os.path.join(dir_path,filename)
            # pic_data.save(saved_file_path) #saved_file_path 경로에 받은 file 저장
            plt.savefig(filename,dpi=300)
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
        age = request.args.get('key')
        return "POST TEST RESULT :  %s" %name
