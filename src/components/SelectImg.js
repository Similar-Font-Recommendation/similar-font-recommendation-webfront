import React from "react";
import { Card ,Button  } from "react-bootstrap";
import CropImg from '../assets/Crop_img.png';
import OCRImg from '../assets/OCR_img.png';
import FileUpload from "./FileUpload";


const SelectImg =() =>{
    return(
        <>
        <FileUpload />
        <Card>
            <Card.Header as="h5">검색할 글자 선택하기</Card.Header>
            <Card.Body>
            <img src={OCRImg} /> {'\n'}
            <Button variant="outline-primary" size="sm">
                검색하기
            </Button>
            </Card.Body>
        </Card>
        </>
    );
}

export default SelectImg;