
// const run = async () => {

//     await Promise.all([
//         faceapi.nets.ageGenderNet.loadFromUri("./models"),
//         faceapi.nets.faceExpressionNet.loadFromUri("./models"),
//         faceapi.nets.faceLandmark68Net.loadFromUri("./models"),
//         faceapi.nets.faceLandmark68TinyNet.loadFromUri("./models"),
//         faceapi.nets.faceRecognitionNet.loadFromUri("./models"),
//         faceapi.nets.ssdMobilenetv1.loadFromUri("./models"),
//         faceapi.nets.tinyFaceDetector.loadFromUri("./models"),
        
//     ])

//     const stream = await navigator.mediaDevices.getUserMedia({
//         video:true,
//         audio:false,
//     });

//     const videoFeedEl = document.getElementById("video");
//     videoFeedEl.srcObject = stream;

    

//     const canvas = document.getElementById("canvas");
//     canvas.style.left = videoFeedEl.offsetLeft;
//     canvas.style.top = videoFeedEl.offsetTop;
//     canvas.height = videoFeedEl.height;
//     canvas.width = videoFeedEl.width;

//     const refFace = await faceapi.fetchImage("")
//     let refFaceAiData = await faceapi.detectAllFaces(refFace).withFaceLandmarks().withFaceDescriptors()
//     let faceMatcher = new faceapi.FaceMatcher(refFaceAiData)

//     setInterval(async ()=>{
//         let faceAiData = await faceapi.detectAllFaces(videoFeedEl).withFaceLandmarks().withFaceExpressions().withAgeAndGender().withFaceDescriptors();
//         // console.log(faceAiData);
//         const displaySize = { width: videoFeedEl.width, height: videoFeedEl.height }
//         canvas.getContext("2d").clearRect(0,0,canvas.width,canvas.height);
//         const resizedDetections = faceapi.resizeResults(faceAiData, displaySize)
//         faceapi.draw.drawDetections(canvas,resizedDetections);
//         faceapi.draw.drawFaceLandmarks(canvas,resizedDetections);
//         faceapi.draw.drawFaceExpressions(canvas,resizedDetections);

//         resizedDetections.forEach(face => {
//             const { detection, descriptor } = face;
//             let label = faceMatcher.findBestMatch(descriptor).toString()
//             // console.log(label)
//             let options = {label: "Juanito"}
//             if(label.includes("unknown")){
//                 options = {label: "Desconocido"}
//             }
//             const drawBox = new faceapi.draw.DrawBox(detection.box, options)
//             drawBox.draw(canvas)
//             // console.log(label == "unknown")
            
//         });

//     },200)

// }

// run()


// let empleados = [
//     {
//         id: 1,
//         imagenUrl: "./empleados/juan_jose_aguirre_salazar.jpg",
//         cedula: 1007442521,
//         nombreCompleto: "juan jose aguirre salazar"
//     },
//     {
//         id: 2,
//         imagenUrl: "./empleados/luz_angela_arboleda_gomez.jpg",
//         cedula: 1006166974,
//         nombreCompleto: "luz angela arboleda gomez"
//     }
// ]
