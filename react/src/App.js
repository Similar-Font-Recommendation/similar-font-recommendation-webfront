// import './App.css';
import axios from 'axios';
import React, {useEffect,useState} from 'react';
import {Card, Button} from 'react-bootstrap';
import Dropzone from 'react-dropzone';
import Img from './img.jpeg';

//rfce
function App() {

  const [ocrdata,setOcrdata]=useState()

  useEffect(()=>{
    async function DrawOCR(data){
      var canvas = document.getElementById("imageCanvas");
      var ctx = canvas.getContext("2d"); 
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var img = document.getElementById("preview");
      canvas.width  = img.width;
      canvas.height = img.height;
      ctx.lineWidth = "7";
      ctx.strokeStyle = "black";
      const ocr_texts = await data.texts
      
      console.log("length: "+ocr_texts.length)
      
      for (var i = 0; i <ocr_texts.length; i++){
        const ocr_bounds =await ocr_texts[i].vertices;

        //console.log("json 가져오기 확인"+ocr_bounds)
    
        var x = ocr_bounds[0].x-10
        var y = ocr_bounds[0].y-10
        var w = ocr_bounds[1].x - x + 10
        var h = ocr_bounds[2].y - y + 10

        console.log("x: "+x +"y: "+y+" width: "+w+" height: "+h )
        ctx.rect(parseInt(x),parseInt(y),parseInt(w),parseInt(h))
    
        // ctx.rect(left, top, (right-left), (bottom-top));
        ctx.drawImage(img, 0, 0, img.width, img.height);
        ctx.stroke();
      }

      
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
      const next = await DrawOCR(res)
     
    }
    fetchData()

  },[])

  async function onDrop(pic){    
    const imgData = new FormData();
    imgData.append("file",pic[0]);
    await axios
      .post("./api/Test/image",imgData)
      .then(console.log("onDrop 성공"))
      .then(res=>{
        console.log(res);
      })
      .catch((e)=>{
        console.error(e);
      });     
    console.log("FormData 전송완료")
    
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
    {/* {data&&data.users.map((u) => <p key={u.id}>{u.name} test</p>)} */}
    <Button onClick={onClick}>POST 테스트</Button>
    </div>
     
    <div>
        <img className="preview" id="preview" src={Img} />
        <canvas className="imageCanvas" id="imageCanvas">이 브라우저는 'canvas'기능을 제공하지 않습니다.</canvas>
    </div>



  </div>
);
}

export default App;
