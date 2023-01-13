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
        <BrowserRouter>
          <Routes>
            <Route path="/Test" element={<TestCanvas />} />
          </Routes>
        </BrowserRouter>
      </div>
    </>
    );
}

export default App;
