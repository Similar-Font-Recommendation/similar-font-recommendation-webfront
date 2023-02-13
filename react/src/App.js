import './App.css';
import axios, { all } from 'axios';
import React, {useEffect,useState} from 'react';
import {Card, Button} from 'react-bootstrap';
import Dropzone from 'react-dropzone';
import WebFont from 'webfontloader';
import { Stage, Shape,drawImage, Bitmap, uid } from "@createjs/easeljs";

//rfce
function App() {

  const [ocrdata,setOcrdata]=useState();
  const [fileImage,setFileImage] = useState();
  const [selectocr,setSelectocr] = useState([]);
  const [fontResult,setFontResult] = useState();
  const [useList, setUseList] = useState([]);

  let DisplayData;

  let takethem =[];
  let allJson =[];
  
  useEffect(()=>{
    WebFont.load({
      google:{
        families:['Droid Sans', 'Chilanka']
      }
    })
  })


  function findRect(event){
    let x = event.stageX;
    let y = event.stageY;
    var res = 0;

    for(var i = 0; i< takethem.length;i++){
      let r_x = takethem[i][0];
      let r_y = takethem[i][1];
      let r_w = takethem[i][2];
      let r_h = takethem[i][3];
      if(x <= r_x+r_w && x>=r_x &&y <= r_y+r_h && y>=r_y){
        res = i;
        break;
      }
    }
    setSelectocr(allJson[res]);
    const json2 = JSON.stringify(selectocr);
    console.log(json2);
    console.log(allJson[res].vertices);
    console.log(selectocr);
    return (res+1);
    
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
    let object = {};
    for (var i = 0; i <ocr_texts.length; i++){
      const ocr_bounds =await ocr_texts[i].vertices;
      const ocr_word = await ocr_texts[i];
      allJson.push(ocr_word);

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

      let tmparr=[x,y,w,h];
      takethem.push([x,y,w,h]);

      object[`rect${i}`] = new Shape();
      object[`rect${i}`].graphics.beginFill("White").drawRect(x,y,w,h);
      object[`rect${i}`].alpha = .01;
      object[`rect${i}`].graphics.beginStroke("#000");
      object[`rect${i}`].graphics.setStrokeStyle(2);
      object[`rect${i}`].snapToPixel= true;
      object[`rect${i}`].addEventListener("click", function(event) {alert(findRect(event)) });
      stage.addChild(object[`rect${i}`]);
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

    var x = selectocr.vertices[0].x-10;
    var y = selectocr.vertices[0].y-10;
    var w = selectocr.vertices[1].x - x + 10;
    var h = selectocr.vertices[2].y - y + 10;

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



  //폰트 검색 결과 출력
  const ClickResult= ()=>{
    fetch("/api/Test/fontresult")
      .then((response)=>response.json())
      .then((actualData)=>{
        setUseList(actualData.result);
        console.log(useList);
      })
      .catch((err) =>{
        console.log(err.message);
      });
  };



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
    <Button onClick={ClickResult}>결과 리스트화</Button>
    </div>
     
    <div>
    
        <img className="preview" id="preview"/>
        <canvas className="imageCanvas" id="imageCanvas">이 브라우저는 'canvas'기능을 제공하지 않습니다.</canvas>
    </div>


  <div>
    <table>
      <thead>
        <tr>
          <th>번호</th>
          <th>폰트</th>
          <th>글자</th>
        </tr>
      </thead>
      <tbody>
      {useList.map((res, index) =>{
      const Test = "Gugi";
      return(
        <tr key={index}>
          <td> {index +1}</td>
          <td>
            {res}
          </td>
          <td style={{color : 'blue', fontFamily : Test}}>
            탕수육
          </td>
        </tr>
      );  
      })}
      </tbody>
    </table>
  </div>
  </div>
);
}

export default App;
