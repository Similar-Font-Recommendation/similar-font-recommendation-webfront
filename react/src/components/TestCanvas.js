import React, { useEffect, useState } from 'react';
import Image from '../img.jpeg';
import dummy from "../test.json";

function TestCanvas(){

  function Test(){
    var canvas = document.getElementById("imageCanvas");
    // var canvas = new Image()
    // canvas.src= {Image}
    var ctx = canvas.getContext("2d"); 
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var img = document.getElementById("preview");
    canvas.width  = img.width;
    canvas.height = img.height;
    
    ctx.lineWidth = "5";
    ctx.strokeStyle = "lightgreen";
    var top = 34;
    var bottom = 200;
    var left = 772;
    var right = 29;
    ctx.rect(left, top, (right-left), (bottom-top));
    ctx.drawImage(img, 0, 0, img.width, img.height);
    ctx.stroke();
  }

    return(
        <div>
        <h3>
            {dummy.Block.map((Text)=>(
              Text.x
            ))}
          </h3>
        <img className="preview" id="preview" src={Image} />
        <buttom onClick={Test}>테스트</buttom>
        <canvas className="imageCanvas" id="imageCanvas">이 브라우저는 'canvas'기능을 제공하지 않습니다.</canvas>
      </div>
    )
}

export default TestCanvas;