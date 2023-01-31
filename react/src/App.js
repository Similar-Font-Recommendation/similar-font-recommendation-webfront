// import './App.css';
import axios from 'axios';
import React, {useEffect,useState} from 'react';
import {Card, Button} from 'react-bootstrap';
import Dropzone from 'react-dropzone';
import Img from './img.jpeg';
import { Stage, Shape,drawImage, Bitmap } from "@createjs/easeljs";
//rfce
function App() {

  const [ocrdata,setOcrdata]=useState();
  const [fileImage,setFileImage] = useState();
  const [selectocr,setSelectocr] = useState({});
  async function SelectWord(i,x,y,w,h, ocr_word){
      let idx = i;
      let word = ocr_word;
      console.log(i+x+y+w+h);
      setSelectocr({i : i, x : x, y : y, w : w, h: h, ocr_word: ocr_word});
      
  }
  

  async function EventTest(data){
    var canvas = document.getElementById("imageCanvas");
    var img = document.getElementById("preview");
    canvas.width  = img.width;
    canvas.height = img.height;
    const ocr_texts = await data.texts;
    var stage = new Stage("imageCanvas")
    var background = new Shape();
    background.graphics.beginBitmapFill(img);
    background.graphics.drawRect(0,0,img.width,img.height);
    stage.addChild(background);
    
    for (var i = 0; i <ocr_texts.length; i++){
      const ocr_bounds =await ocr_texts[i].vertices;
      const ocr_word = await ocr_texts[i].word;

      var x = ocr_bounds[0].x-10;
      var y = ocr_bounds[0].y-10;
      var w = ocr_bounds[1].x - x + 10;
      var h = ocr_bounds[2].y - y + 10;

      var border = new Shape();
      border.graphics.beginStroke("#000");
      border.graphics.setStrokeStyle(7);
      border.snapToPixel = true;
      border.graphics.drawRect(x, y, w, h);
      stage.addChild(border);

      var rect = new Shape();
      rect.graphics.beginFill("White").drawRect(x,y,w,h);
      rect.alpha = .01;
      rect.graphics.beginStroke("#000");
      rect.graphics.setStrokeStyle(2);
      rect.snapToPixel= true;
      rect.addEventListener("click", function(event) { SelectWord(i,x,y,w,h,ocr_word); });
      stage.addChild(rect);
    }
    stage.update();

  }

  async function fetchData(){
    const response = await fetch("/api/Test/users",{
      headers:{
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    const res = await response.json();
    setOcrdata(res);
    console.log("ocrdata type is"+typeof(ocrdata) +"\nocr is"+ocrdata)
    const next = await EventTest(res)
    
  }


  async function onDrop(pic){    
    var pictureFiles = pic;
    var reader = new FileReader();
    reader.onload = r=>{
      var output = document.getElementById('preview');
      output.src = reader.result;
    };
    reader.readAsDataURL(pictureFiles[0]);
    setFileImage(pictureFiles);

    if(pictureFiles.length >0){
      const imgData = new FormData();
      imgData.append("file",pictureFiles[0]);
      await axios
        .post("./api/Test/image",imgData)
        .then(console.log("onDrop 성공"))
        .then(res=>{
          console.log(res);
        })
        .catch((e)=>{
          console.error(e);
        });
    }
  }

  async function CropGo(){
    var x = selectocr.x
    var y = selectocr.y
    var w = selectocr.w
    var h = selectocr.h

    if(fileImage){
      const imgData = new FormData();
      imgData.append("file",fileImage[0]);
      // imgData.append("jj",JSON.stringify(ocrdata));
      imgData.append("x",x);
      imgData.append("y",y);
      imgData.append("w",w);
      imgData.append("h",h);
      await axios
        .post("./api/Test/crop",imgData)
        .then(console.log("onDrop 성공"))
        .then(res=>{
          console.log(res);
        })
        .catch((e)=>{
          console.error(e);
        });
    }
    
  }

  //Post 예시
  async function onClick(){
    try{
      await axios.post("/api/Test/post",{
        'name' : "ej",
        'age' : 24
      });
      console.log("POST 완료")
    }catch(e){
      console.error(e);
    }

  }
  return (
  <div className="App">
    

    {/* <Card style={{marginBottom:'1em'}}>
        <Card.Header  as="h4" style={{padding:'0.6em'}}>이미지 가져오기</Card.Header>
        <Card.Body>
            <Card.Text>
              <div className="DZ">
                <Dropzone className="DZ"   multiple={false} onDrop={onDrop}>
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
               {/* <Card.Img src={Input} />  
          </Card.Body>

        </Card>  */}
    <div>
    <div className="DZ">
                <Dropzone className="DZ"   multiple={false} onDrop={onDrop}>
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
    <Button onClick ={fetchData}>OCR 후 그림그리기 </Button>
    {/* <Button onClick={onClick}>POST 테스트</Button> */}
    <Button onClick={CropGo}> 크롭 보내주기</Button>
    </div>
     
    <div>
    
        <img className="preview" id="preview"/>
        <canvas className="imageCanvas" id="imageCanvas">이 브라우저는 'canvas'기능을 제공하지 않습니다.</canvas>
    </div>



  </div>
);
}

export default App;
