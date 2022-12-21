import Table from 'react-bootstrap/Table';
import { styled } from '@mui/material';
import '../App.css';

import Crop_img from '../assets/Crop_img.png';
// const Img = styled('img')({
//   margin: 'auto',
//   display: 'block',
//   maxWidth: '100%',
//   maxHeight: '100%',
// })

function StripedRowExample({Result1, Result2, Result3, Result4, Result5}) {
  return (
    <>
    <img id='res' src={Crop_img} style={{width: '30%'}} />
    <Table bordered size="sm" style={{textAlign:'center'}}>
      <thead>
        <tr>
          <th>순위</th>
          <th>폰트명</th>
          <th>문장</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td><td>DXBrmRExtraBold</td>
          <td><img src={Result1}/></td>
          
        </tr>
        <tr>
          <td>2</td><td>타이포도담체</td>
          <td><img src={Result2}/></td>
          
        </tr>
        <tr>
          <td>3</td><td>SuncheonB</td>
          <td><img src={Result3}/></td>
          
        </tr>
        <tr>
          <td>4</td><td>넷마블체 M</td>
          <td><img src={Result4}/></td>
          
        </tr>
        <tr>
          <td>5</td><td>넷마블체 B</td>
          <td><img src={Result5}/></td>
          
        </tr>
      </tbody>
    </Table>
    </>
    
  );
}

export default StripedRowExample;