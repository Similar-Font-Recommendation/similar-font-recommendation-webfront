import './App.css';
import './Fonts.css';
// import './test.css'
import axios from 'axios';
import React, {createRef, useEffect,useState} from 'react';
import { Button, Grid,Loader,Dimmer, Segment, Table,  Progress} from 'semantic-ui-react'
import Dropzone from 'react-dropzone';
import imageCompression from 'browser-image-compression';
import SetTimer from './components/SetTimer';


//rfce
function App() {

  const [ocrdata,setOcrdata]=useState();
  const [selectocr,setSelectocr] = useState([]);
  const [word,setWord] =useState('가나다라마바사');
  const [useList, setUseList] = useState([]);
  const [imgPath,setImgPath] = useState('');
  const [imgSrc,setImgSrc] = useState('');
  
  //resize
  const [file,setFile] = useState();
  const [fileUrl, setFileUrl] = useState()

  //드래그
  const [isDragging, setIsDragging] = useState(false);
  const [isOCR,setIsOCR] = useState(false);
  const [isShow,setIsShow] = useState(true);

  //progress bar 
  const [count,setCount] = useState(0);
  const [percent,setPercent] = useState(0);


  let takethem =[];
  let allJson =[];
  let isSelected = false;

  function findRect(x,y,ctx2,canvas2){
    //canvas 버전으로 바꾸기
    var res = 0;
    for(var i = 0; i< takethem.length;i++){
      let r_x = takethem[i][0];
      let r_y = takethem[i][1];
      let r_w = takethem[i][2];
      let r_h = takethem[i][3];
      if(x <= r_x+r_w && x>=r_x &&y <= r_y+r_h && y>=r_y &&isSelected===false){
        res = i;
        isSelected = true;
        
        //draw in selectedCanvas
        var word_canvas = document.getElementById("selectedCanvas");
        word_canvas.width = r_w;
        word_canvas.height = r_h;
        var ctx3 = word_canvas.getContext("2d");
        var img_3 = document.getElementById("preview");

        ctx3.clearRect(0,0,word_canvas.width,word_canvas.height);
        ctx3.drawImage(img_3,r_x,r_y,r_w,r_h,0,0,r_w,r_h);  

        
        ctx2.lineWidth = 4;
        ctx2.setStrokeStyle ='green';
        ctx2.globalAlpha = 0.4;
        ctx2.fillRect(r_x,r_y,r_w,r_h);
        ctx2.globalAlpha = 1.0;
        break;
      }else if(isSelected){
        ctx2.clearRect(0,0,canvas2.width,canvas2.height);
        isSelected = false;
      }
    }
    setSelectocr(allJson[res]);
    console.log("allJson[res] is " + selectocr + "res is "+ res);
    return (res+1);
    
  }

  async function CtxTest(data){
    setIsOCR(true);
    setIsShow(true);
    var canvas = document.getElementById("imageCanvas");
    const ocr_texts = await data.texts;
    const ocr_width = await data.width;
    var ctx = canvas.getContext("2d");
    // ctx.clearRect(0,0,canvas.width,canvas.height);
    var img = document.getElementById("preview");
    canvas.width = img.width;
    canvas.height = img.height;

    var canvas2 = document.getElementById("layer2");
    var ctx2 = canvas2.getContext("2d");
    canvas2.width = canvas.width;
    canvas2.height = canvas.height;

    console.log("canvas size is : "+canvas.width + canvas.height);
    ctx.drawImage(img,0,0,img.width,img.height);
    ctx.stroke();
    var ratio = canvas.width / ocr_width;
    console.log("ratio is "+ ratio);
    

    for (var i = 0; i <ocr_texts.length; i++){
      const ocr_bounds =await ocr_texts[i].vertices;
      const ocr_word = await ocr_texts[i];
      allJson.push(ocr_word);

      var x = ocr_bounds[0].x-3;
      var y = ocr_bounds[0].y-3;
      var w = ocr_bounds[1].x - x + 3;
      var h = ocr_bounds[2].y - y + 3;

      x = x * ratio;
      y = y * ratio;
      w = w * ratio;
      h = h * ratio;


      ctx.lineWidth = 4;
      ctx.setStrokeStyle ='white';
      ctx.strokeRect(x,y,w,h);
      ctx.lineWidth =2;
      ctx.setStrokeStyle ='black';
      ctx.strokeRect(x,y,w,h);
      
      let tmparr=[x,y,w,h];
      takethem.push([x,y,w,h]);
    }
      

    canvas2.addEventListener("click", function(event) {
      console.log("클릭은 됨")
      var rect = canvas.getBoundingClientRect();
      var x = event.clientX - rect.left;
      var y = event.clientY - rect.top;
      
      findRect(x,y,ctx2,canvas2);
      console.log("(" + x + ", " + y + ") is clicked.");
      });    
  }


  


  async function fetchData(){
    const response = await fetch("/api/OCR/test",{
      headers:{
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    const res = await response.json();
    console.log("OCR :"+res);
    setOcrdata(res);
    const next = await CtxTest(res)

    
  }


  async function handleFile(file){


    const options ={
      maxSizeMB : 5,
      maxWidthOrHeight : 550
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

    // //최소 이미지 크기 충족하는지 확인
    var img = new Image();
    var _URL = window.URL || window.webkitURL;
    img.src = _URL.createObjectURL(pictureFiles[0]);
    img.onload = function() {
      if(img.width < (50) || img.height < (50)) {
        alert("최소 이미지 사이즈(가로 50px, 세로 50px)이상으로 업로드 해주세요.");
        _URL.revokeObjectURL(img.src);
        window.location.reload();
        return;

      }
    }
    //드래그 완료
    setIsDragging(true);

    //canvas에 이미지 올리기
    var canvas = document.getElementById("imageCanvas");
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img,0,0,img.width,img.height);
    ctx.stroke();

    
    //resize해서 파일 처리하기
    let newFile = await handleFile(pictureFiles[0]);
    
    var reader = new FileReader();
    reader.onload = r=>{
      var output = document.getElementById('preview');
      setImgSrc(reader.result);
      output.src = reader.result;
    };
    reader.readAsDataURL(newFile);

    if(pictureFiles.length >0){
      setImgPath(pictureFiles[0].path);
      const imgData = new FormData();
      imgData.append("file",newFile);
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
    console.log("Cp1");
    var word = selectocr.word;
    var x = selectocr.vertices[0].x-2;
    var y = selectocr.vertices[0].y-2;
    var w = selectocr.vertices[1].x - x + 2;
    var h = selectocr.vertices[2].y - y + 2;

    if (w < 40 || h < 40){
      alert("단어를 검색할 수 있는 최소 이미지 사이즈(가로 40px, 세로 40px)보다 작습니다.");
      window.location.reload();
      return;
    }
    setWord(word);
    const imgData = new FormData();
    imgData.append("word",word);
    imgData.append("x",x);
    imgData.append("y",y);
    imgData.append("w",w);
    imgData.append("h",h);
    console.log("checkpoint2");
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

  function incrementtest(){
    setPercent(1);
  }

  function Counter() {
    
    useEffect(() => {
      if ({percent} ===1){
        const id = setInterval(() => {
          setCount(c => c + 1);
        }, 1000);
        return () => clearInterval(id);
      }else{
        setCount(-1);
      }
      
    }, []); 
  
    return <h1>{count}</h1>;
  }


  return (
  <div className="App">
    <div>
      {/* <Button onClick ={fetchData}>OCR 후 그림그리기 </Button> */}
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
          <div id="myDiv">
                  <canvas className="imageCanvas" id="imageCanvas" >이 브라우저는 'canvas'기능을 제공하지 않습니다.</canvas>
                  <canvas className="imageCanvas" id="layer2"></canvas>
                </div>

            {
              !isDragging ?(
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
              ):(
                <>
                <div>{
                  !isOCR ?(
                    <Button onClick ={fetchData}>OCR 후 그림그리기 </Button>
                  ):(
                    <></>
                  )
                }
                {
                  isShow ? (
                    <img className="preview" id="preview"/>
                  ): (
                    <>
                    </>
                  )
                }
                
                  
                  
                </div>
                
              </>
              )
            
            
            }

      </div>
      </Grid.Column>
      <Grid.Column>
        <p>3</p>
        <div>
          {/* selected word show */}
          {
            !isOCR?(
              <>
              </>
            ):(
              <><canvas id="selectedCanvas"></canvas>
              <Button onClick={CropGo}> 단어전송 및 결과 반환</Button>
              </>
            )
          }
          
        </div>
        <div>
          {/* <Progress percent={percent} autoSuccess /> */}
          {/* <Button onClick={incrementtest}></Button> */}
          {/* <SetTimer></SetTimer> */}
        </div>
        <div>
        <Segment>
            <Dimmer active>
              <Loader />
            </Dimmer>
          </Segment>
        </div>
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
              color : 'blue',
              fontSize : 24
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
