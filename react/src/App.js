import './App.css';
import './Fonts.css';
import axios, { all } from 'axios';
import React, {useEffect,useState} from 'react';
import { Container, Divider,Button, Grid, Image, Header, Menu, Message, Segment, Table, Card } from 'semantic-ui-react'
import Dropzone from 'react-dropzone';
import WebFont from 'webfontloader';
import { Stage, Shape,drawImage, Bitmap, uid } from "@createjs/easeljs";
import imageCompression from 'browser-image-compression';
//rfce
function App() {

  const [ocrdata,setOcrdata]=useState();
  const [fileImage,setFileImage] = useState();
  const [selectocr,setSelectocr] = useState([]);
  const [word,setWord] =useState('가나다라마바사');
  const [fontResult,setFontResult] = useState();
  const [useList, setUseList] = useState([]);
  const [imgPath,setImgPath] = useState('');
  const [imgSrc,setImgSrc] = useState('');
  

  //resize
  const [file,setFile] = useState();
  const [fileUrl, setFileUrl] = useState()

  let DisplayData;

  let takethem =[];
  let allJson =[];
  
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
    return (res+1);
    
  }


  async function CtxTest(data){
    var canvas = document.getElementById("imageCanvas");
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0,0,canvas.width,canvas.height);
    var img = document.getElementById("preview");
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img,0,0,img.width,img.height);
    ctx.stroke();

  }

  async function EventTest(data){
    var canvas = document.getElementById("imageCanvas");
    var img = document.getElementById("preview");
    // canvas.width  = img.width;
    // canvas.height = img.height;

    canvas.width  = 500;
    canvas.height = 400;
    const ocr_texts = await data.texts;
    var stage = new Stage("imageCanvas")
    var background = new Shape();
    background.graphics.beginBitmapFill(img);
    stage.addChild(background);
    // let object = {};
    // for (var i = 0; i <ocr_texts.length; i++){
    //   const ocr_bounds =await ocr_texts[i].vertices;
    //   const ocr_word = await ocr_texts[i];
    //   allJson.push(ocr_word);

    //   var x = ocr_bounds[0].x-10;
    //   var y = ocr_bounds[0].y-10;
    //   var w = ocr_bounds[1].x - x + 10;
    //   var h = ocr_bounds[2].y - y + 10;

    //   var border = new Shape();
    //   border.graphics.beginStroke("#000");
    //   border.graphics.setStrokeStyle(7);
    //   border.snapToPixel = true;
    //   border.graphics.drawRect(x, y, w, h);
    //   stage.addChild(border);

    //   let tmparr=[x,y,w,h];
    //   takethem.push([x,y,w,h]);

    //   object[`rect${i}`] = new Shape();
    //   object[`rect${i}`].graphics.beginFill("White").drawRect(x,y,w,h);
    //   object[`rect${i}`].alpha = .01;
    //   object[`rect${i}`].graphics.beginStroke("#000");
    //   object[`rect${i}`].graphics.setStrokeStyle(2);
    //   object[`rect${i}`].snapToPixel= true;
    //   object[`rect${i}`].addEventListener("click", function(event) {findRect(event) });
    //   stage.addChild(object[`rect${i}`]);
    // }
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
    const next = await CtxTest(res)
    
  }


  async function handleFile(file){
    const options ={
      maxSizeMB : 5,
      maxWidthOrHeight : 130
    }
    let ree ;
    
    
    try{
      const compressedFile = await imageCompression(file, options);
      setFile(compressedFile);
      ree=  compressedFile;
      const promise = imageCompression.getDataUrlFromFile(compressedFile);
      promise.then(result=>{
        setFileUrl(result);
      })
    } catch(err){
      console.log("handleFileOnchange 에러")
      console.log(err);
    }
    return (ree);
  }

  


  async function onDrop(pic){    
    var pictureFiles = pic;
  
    
    
    

    //resize해서 파일 처리하기
    let newFile = await handleFile(pictureFiles[0]);
    // let newFileURL = await handleUrlOnChange(newFile);
  
    var reader = new FileReader();
    reader.onload = r=>{
      var output = document.getElementById('preview');
      setImgSrc(reader.result);
      output.src = reader.result;
    };
    // reader.readAsDataURL(pictureFiles[0]);
    reader.readAsDataURL(newFile);

    if(pictureFiles.length >0){
      setImgPath(pictureFiles[0].path);
      const imgData = new FormData();
      // imgData.append("file",pictureFiles[0]);
      imgData.append("file",newFile);
      // console.log(pictureFiles[0]);
      // console.log(typeof(pictureFiles[0]));
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

    setWord(selectocr.word);
    if(fileImage){
      setImgPath(fileImage[0].path);
      const imgData = new FormData();
      imgData.append("file",fileImage[0]);
      // imgData.append("jj",JSON.stringify(ocrdata));
      imgData.append("x",x);
      imgData.append("y",y);
      imgData.append("w",w);
      imgData.append("h",h);
      //여기서 글자값 보내주기
      await axios
        .post("./api/Test/crop",imgData)
        .then((response)=>response.data)
        .then((actualData)=>{
          setUseList(actualData.result);
          console.log(useList);
        })
        .catch((err) =>{
          console.log(err.message);
        }); 
    }
    
  }

  function OneClassGet(){
    axios.get("/api/Test/search",
      {params:{imgpath:imgPath}}
    )
    .then((actualData)=>{
      console.log(actualData.data);
    })
    .catch((err)=>{
      console.log(err);
    });
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
      <Button onClick ={fetchData}>OCR 후 그림그리기 </Button>
      {/* <Button onClick={onClick}>POST 테스트</Button> */}
      <Button onClick={CropGo}> 단어전송 및 결과 반환</Button>
      <Button onClick={ClickResult}>결과 리스트화</Button>
      <Button onClick={OneClassGet}>이미지경로테스트</Button>
    </div>
    <div>
    
        {/* <canvas className="imageCanvas" id="imageCanvas">이 브라우저는 'canvas'기능을 제공하지 않습니다.</canvas> */}
    </div>



{/* semantic Grid test */}
  <div>
  <Grid columns={2}>
    <Grid.Row>
      <Grid.Column>
        <p>1</p>
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
        <img className="preview" id="preview"/>
        <Button onClick ={fetchData}>OCR 후 그림그리기 </Button>
      
        
      </Grid.Column>
     
      <Grid.Column>
      <canvas className="imageCanvas" id="imageCanvas">이 브라우저는 'canvas'기능을 제공하지 않습니다.</canvas>
    
      </Grid.Column>

      <Grid.Column>
        <p>3</p>
        <Table celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>순위</Table.HeaderCell>
              <Table.HeaderCell>폰트명</Table.HeaderCell>
              <Table.HeaderCell>글자</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
          {useList.map((res, index) =>{
            
            const font = res +', "YWDA"';
            console.log(font);
            const TdStyle = {
              fontFamily: font,
              margin : 3,
              color : 'blue'
            };
            return(
              <tr key={index}>
                <td> {index +1}</td>
                <td>
                  {res}
                </td>
                <td style={TdStyle}>
                  {word}
                </td>
              </tr>
            );  
            })} 
          </Table.Body>

        </Table>
      </Grid.Column>
    </Grid.Row>

  </Grid>
  </div>
  </div>
);
}

export default App;
