import Table from 'react-bootstrap/Table';
import { styled } from '@mui/material';

// const Img = styled('img')({
//   margin: 'auto',
//   display: 'block',
//   maxWidth: '100%',
//   maxHeight: '100%',
// })

function StripedRowExample({Result1, Result2, Result3, Result4, Result5}) {
  return (
    <Table striped bordered hover size="sm" style={{textAlign:'center'}}>
      <thead>
        <tr>
          <th>순위</th>
          <th>문장</th>
          <th>폰트명</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td><img src={Result1}/></td>
          <td>넷마블체 L</td>
        </tr>
        <tr>
          <td>2</td>
          <td><img src={Result2}/></td>
          <td>KoPub 바탕체</td>
        </tr>
        <tr>
          <td>3</td>
          <td><img src={Result3}/></td>
          <td>KoPub 돋움체</td>
        </tr>
        <tr>
          <td>4</td>
          <td><img src={Result4}/></td>
          <td>넷마블체 M</td>
        </tr>
        <tr>
          <td>5</td>
          <td><img src={Result5}/></td>
          <td>DX신문명조서체</td>
        </tr>
      </tbody>
    </Table>
  );
}

export default StripedRowExample;