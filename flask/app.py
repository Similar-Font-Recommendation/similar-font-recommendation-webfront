import os
import io
import cv2
import re
import numpy as np
import matplotlib.pyplot as plt
from flask_cors import CORS
# from flask_cors import CORS
from flask import Flask, jsonify,request, render_template, url_for
# Google OCR
import platform
from PIL import ImageFont, ImageDraw, Image
from google.cloud import vision
from enum import Enum

app = Flask(__name__)
CORS(app)
app.config['DEBUG'] = True
#img file path config
app.config['IMG_FOLDER'] = os.path.join('static','images') 
app.config['JSONIFY_PRETTYPRINT_REGULAR'] = True

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
    print(response)

    document = response.full_text_annotation
    bounds = []
    #Collect specified feature bounds by enumerating all document features
    for page in document.pages:
        for block in page.blocks:
            for paragraph in block.paragraphs:
                # for word in paragraph.words:
                    # for symbol in word.symbols:
                    #     if feature == FeatureType.SYMBOL:
                    #         print("symbol")
                            # bounds.append(symbol.bounding_box)

                    # if feature == FeatureType.WORD:
                    #     print("word")
                        # bounds.append(word.bounding_box)        
                bounds.append(paragraph.bounding_box)
    print("for문은 돌았다")
    type(bounds)
    num = 1
    for i in bounds:
        print(num)
        num +=1
        print(i)

    texts = response.text_annotations
    with open(path[0:-5]+'.txt',"w") as f:
        f.write(texts[0].description)
    # 정규식
    print('Texts:')
    
    for text in texts:
        temp = re.sub(r'[^\w\s]', '', text.description)
        # print('\n"{}"'.format(text.description))
        if temp =='':
            continue
        print('\n"{}"'.format(temp))
        vertices = (['({},{})'.format(vertex.x, vertex.y)
                    for vertex in text.bounding_poly.vertices])

        print('bounds: {}'.format(','.join(vertices)))

    if response.error.message:
        raise Exception(
            '{}\nFor more info on error messages, check: '
            'https://cloud.google.com/apis/design/errors'.format(
                response.error.message))
    # [END vision_python_migration_text_detection]
# [END vision_text_detection]


# Members API Route

@app.route('/home')
def home():
    path = './static/test2.jpeg'
    detect_text(path)
    return 'Hello world'




'''fetch test : 리액트 log에 찍기'''
@app.route('/api/users')
def users():
    return {"members": [{"id" : 1, "name" : "test"},
                        {"id" : 2, "name" : "eunji"}]
    }

@app.route('/api/image', methods=['POST'])
def image(file=None):
    # parsed_request = request.files.get('file')
    # fileName = request.form.get('name')

    if request.method == 'POST':
        if 'file' not in request.files:
            return 'File is missing',404

        # file 받기
        pic_data = request.files['file']
        #byte 단위로 읽어들이기
        input_stream = io.BytesIO()
        pic_data.save(input_stream)
        data = np.fromstring(input_stream.getvalue(), dtype=np.uint8)
        real_img = cv2.imdecode(data,1) # 컬러 사진
        real_img = cv2.cvtColor(real_img,cv2.COLOR_BGR2GRAY)
        
        #이미지 확인하기
        #plt.imshow(real_img)
        #plt.show()

        #OpenCV 이미지 이진화
        max_output_value = 255
        neighborhood_size = 99
        subtract_from_mean = 10
        image_binarized = cv2.adaptiveThreshold(real_img,
                                                max_output_value,
                                                cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                                cv2.THRESH_BINARY,
                                                neighborhood_size,
                                                subtract_from_mean)
        kernel = np.ones((5,5),np.uint8)
        opening = cv2.morphologyEx(real_img,cv2.MORPH_OPEN,kernel)

        plt.imshow(opening, cmap='gray')
        plt.show()

        filename = pic_data.filename

        #  cmd 창에서 확인하기
        print(pic_data)
        print(filename)

        dir_path = os.path.dirname(os.path.realpath(__file__))
        dir_path = dir_path +"\static"
        saved_file_path = os.path.join(dir_path,filename)
        pic_data.save(saved_file_path) #saved_file_path 경로에 받은 file 저장
        
        # openCV 테스트
        # test = cv2.imread(filename,cv2.IMREAD_COLOR)
        # print("###OpenCV Test### /n")

        # path_cv = os.listdir(os.path.join(app.config['IMG_FOLDER'],filename))
        # cv2.imwrite('./static/images/img1.jpg',test)
        
    return 'Good!'


   



'''POST 테스트 : '''
@app.route('/api/post',methods=["POST"])
def post_test():
    name = request.args.get('name')
    age = request.args.get('key')
    
    return "POST TEST RESULT :  %s" %name

if __name__ == '__main__':
    app.run(debug=True)