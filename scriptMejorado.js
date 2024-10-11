let reconocimientoActivo = true; // Variable de control para el reconocimiento

let empleados = [
    {
        id: 1,
        imagenUrl: "./empleados/juan_jose_aguirre_salazar.jpg",
        cedula: 1007,
        nombreCompleto: "juan jose aguirre salazar"
    },
    {
        id: 2,
        imagenUrl: "./empleados/luz_angela_arboleda_gomez.jpg",
        cedula: 1006,
        nombreCompleto: "luz angela arboleda gomez"
    },
    {
        id: 3,
        imagenUrl: "./empleados/gabriel_malpud.jpg",
        cedula: 1009,
        nombreCompleto: "Gabriel Malpud"
    },
    {
        id: 4,
        imagenUrl: "./empleados/alain_rivera.jpeg",
        cedula: 1010,
        nombreCompleto: "Alain Rivera"
    }
]


const run = async () => {

    // Cargar los modelos de FaceAPI
    await Promise.all([
        faceapi.nets.ageGenderNet.loadFromUri("./models"),
        faceapi.nets.faceExpressionNet.loadFromUri("./models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("./models"),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri("./models"),
        faceapi.nets.faceRecognitionNet.loadFromUri("./models"),
        faceapi.nets.ssdMobilenetv1.loadFromUri("./models"),
        faceapi.nets.tinyFaceDetector.loadFromUri("./models"),
    ]);

    // Obtener la transmisión de la cámara
    const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
    });

    const videoFeedEl = document.getElementById("video");
    videoFeedEl.srcObject = stream;

    const canvas = document.getElementById("canvas");
    canvas.style.left = videoFeedEl.offsetLeft + 'px';
    canvas.style.top = videoFeedEl.offsetTop + 'px';
    canvas.height = videoFeedEl.height;
    canvas.width = videoFeedEl.width;

    // Cargar descriptores faciales para cada empleado
    const labeledDescriptors = await Promise.all(empleados.map(async empleado => {
        try {
            const img = await faceapi.fetchImage(empleado.imagenUrl);
            const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
            return {
                descriptor: detections.descriptor,
                nombreCompleto: empleado.nombreCompleto
            };
        } catch (error) {
            console.error(`Error al cargar la imagen para ${empleado.nombreCompleto}:`, error);
        }
    }));

    const faceMatchers = labeledDescriptors.map(descriptor => new faceapi.FaceMatcher([descriptor]));

    const deteccionInterval = setInterval(async () => {
        if (!reconocimientoActivo) {
            clearInterval(deteccionInterval);
            return;
        }

        const faceAiData = await faceapi.detectAllFaces(videoFeedEl).withFaceLandmarks().withFaceExpressions().withAgeAndGender().withFaceDescriptors();
        const displaySize = { width: videoFeedEl.width, height: videoFeedEl.height };
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        const resizedDetections = faceapi.resizeResults(faceAiData, displaySize);

        // Dibujar las detecciones en el canvas
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

        for (const face of resizedDetections) {
            const { detection, descriptor } = face;
            let label = "Desconocido";
            let empleadoId = null;

            // Comparar con cada FaceMatcher
            for (let i = 0; i < faceMatchers.length; i++) {
                const match = faceMatchers[i].findBestMatch(descriptor);
                if (match.label !== 'unknown' && match.distance < 0.6) { // Ajusta el umbral según sea necesario
                    label = empleados[i].nombreCompleto;
                    empleadoId = empleados[i].id;
                    break;
                }
            }

            // Mostrar mensaje de confirmación
            // if (label !== "Desconocido") {
            //     const confirmMessage = `¿Es la persona en la cámara ${label}?`;
            //     if (confirm(confirmMessage)) {
            //         await registrarEnBaseDeDatos(empleadoId);
            //         reconocimientoActivo = false; // Detener el reconocimiento
            //         clearInterval(deteccionInterval); // Detener el intervalo
            //         return; // Salir de la función
            //     }
            // }

            // Validación y etiquetado
            const options = { label };
            const drawBox = new faceapi.draw.DrawBox(detection.box, options);
            drawBox.draw(canvas);
        }

    }, 200);
}

// Función para registrar en la base de datos
// const registrarEnBaseDeDatos = async (empleadoId) => {
//     try {
//         const response = await fetch('/api/registrar', { // Reemplaza esta URL con la ruta de tu API
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ empleadoId }),
//         });

//         if (!response.ok) {
//             throw new Error('Error al registrar la información.');
//         }

//         console.log('Registro exitoso.');
//     } catch (error) {
//         console.error('Error en el registro:', error);
//     }
// }

// Función para reiniciar el reconocimiento
const reiniciarReconocimiento = () => {
    reconocimientoActivo = true;
    run(); // Volver a ejecutar la función de reconocimiento
}

// Iniciar el reconocimiento
run();
