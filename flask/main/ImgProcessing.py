import io
import cv2
import re
import os
import numpy as np
from PIL import ImageFont, ImageDraw, Image
import matplotlib.pyplot as plt
from skimage.util import invert


# 이미지 invert 여부
def imginvert(img):
    # 픽셀 빈도수 세기
    cropTest =img[3:,:10]
    cropTest = cv2.cvtColor(cropTest,cv2.COLOR_BGR2RGB)
    unique, counts = np.unique(cropTest.reshape(-1,3),axis=0,return_counts=True)
    print(unique.shape)
    print(counts.size)
    if counts.size==2:
        print("### 빈도수 확인 ### ")
        print(unique[0], unique[1])
        print(counts[0], counts[1])
        if counts[0] > counts[1]:
            #invert
            print("invert")
            return True
        else:
            # not 
            return False
    else:
        print("### 빈도수 확인 ### ")
        print(unique[0])
        print(counts)
        black = np.array([0,0,0])
        if unique[0] in black:
            print("invert")
            return True
        else:
            return False

# 해상도 높이기
def SuperRes(img):
    sr = cv2.dnn_superres.DnnSuperResImpl_create()
    sr.readModel('./main/ESPCN_x4.pb')
    sr.setModel('espcn', 4)
    result = sr.upsample(img)
    return result

# 이미지 이진화
def imgbinarized(img):
    max_output_value = 255   # 출력 픽셀 강도의 최대값
    neighborhood_size = 99
    subtract_from_mean = 10
    img_binarized = cv2.adaptiveThreshold(img,
                                        max_output_value,
                                        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                        cv2.THRESH_BINARY,
                                        neighborhood_size,
                                        subtract_from_mean)
    
    # 새로운 방법!!!
    ret, dst = cv2.threshold(img, 0, 255, cv2.THRESH_BINARY|cv2.THRESH_OTSU)
    return dst

def oneimgprocessing(crop_one_img,filename):
    
    kernel2 = cv2.getStructuringElement(cv2.MORPH_RECT,(1,1))
    # 한장씩 다 저장해보기....
    npath = "./main/Result/"+filename+"one.jpg"
    cv2.imwrite(npath, crop_one_img)

    #invert test
    # 한장씩 다 저장해보기....
    npath = "./main/Result/"+filename+"one_invert.jpg"
    cv2.imwrite(npath, invert(crop_one_img))

    binarizedd = imgbinarized(crop_one_img)

    # erosion
    # erosion=cv2.erode(crop_one_img,kernel2,iterations=1)
    erosion=cv2.erode(crop_one_img,kernel2,iterations=1)
    # 한장씩 다 저장해보기....
    npath = "./main/Result/"+filename+"two.jpg"
    cv2.imwrite(npath, erosion)   

    # 한장씩 다 저장해보기....
    npath = "./main/Result/"+filename+"_not_invert.jpg"
    cv2.imwrite(npath, binarizedd)

    if imginvert(binarizedd):
        res = invert(binarizedd)
        # 한장씩 다 저장해보기....
        npath = "./main/Result/"+filename+"_invert.jpg"
        cv2.imwrite(npath, res)
        erosion=cv2.erode(res,kernel2,iterations=1)
        # 한장씩 다 저장해보기....
        npath = "./main/Result/"+filename+"_invert_erosion.jpg"
        cv2.imwrite(npath, erosion)   
    else:

        res=cv2.erode(binarizedd,kernel2,iterations=1)
        tmp_path = "./main/Crop/"+filename+"_erosion.jpg"
        cv2.imwrite(tmp_path, res)
    return res
    


