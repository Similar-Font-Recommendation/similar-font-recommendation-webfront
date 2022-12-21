import React,{useCallback, Component} from 'react';
import Dropzone from 'react-dropzone';
import {Form,Card} from 'react-bootstrap';
import '../App.css';
import Input from '../assets/Input_img.png';

const FileUpload = ()=>{
    return (
        <>
        <Card style={{marginBottom:'1em'}}>
            <Card.Header  as="h4" style={{padding:'0.6em'}}>이미지 가져오기</Card.Header>
            <Card.Body>
                <Card.Text>
                  <div className="DZ">
                    <Dropzone className="DZ"   multiple={false} onDrop={acceptedFiles => 
                    //Do something with the files
                    ImgPlus({acceptedFiles})
                  }>
                {({getRootProps, getInputProps}) => (
                <section>
                    <div {...getRootProps()}>
                    <input className="dropzone" {...getInputProps({type:'file', accept:'image/*'})} />
                    
                    <p style={{fontSize:'15pt'}}>업로드 할 이미지를 드래그하거나 박스를 <span style={{color:'lightBlue'}}> 클릭</span>하세요</p>
                    
                    
                            </div>
                        </section>
                    )}
                    </Dropzone>
                  </div>
                
                </Card.Text>
                {/* <Card.Img src={Input} /> */}
            </Card.Body>

          </Card> 

        </> 

    );
}


function ImgPlus({img1}){
    console.log({img1});
}
export default FileUpload;