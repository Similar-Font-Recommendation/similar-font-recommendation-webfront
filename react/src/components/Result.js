import React from "react";
import { Card } from "react-bootstrap";
import ResultTable from './ResultTable';
import '../App.css';
import Crop_img from '../assets/Crop_img.png';
import Result1 from '../assets/Result_1.png';
import Result2 from '../assets/Result_2.png';
import Result3 from '../assets/Result_3.png';
import Result4 from '../assets/Result_4.png';
import Result5 from '../assets/Result_5.png';


const Result = () =>{
    return(
        <>
            <Card>
            <Card.Header as="h4" style={{padding:'0.6em', maxBlockSize:'800px'}}>검색 결과</Card.Header>
            <Card.Body>
            
            {/* <Card.Text>선택한 글자</Card.Text> */}
            <Card.Title>선택한 글자</Card.Title>
            <img src={Crop_img} style={{width: '30%'}} />
            <ResultTable Result1={Result1} Result2={Result2} Result3={Result3} Result4={Result4} Result5={Result5} />
            </Card.Body>
          </Card>
        </>
    );

}
export default Result;