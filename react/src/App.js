import "./App.css?ver=1";
import "./Fonts.css";
// import './test.css'
import info from "./info.png";
import info_desc from "./info_desc.png";
import axios, { all } from "axios";
import React, { createRef, useEffect, useState, useRef } from "react";
import {
  Button,
  Grid,
  Loader,
  Dimmer,
  Segment,
  Table,
  Header,
  Popup,
  Progress,
} from "semantic-ui-react";
import Dropzone from "react-dropzone";
import imageCompression from "browser-image-compression";

//rfce
function App() {
  const [ocrdata, setOcrdata] = useState();
  const [selectocr, setSelectocr] = useState([]);
  const [word, setWord] = useState("가나다라마바사");
  const [useList, setUseList] = useState([]);
  const [imgPath, setImgPath] = useState("");
  const [imgSrc, setImgSrc] = useState("");

  //resize
  const [file, setFile] = useState();
  const [fileUrl, setFileUrl] = useState();

  //리액트 화면 제어
  const [isDragging, setIsDragging] = useState(false);
  const [isOCR, setIsOCR] = useState(false);
  const [isShow, setIsShow] = useState(true);
  const [isSearch, setIsSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSelected, setIsSelected] = useState(false);
  const [isClickOnce, setIsClickOnce] = useState(false);

  //progress bar
  const [count, setCount] = useState(0);
  const [percent, setPercent] = useState(0);

  //max canvas width
  var max_canvas_width = 500;
  let show_ratio = 1;
  const [ttt, setTTT] = useState(1);

  let takethem = [];
  let allJson = [];

  function findRect(x, y, ctx, canvas, src, rattio) {
    //canvas 버전으로 바꾸기
    var res = 0;
    console.log("findRect 들어옴");
    for (var i = 0; i < takethem.length; i++) {
      let r_x = takethem[i][0];
      let r_y = takethem[i][1];
      let r_w = takethem[i][2];
      let r_h = takethem[i][3];
      if (
        x <= r_x + r_w &&
        x >= r_x &&
        y <= r_y + r_h &&
        y >= r_y &&
        isSelected === false
      ) {
        res = i;
        setIsSelected(true);

        //draw in selectedCanvas
        var word_canvas = document.getElementById("selectedCanvas");
        word_canvas.width = r_w;
        word_canvas.height = r_h;
        let ctx3 = word_canvas.getContext("2d");

        ctx3.clearRect(0, 0, word_canvas.width, word_canvas.height);
        let img_3 = new Image();
        // img_3.src = imgSrc;
        console.log("src is longlong2" + src);
        img_3.src = src;
        console.log(img_3.src + "img onload start");
        img_3.onload = function () {
          console.log("img_3 onload finish");

          // ctx3.clearRect(0,0,word_canvas.width,word_canvas.height);
          console.log("ratio is" + ttt);
          console.log("rattio is " + rattio);

          // let t_r_w = r_w / ttt + 10;
          // let t_r_h = r_h / ttt + 10;
          let t_r_w = r_w / rattio + 10;
          let t_r_h = r_h / rattio + 10;

          console.log("t_r_w , t_r_h " + t_r_w + " " + t_r_h);
          ctx3.drawImage(
            img_3,
            r_x / rattio,
            r_y / rattio,
            t_r_w,
            t_r_h,
            0,
            0,
            r_w,
            r_h
          );
        };

        // ctx.clearRect(0, 0, canvas2.width, canvas2.height);
        // ctx.globalAlpha = 0.4;
        // ctx.fillRect(r_x, r_y, r_w, r_h);
        // ctx.globalAlpha = 1.0;
        break;
      } else if (isSelected) {
        // ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
        setIsSelected(false);
      }
    }
    setSelectocr(allJson[res]);
    console.log("allJson[res] is " + selectocr + "res is " + res);
    return res + 1;
  }

  async function CtxTest(data, src, rattio) {
    setIsOCR(true);
    setIsShow(true);
    var canvas = document.getElementById("imageCanvas");
    const ocr_texts = await data.texts;
    const ocr_width = await data.width;
    var ctx = canvas.getContext("2d");
    // ctx.clearRect(0,0,canvas.width,canvas.height);
    // var img = document.getElementById("preview");
    // canvas.width = img.width;
    // canvas.height = img.height;

    // var canvas2 = document.getElementById("layer2");
    // var ctx2 = canvas2.getContext("2d");
    // canvas2.width = canvas.width;
    // canvas2.height = canvas.height;

    console.log("canvas size is : " + canvas.width + canvas.height);
    // ctx.drawImage(img,0,0,img.width,img.height);
    ctx.stroke();
    var ratio = canvas.width / ocr_width;
    console.log("ratio is " + ratio);

    for (var i = 0; i < ocr_texts.length; i++) {
      const ocr_bounds = await ocr_texts[i].vertices;
      const ocr_word = await ocr_texts[i];
      allJson.push(ocr_word);

      var x = ocr_bounds[0].x - 3;
      var y = ocr_bounds[0].y - 3;
      var w = ocr_bounds[1].x - x + 3;
      var h = ocr_bounds[2].y - y + 3;

      x = x * ratio;
      y = y * ratio;
      w = w * ratio;
      h = h * ratio;

      ctx.lineWidth = 4;
      ctx.setglobalAlpha = 0.8;
      ctx.strokeStyle = "white";
      ctx.strokeRect(x - 1, y - 1, w - 1, h - 1);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "black";
      ctx.globalAlpha = 1.0;
      ctx.strokeRect(x, y, w, h);

      takethem.push([x, y, w, h]);
    }

    canvas.addEventListener("click", function (event) {
      console.log("클릭은 됨");
      var rect = canvas.getBoundingClientRect();
      var x = event.clientX - rect.left;
      var y = event.clientY - rect.top;

      console.log("src is long2 : " + src);
      findRect(x, y, ctx, canvas, src, rattio);
      console.log("(" + x + ", " + y + ") is clicked.");
    });
  }

  async function fetchData() {
    const response = await fetch("/api/OCR/test", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const res = await response.json();
    console.log("OCR :" + res);
    setOcrdata(res);
    CtxTest(res);
  }

  async function handleFile(file) {
    const options = {
      maxSizeMB: 5,
      maxWidthOrHeight: 2000,
    };
    let ree;

    try {
      const compressedFile = await imageCompression(file, options);
      setFile(compressedFile);
      ree = compressedFile;
      const promise = imageCompression.getDataUrlFromFile(compressedFile);
      promise.then((result) => {
        setFileUrl(result);
      });
    } catch (err) {
      console.log("handleFileOnchange 에러");
      console.log(err);
    }
    return ree;
  }

  async function onDrop(pic) {
    let rattio = 1;
    var pictureFiles = pic;
    var canvas = document.getElementById("imageCanvas");
    var ctx = canvas.getContext("2d");

    // var canvas_j = document.getElementById("justblock");
    // var ctx_j = canvas.getContext("2d");
    // //최소 이미지 크기 충족하는지 확인
    var img = new Image();
    var _URL = window.URL || window.webkitURL;
    img.src = _URL.createObjectURL(pictureFiles[0]);
    img.onload = function () {
      if (img.width < 50 || img.height < 50) {
        alert(
          "최소 이미지 사이즈(가로 50px, 세로 50px)이상으로 업로드 해주세요."
        );
        _URL.revokeObjectURL(img.src);
        window.location.reload();
        return;
      }
    };
    //드래그 완료
    setIsDragging(true);

    //resize해서 파일 처리하기
    let newFile = await handleFile(pictureFiles[0]);
    let src_tmp = "";
    var img_resized = new Image();
    var reader = new FileReader();
    reader.onload = (r) => {
      // var output = document.getElementById('preview');
      // setImgSrc(reader.result);
      // output.src = reader.result;
      setImgSrc(reader.result);
      src_tmp = reader.result;
      console.log(imgSrc + " img src +++");
      console.log(src_tmp + "src_tmp +++");
      img_resized.src = reader.result;
    };
    reader.readAsDataURL(newFile);
    img_resized.onload = function () {
      //canvas에 이미지 올리기
      console.log("원래 가로" + img_resized.width);

      let r_width = img_resized.width;
      let r_height = img_resized.height;
      if (r_width > max_canvas_width) {
        let show_ratio = max_canvas_width / r_width;
        r_width = r_width * show_ratio;
        r_height = r_height * show_ratio;
        console.log("ratio is" + show_ratio);
        console.log("바꾼 가로 " + r_width);
        setTTT(show_ratio);
        rattio = show_ratio;
      }
      canvas.width = r_width;
      canvas.height = r_height;

      // canvas_j.width = r_width;
      // canvas_j.height = r_height;
      // ctx_j.fillRect(0, 0, r_width, r_height);
      ctx.drawImage(img_resized, 0, 0, r_width, r_height);
    };

    if (pictureFiles.length > 0) {
      setImgPath(pictureFiles[0].path);
      const imgData = new FormData();
      imgData.append("file", newFile);
      await axios
        .post("./api/Test/image", imgData)
        .then(console.log("onDrop 성공"))
        .then((res) => {
          console.log(res);
          // fetchData();
        })
        // .then(fetchData(src_tmp))
        .catch((e) => {
          console.error(e);
        });
      await axios
        .get("./api/OCR/test")
        .then((response) => {
          const res = response.data;
          console.log("OCR: " + res);
          setOcrdata(res);
          CtxTest(res, src_tmp, rattio);
        })
        .catch((e) => {
          console.log("fetch data error");
          console.error(e);
        });
    }
  }

  async function CropGo() {
    setIsSearch(true);
    if (isClickOnce) {
      console.log("클릭한 기록 있음");
      setIsLoading(true);
    } else {
      console.log("클릭한 기록 없음");
      setIsClickOnce(true);
    }
    var word = selectocr.word;
    var x = selectocr.vertices[0].x - 2;
    var y = selectocr.vertices[0].y - 2;
    var w = selectocr.vertices[1].x - x + 2;
    var h = selectocr.vertices[2].y - y + 2;

    // if (w < 40 || h < 40){
    //   alert("단어를 검색할 수 있는 최소 이미지 사이즈(가로 40px, 세로 40px)보다 작습니다.");
    //   window.location.reload();
    //   return;
    // }
    setWord(word);
    const imgData = new FormData();
    imgData.append("word", word);
    imgData.append("x", x);
    imgData.append("y", y);
    imgData.append("w", w);
    imgData.append("h", h);
    //여기서 글자값 보내주기
    await axios
      .post("./api/Test/crop", imgData)
      .then((response) => response.data)
      .then((actualData) => {
        setUseList(actualData.result);
        setIsLoading(false);
        console.log(useList);
      })
      .catch((err) => {
        console.log(err.message);
      });
  }

  //폰트 검색 결과 출력
  const ClickResult = () => {
    fetch("/api/Test/fontresult")
      .then((response) => response.json())
      .then((actualData) => {
        setUseList(actualData.result);
        console.log(useList);
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  function refresh() {
    window.location.reload();
  }

  const barRef = useRef(null);
  const divRef = useRef(null);

  const ProgressBar = require("progressbar.js");
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (idx === 0) {
      setIdx(1);

      var ctn = document.getElementById("container");
      ctn.style.visibility = "hidden";
      barRef.current = new ProgressBar.Line("#container", {
        strokeWidth: 4,
        easing: "easeInOut",

        color: "#FFEA82",
        trailColor: "#eee",
        trailWidth: 2,
        svgStyle: { width: "100%", height: "100%" },
        text: {
          style: {
            color: "#999",
            position: "absolute",
            right: "0",
            padding: 0,
            margin: 0,
            transform: null,
          },
          autoStyleContainer: false,
        },
      });
    } else {
      var ctn2 = document.getElementById("container");
      ctn2.style.visibility = "hidden";
    }
  }, []);

  function pro_bar_run() {
    var ctn = document.getElementById("container");
    ctn.style.visibility = "visible";
    // barRef.current.animate(0);
    barRef.current.animate(1.0, {
      duration: 10000,
      from: { color: "#FFEA82" },
      to: { color: "#ED6A5A" },
      step: (state, bar) => {
        bar.setText(Math.round(bar.value() * 100) + " %");
      },
    });
    // bar.animate(1.0);
  }

  function pro_bar_fin() {
    var ctn = document.getElementById("container");
    barRef.current.set(0);
    ctn.style.visibility = "hidden";
    console.log(document.querySelectorAll("container"));
  }

  return (
    <div className="App">
      <Header id="Header" textAlign="center">
        <h1>
          ✏️폰트 검색 시스템
          <Popup
            trigger={
              <img
                id="info"
                src={info}
                width={30}
                style={{
                  position: "absolute",
                  top: 45,
                  marginLeft: 10,
                  marginBottom: 0,
                }}
              ></img>
            }
            position="bottom center"
            offset={[0, 10]}
            mouseEnterDelay={500}
            mouseLeaveDelay={1500}
            on="click"
          >
            이미지 첨부해서 설명하기
            <img src={info_desc} width={1000}></img>
          </Popup>
        </h1>
      </Header>
      {/* semantic Grid test */}
      <div>
        <Button onClick={pro_bar_run}>테스트</Button>

        <Grid columns={2}>
          <Grid.Row>
            <Grid.Column className="Grid">
              <h3>
                <span className="title">검색하고자 하는 이미지 첨부</span>
              </h3>
              <div className="DZ">
                {!isDragging ? (
                  <Dropzone className="DZ" multiple={false} onDrop={onDrop}>
                    {({ getRootProps, getInputProps }) => (
                      <section>
                        <div {...getRootProps()}>
                          <input
                            className="dropzone"
                            {...getInputProps({
                              type: "file",
                              accept: "image/*",
                            })}
                          />
                          <h4>
                            업로드 할 이미지를 드래그하거나 박스를{" "}
                            <span style={{ color: "lightBlue" }}> 클릭</span>
                            하세요
                          </h4>
                        </div>
                      </section>
                    )}
                  </Dropzone>
                ) : (
                  <>
                    {/* <Button onClick={refresh}> 이미지 다시 선택하기</Button> */}
                  </>
                )}
                <div id="myDiv">
                  <canvas className="imageCanvas" id="imageCanvas" height="1">
                    이 브라우저는 'canvas'기능을 제공하지 않습니다.
                  </canvas>
                  {isLoading ? (
                    <></>
                  ) : (
                    <>
                      <Button onClick={refresh} style={{ marginTop: 7 }}>
                        {" "}
                        이미지 다시 선택하기
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Grid.Column>
            <Grid.Column className="Grid">
              <div className="Grid2">
                <h3>
                  <span className="title">선택한 단어 </span>
                </h3>
                <div id="selectbox">
                  {/* selected word show */}
                  {!isDragging ? (
                    <div id="beforeOCRbox">
                      <h4 textAlign="center">먼저 이미지를 첨부해주세요</h4>
                    </div>
                  ) : (
                    <>
                      <div>
                        <canvas id="selectedCanvas" height="3"></canvas>
                      </div>
                      {isSelected ? (
                        <>
                          <Button onClick={CropGo}> 폰트 검색</Button>
                        </>
                      ) : (
                        <>
                          <p textAlign="center">
                            이미지 속 검색하려는 단어를 선택해주세요
                          </p>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
              <div className="Grid2">
                <h3>
                  <span className="title">이미지 속 폰트 검색 결과 조회</span>
                </h3>
                <div id="searchresult">
                  <div id="container"></div>
                  {!isSearch ? (
                    <>
                      <div id="bigbox">
                        <h4>이곳에 순위별로 표시됩니다. </h4>
                      </div>
                    </>
                  ) : (
                    <>
                      {isLoading ? (
                        <>
                          <div
                            className="container"
                            id="container"
                            // style={{ visibility: "hidden" }}
                          ></div>
                          {pro_bar_run()}
                          {/* <Segment>
                            <Loader
                              indeterminate
                              active
                              inline="centered"
                              size="big"
                              content="검색중입니다. 잠시만 기다려주세요."
                            />
                          </Segment> */}
                        </>
                      ) : (
                        <>
                          {pro_bar_fin()}
                          <Table celled>
                            <Table.Header>
                              <Table.Row>
                                <Table.HeaderCell
                                  width={2}
                                  style={{ textAlign: "center" }}
                                >
                                  {" "}
                                  순위
                                </Table.HeaderCell>
                                <Table.HeaderCell
                                  width={5}
                                  style={{ textAlign: "center" }}
                                >
                                  폰트명
                                </Table.HeaderCell>
                                <Table.HeaderCell
                                  width={30}
                                  style={{ textAlign: "center" }}
                                >
                                  글자
                                </Table.HeaderCell>
                              </Table.Row>
                            </Table.Header>

                            <Table.Body>
                              {useList.map((res, index) => {
                                // const font = res + ', "YWDA"';
                                const font = '"' + res + '"';
                                console.log(font);
                                const TdStyle = {
                                  fontFamily: font,
                                  margin: 3,
                                  color: "black",
                                  fontSize: 40,
                                  textAlign: "center",
                                };
                                return (
                                  <tr key={index}>
                                    <td style={{ textAlign: "center" }}>
                                      {" "}
                                      {index + 1}
                                    </td>
                                    <td style={{ textAlign: "center" }}>
                                      {res}
                                    </td>
                                    <td style={TdStyle}>{word}</td>
                                  </tr>
                                );
                              })}
                            </Table.Body>
                          </Table>
                          {/* <Button onClick={refresh}> 다시 검색하기</Button> */}
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    </div>
  );
}
export default App;
