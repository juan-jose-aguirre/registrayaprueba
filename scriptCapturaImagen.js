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
    }
];

        const loadModels = async () => {
            await Promise.all([
                faceapi.nets.ageGenderNet.loadFromUri("./models"),
                faceapi.nets.faceExpressionNet.loadFromUri("./models"),
                faceapi.nets.faceLandmark68Net.loadFromUri("./models"),
                faceapi.nets.faceLandmark68TinyNet.loadFromUri("./models"),
                faceapi.nets.faceRecognitionNet.loadFromUri("./models"),
                faceapi.nets.ssdMobilenetv1.loadFromUri("./models"),
                faceapi.nets.tinyFaceDetector.loadFromUri("./models"),
            ]);
        };

        const startVideo = async () => {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false,
            });
            const video = document.getElementById("video");
            video.srcObject = stream;
        };

        const captureImage = () => {
            const video = document.getElementById("video");
            const canvas = document.getElementById("canvas");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
            return canvas;
        };

        const recognizeFace = async (canvas) => {
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
            const detections = await faceapi.detectSingleFace(canvas).withFaceLandmarks().withFaceDescriptor();

            if (detections) {
                const descriptor = detections.descriptor;
                for (let i = 0; i < faceMatchers.length; i++) {
                    const match = faceMatchers[i].findBestMatch(descriptor);
                    if (match.label !== 'unknown' && match.distance < 0.6) { // Ajusta el umbral si es necesario
                        const confirmMessage = `¿Es la persona en la foto ${empleados[i].nombreCompleto}?`;
                        if (confirm(confirmMessage)) {
                            await registrarEnBaseDeDatos(empleados[i].id);
                            alert("Registro completado.");
                            return;
                        }
                    }
                }
                alert("No se pudo identificar. Por favor, intente de nuevo.");
            } else {
                alert("No se detectó ningún rostro. Por favor, intente de nuevo.");
            }
        };

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
        // };

        document.getElementById("captureButton").addEventListener("click", async () => {
            const canvas = captureImage();
            await recognizeFace(canvas);
        });

        loadModels().then(startVideo);
