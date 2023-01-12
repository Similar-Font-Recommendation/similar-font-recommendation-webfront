import React from "react";
import { Card ,Button  } from "react-bootstrap";
import CropImg from '../assets/Crop_img.png';
import OCRImg from '../assets/OCR_img.png';
import FileUpload from "./FileUpload";
import '../App.css';
import { Grid } from "@mui/material";

const SelectImg =() =>{
    return(
        <>
        <Card>
            <Card.Header as="h4" style={{padding:'0.6em'}}>검색할 글자 선택하기</Card.Header>
            <Card.Body>
            <Card.Img src={OCRImg} style={{width: '70%'}}/> {'\n'}
            <Grid container justifyContent="flex-end" >
              <Button variant="outline-primary" style={{marginTop:'0.5em'}}>
                검색하기
              </Button>
            </Grid>
            </Card.Body>
          </Card>
        </>
    );
}

export default SelectImg;