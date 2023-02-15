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
#class 가져오기
from main.ImgSearch import ImageSearch


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
        filepath = "./main/Result/"+filename+'.png'
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
    
    def Imagecrop(self,x_1,y_1,w_1,h_1):
        # input_stream = io.BytesIO()
        # img.save(input_stream)
        # data = np.fromstring(input_stream.getvalue(), dtype=np.uint8)
        real_img = cv2.imread("./main/Result/blob.png",0) # 컬러 사진
        # 이미지 크롭해서 반환하기
        x = int(x_1)
        y = int(y_1)
        w = int(w_1)
        h = int(h_1)
        
        # crop_img = real_img[y:y+h,x:x+w]
        crop_img = real_img[:,10:]

        kernel2 = cv2.getStructuringElement(cv2.MORPH_RECT,(3,3))
        # erosion
        erosion=cv2.erode(crop_img,kernel2,iterations=1)
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
        self.imgpath = "./main/Crop/crop.png"
        # image_binarized.save(self.imgpath)
        # np.save(self.imgpath,image_binarized)
        # im = Image.fromarray(image_binarized)
        # im.save("tes.jpeg")
        plt.imsave(self.imgpath,image_binarized)
        return(image_binarized)   


    def post(self):
        word = request.form['word']
        x = request.form['x']
        y = request.form['y']
        w = request.form['w']
        h = request.form['h']
        # self.filename = img.filename
        # g.filename = self.filename
        preCrop = self.Imagecrop(x,y,w,h)
        # plt.imshow(preCrop, cmap='gray')
        # plt.show()

        # 이미지 검색!
        # obj = ImageSearch(word)
        # d = dict()
        # d['result'] = obj.searchpart()
        # print(d)
        # return jsonify(d)
        
        filename = os.path.join(app.static_folder, 'font_res_2.json')
        with open(filename,'r',encoding='UTF8') as test_file:
            data = json.load(test_file)
        return (data)

   
## Imgpath test
@Test.route('/search')
class ImgSearch(Resource):
     def get(self):
        #객체 생성
        # param = request.args.get('imgpath',default='./set',type=str)
        obj = ImageSearch("탕수육")
        d = dict()
        d['result'] = obj.searchpart()
        print(d)
        return jsonify(d)