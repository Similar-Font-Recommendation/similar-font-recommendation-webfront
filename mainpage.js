
// import Axios from 'axios';

var loadFile = function(event) {
    var reader = new FileReader();
    reader.onload = function(){
        var output = document.getElementById('output');
        output.src = reader.result;
    };
    reader.readAsDataURL(event.target.files[0]);
    //Object로 만드는 경우
    var PostForm = Object();
    PostForm.name = event.target.files[0].name;
    PostForm.file = event.target.files[0];

    //FormData 사용
    const formData = new FormData();
    formData.append('image',event.target.files[0]);
    formData.append('name',event.target.files[0].name);

    axios({
        method : "post",
        url : "https://domain/api/image/",
        data : formData
        })
        .then(response=>{
            console.log(response);
        })
        .catch(error=>{
            console.log(error);
        })
    console.log(PostForm.name);
    console.log(PostForm.file);

};

// function onBottunClicked(){
//     axios({
//         method : "post",
//         url : "/api/images",
//         data : formData
//     })
//         .then(response=>{
//             console.log(response);
//         })
//         .catch(error=>{
//             console.log(error);
//         })
// }
