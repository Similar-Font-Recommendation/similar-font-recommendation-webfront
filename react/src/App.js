import './App.css';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Box,Paper, Grid,styled,AppBar,Toolbar,Typography, createTheme,ThemeProvider } from '@mui/material';
import { Card, Button } from "react-bootstrap";
import Dropzone from 'react-dropzone';
import OCRImg from './assets/OCR_img.png';
import Result1 from './assets/Result_1.png';
import Result2 from './assets/Result_2.png';
import Result3 from './assets/Result_3.png';
import Result4 from './assets/Result_4.png';
import Result5 from './assets/Result_5.png';
import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom';
import TestCanvas from './components/TestCanvas';
import ResultTable from './components/ResultTable';

// const Img = styled('img')({
//   margin: 'auto',
//   display: 'block',
//   maxWidth: '100%',
//   maxHeight: '100%',
// })

const theme = createTheme({
  typography: {
    fontFamily: 'Yes24'
  }
})
function App(){
  const [visible,setVisible] = useState(false);

  const [files, setFiles] = useState([])
  const [data,setData]=useState()

  // useEffect(() => {
  //   fetch("/api/users",{
  //     headers:{
  //       'Content-Type': 'application/json',
  //       'Accept' : 'application/json'
  //     }
  //   }).then(
  //     // response 객체의 json() 이용하여 json 데이터를 객체로 변화
  //     res => res.json()
  //   ).then(
  //     // 데이터를 콘솔에 출력
  //     data => {
  //       setData(data);
  //       console.log(data);
  //     }
  //  ).catch(
  //   (err) =>console.log("error: 발생 "+err)
  //  )
  // },[])


  async function onDrop(pic){    
    const imgData = new FormData();
    imgData.append("file",pic[0]);
    await axios
      .post("./api/image",imgData)
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
      await axios.post("/api/post",{
        'name' : "ej",
        'age' : 24
      });
      console.log("POST 완료")
    }catch(e){
      console.error(e);
    }

  }

  return (
    <>
      <div>
      <ThemeProvider theme={theme}>
        <AppBar position="static"style={{background: '#FFFFFF' ,padding:'1em'}}>
        <Toolbar variant="dense">
            <Typography variant="h4" color="black" component="div">
            이미지 폰트 추천
            </Typography>
        </Toolbar>
    </AppBar>
      </ThemeProvider>
      
      <Grid container spacing={2} styles={{margin: 20, padding: 20  }}
      position="static"
      color="default"
      >
        <Grid xs={5} md={4} maxWidth="sm" sx={{ pt: 8, pb: 6 }} className="box" >
        <Card style={{marginBottom:'1em'}}>
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
               {/* <Card.Img src={Input} />  */}
          </Card.Body>

        </Card> 
          <Card>
            <Card.Header as="h4" style={{padding:'0.6em'}}>검색할 글자 선택하기</Card.Header>
            <Card.Body>
            <Card.Img  id='preview' style={{width: '70%'}}/>{'\n'}
            <Grid container justifyContent="flex-end" >
              <Button variant="outline-primary" style={{marginTop:'0.5em'}} onClick={()=>{
                console.log("test");
                setVisible(true);
                    }}>
                검색하기
              </Button>
            </Grid>
            </Card.Body>
          </Card>
        </Grid>
        <Grid xs={7} md={5}  maxWidth="sm" sx={{ pt: 8, pb: 6 }} className="box">
          <Card>
            <Card.Header as="h4" style={{padding:'0.6em', maxBlockSize:'800px'}}>검색 결과</Card.Header>
            <Card.Body>
            <Card.Title>선택한 글자</Card.Title>
            {visible &&<ResultTable Result1={Result1} Result2={Result2} Result3={Result3} Result4={Result4} Result5={Result5} />}
            </Card.Body>
          </Card>
        </Grid>
      </Grid>
      </div>
    </>
    );
}

export default App;
