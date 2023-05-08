import "./App.css?ver=1";
import "./Fonts.css";
// import './test.css'
import info from "./info.png";
import info_desc from "./info_desc.jpeg";
import image_icon from "./image_icon.png";
import axios, { all } from "axios";
import React, { createRef, useEffect, useState, useRef } from "react";
import { Button, Grid, Table, Header, Popup } from "semantic-ui-react";
import Dropzone from "react-dropzone";
import imageCompression from "browser-image-compression";

//rfce
function App() {
  const [selectocr, setSelectocr] = useState([]);
  const [word, setWord] = useState("가나다라마바사");
  const [useList, setUseList] = useState([]);

  //리액트 화면 제어
  const [isDragging, setIsDragging] = useState(false);
  const [isSearch, setIsSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSelected, setIsSelected] = useState(false);
  const [isClickOnce, setIsClickOnce] = useState(false);

  //max canvas width
  var max_canvas_width = 500;
  var max_canvas_height = 400;

  let takethem = [];
  let allJson = [];

  function findRect(x, y, ctx, canvas, src, rattio) {
    //canvas 버전으로 바꾸기
    var res = 0;
    for (var i = 0; i < takethem.length; i++) {
      let r_x = takethem[i][0];
      let r_y = takethem[i][1];
      let r_w = takethem[i][2];
      let r_h = takethem[i][3];
      if (x <= r_x + r_w && x >= r_x && y <= r_y + r_h && y >= r_y && isSelected === false) {
        res = i;
        setIsSelected(true);

        //draw in selectedCanvas
        var word_canvas = document.getElementById("selectedCanvas");
        let n_ratio = 1;
        let n_r_h = r_h;
        let n_r_w = r_w;
        if (r_h > 70) {
          n_ratio = r_h / 70;
          n_r_h = r_h / n_ratio;
          n_r_w = r_w / n_ratio;
        }
        word_canvas.width = n_r_w;
        word_canvas.height = n_r_h;

        //canvas max height 맞추기
        let ctx3 = word_canvas.getContext("2d");

        ctx3.clearRect(0, 0, word_canvas.width, word_canvas.height);
        let img_3 = new Image();
        img_3.src = src;
        img_3.onload = function () {
          var selectcontrol = document.getElementById("selectboxcontrol");
          selectcontrol.style.marginTop = (126 - (n_r_h + 36)) / 2 + "px";

          let t_r_w = r_w / rattio + 10;
          let t_r_h = r_h / rattio + 10;
          ctx3.drawImage(img_3, r_x / rattio, r_y / rattio, t_r_w, t_r_h, 0, 0, n_r_w, n_r_h);
        };

        break;
      } else if (isSelected) {
        setIsSelected(false);
      }
    }
    setSelectocr(allJson[res]);
    console.log("allJson[res] is " + selectocr + "res is " + res);
    return res + 1;
  }

  async function CtxTest(data, src, rattio) {
    var canvas = document.getElementById("imageCanvas");
    const ocr_texts = await data.texts;
    const ocr_width = await data.width;
    var ctx = canvas.getContext("2d");

    console.log("canvas size is : " + canvas.width + canvas.height);
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
      var rect = canvas.getBoundingClientRect();
      var x = event.clientX - rect.left;
      var y = event.clientY - rect.top;
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
      ree = compressedFile;
      const promise = imageCompression.getDataUrlFromFile(compressedFile);
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

    let filename = pictureFiles[0].name;
    let fileName = filename.slice(filename.indexOf(".") + 1).toLowerCase();
    if (fileName != "png" && fileName != "jpg") {
      alert("파일 형식을 jpg, png로 설정해주세요.");
      window.location.reload();
    }
    // //최소 이미지 크기 충족하는지 확인
    var img = new Image();
    var _URL = window.URL || window.webkitURL;
    img.src = _URL.createObjectURL(pictureFiles[0]);
    img.onload = function () {
      if (img.width < 50 || img.height < 50) {
        alert("최소 이미지 사이즈(가로 50px, 세로 50px)이상으로 업로드 해주세요.");
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
      src_tmp = reader.result;
      img_resized.src = reader.result;
    };
    reader.readAsDataURL(newFile);
    img_resized.onload = function () {
      //canvas에 이미지 올리기
      console.log("원래 가로" + img_resized.width);
      console.log("원래 세로 " + img_resized.height);
      let r_width = img_resized.width;
      let r_height = img_resized.height;
      if (r_width > max_canvas_width && r_height > max_canvas_height) {
        console.log("all over");
        let tmp_ratio_w = max_canvas_width / r_width;
        let tmp_ratio_h = max_canvas_height / r_height;
        let show_ratio_all = tmp_ratio_w;
        if (tmp_ratio_h < tmp_ratio_w) {
          show_ratio_all = tmp_ratio_h;
        }
        r_width = r_width * show_ratio_all;
        r_height = r_height * show_ratio_all;
        console.log("ratio is" + show_ratio_all);
        console.log("바꾼 가로 " + r_width);
        console.log("바꾼 세로 " + r_height);
        rattio = show_ratio_all;
      } else if (r_width > max_canvas_width) {
        let show_ratio = max_canvas_width / r_width;
        r_width = r_width * show_ratio;
        r_height = r_height * show_ratio;
        console.log("ratio is" + show_ratio);
        console.log("바꾼 가로 " + r_width);
        rattio = show_ratio;
      } else if (r_height > max_canvas_height) {
        console.log("height over");
        let show_ratio_h = max_canvas_height / r_height;
        r_width = r_width * show_ratio_h;
        r_height = r_height * show_ratio_h;
        console.log("ratio is" + show_ratio_h);
        console.log("바꾼 가로 " + r_width);
        console.log("바꾼 세로 " + r_height);
        rattio = show_ratio_h;
      }

      if (r_height < 500) {
        var imgcan = document.getElementById("myDiv");
        let r_height_em = (r_height / 14).toFixed(2);
        let m_T = ((34.5 - r_height_em) / 2) * 14;
        imgcan.style.marginTop = m_T + "px";
      }

      canvas.width = r_width;
      canvas.height = r_height;
      ctx.drawImage(img_resized, 0, 0, r_width, r_height);
    };

    if (pictureFiles.length > 0) {
      const imgData = new FormData();
      imgData.append("file", newFile);
      await axios
        .post("./api/Test/image", imgData)
        .then(console.log("onDrop 성공"))
        .then((res) => {
          console.log(res);
        })
        .catch((e) => {
          console.error(e);
        });
      await axios
        .get("./api/OCR/test")
        .then((response) => {
          const res = response.data;
          console.log("OCR: " + res);
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

    if (w < 50 || h < 50) {
      alert("단어를 검색할 수 있는 최소 이미지 사이즈(가로 50px, 세로 50px)보다 작습니다.");
      window.location.reload();
      return;
    }
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
      ctn.style.display = "none";
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
    ctn.style.display = "block";
    ctn.style.marginTop = "10em";
    ctn.style.visibility = "visible";
    barRef.current.animate(1.0, {
      duration: 10000,
      from: { color: "#FFEA82" },
      to: { color: "#ED6A5A" },
    });
  }

  function pro_bar_fin() {
    var ctn = document.getElementById("container");
    barRef.current.set(0);
    ctn.style.visibility = "hidden";
    ctn.style.display = "none";
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
                  // top: "0.8em",
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
            <img src={info_desc} width={1000}></img>
          </Popup>
        </h1>
      </Header>
      {/* semantic Grid test */}
      <div>
        <Grid columns={2} className="Grid">
          <Grid.Row>
            <Grid.Column>
              <h3>
                <span className="title">①&nbsp;이미지 첨부</span>
              </h3>
              <div className="DZ">
                {!isDragging ? (
                  <Dropzone className="DZ" multiple={false} onDrop={onDrop}>
                    {({ getRootProps, getInputProps }) => (
                      <section style={{ marginTop: "9em", marginBottom: "0" }}>
                        <div {...getRootProps()}>
                          <input
                            className="dropzone"
                            {...getInputProps({
                              type: "file",
                              accept: ".jpg, .png",
                            })}
                          />
                          <img src={image_icon} width={120}></img>
                          <h4>
                            검색하고 싶은 글자 이미지를 드래그하거나 박스를 클릭하세요
                            <br></br>
                            <span style={{ color: "gray", fontSize: 12 }}> 지원 형식 : png, jpg</span>
                          </h4>
                        </div>
                      </section>
                    )}
                  </Dropzone>
                ) : (
                  <></>
                )}
                <div id="myDiv">
                  <canvas className="imageCanvas" id="imageCanvas" height="1">
                    이 브라우저는 'canvas'기능을 제공하지 않습니다.
                  </canvas>
                  {isLoading ? (
                    <></>
                  ) : (
                    <>
                      <div style={{ marginTop: 7 }}>
                        <Button primary onClick={refresh} style={{ display: "block", margin: "auto" }}>
                          {" "}
                          이미지 다시 선택하기
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Grid.Column>
            <Grid.Column className="Grid">
              <div className="Grid2">
                <h3>
                  <span className="title">②&nbsp;선택한 단어 확인 </span>
                </h3>
                <div id="selectbox">
                  {/* selected word show */}
                  <div id="selectboxcontrol">
                    {!isDragging ? (
                      <div id="beforeOCRbox">
                        <p textAlign="center" style={{ paddingTop: "3em" }}>
                          ←&nbsp;먼저 왼쪽 박스에서 이미지를 첨부해주세요
                        </p>
                      </div>
                    ) : (
                      <>
                        <div>
                          <canvas id="selectedCanvas" height="3"></canvas>
                        </div>
                        {isSelected ? (
                          <>
                            <Button primary onClick={CropGo}>
                              {" "}
                              폰트 검색
                            </Button>
                          </>
                        ) : (
                          <>
                            <p textAlign="center" style={{ paddingTop: "1.7em" }}>
                              이미지 속 검색하려는 단어를 선택해주세요
                            </p>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="Grid2">
                <h3>
                  <span className="title">③&nbsp;폰트 검색 결과</span>
                </h3>
                <div id="searchresult">
                  <div id="container" className="container" style={{ marginTop: 100 }}></div>
                  {!isSearch ? (
                    <>
                      <div id="bigbox">
                        <h4>이곳에 검색 결과를 보여줍니다. </h4>
                      </div>
                    </>
                  ) : (
                    <>
                      {isLoading ? (
                        <>
                          {pro_bar_run()}
                          <div>검색중입니다</div>
                        </>
                      ) : (
                        <>
                          {pro_bar_fin()}
                          <Table celled>
                            <Table.Header>
                              <Table.Row>
                                <Table.HeaderCell width={2} style={{ textAlign: "center" }}>
                                  {" "}
                                  순위
                                </Table.HeaderCell>
                                <Table.HeaderCell width={5} style={{ textAlign: "center" }}>
                                  폰트명
                                </Table.HeaderCell>
                                <Table.HeaderCell width={30} style={{ textAlign: "center" }}>
                                  글자
                                </Table.HeaderCell>
                              </Table.Row>
                            </Table.Header>

                            <Table.Body>
                              {useList.map((res, index) => {
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
                                    <td style={{ textAlign: "center" }}> {index + 1}</td>
                                    <td style={{ textAlign: "center" }}>{res}</td>
                                    <td style={TdStyle}>{word}</td>
                                  </tr>
                                );
                              })}
                            </Table.Body>
                          </Table>
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
