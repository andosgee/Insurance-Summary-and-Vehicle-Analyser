import React, { useState } from 'react';
import './ImageAnalyser.css'; // Import your CSS file
import { GoogleGenerativeAI } from "@google/generative-ai"; // AI model Import. Has been installed through NPM
import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai"; // Safety Settings

const ImageAnalyzer = () => {
const [results, setResults] = useState('');
    const [uploadedImages, setUploadedImages] = useState([]);

    const API_KEY = "AIzaSyCUCo7stdA77YGciAOCI1sLQC7Mxu5vVt4"; // Your Google API Key

    const genAI = new GoogleGenerativeAI(API_KEY);

    const fileToGenerativePart = async (file) => {
        const base64EncodedDataPromise = new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.readAsDataURL(file);
        });
        return {
            inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
        };
    }

    const viewImage = (e) => {
        const files = e.target.files;
        const images = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();

            reader.onload = (event) => {
                const img = event.target.result;
                images.push(img);
                setUploadedImages([...images]);
            };

            reader.readAsDataURL(file);
        }
    }

    const safetySettings = [
        {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
        },
      ];

    const run = async () => {
        const model = genAI.getGenerativeModel({ model: "gemini-pro-vision", safetySettings });

        const prompt = "What is this cars/trucks make, model, estimate of year, and registration number? If there is no Registration return with 'No resgistration can be seen'. If only a partial of a car can be seenm, don't try make out what it is. Please use the format 'Car -' position of car in image, 'Make -' make of car, 'Model -' model of car, 'Year -' year of car, 'Registration -' registration of car. Separate multiple cars with a ':'";

        const fileInputEl = document.querySelector("input[type=file]");
        const imageParts = await Promise.all([...fileInputEl.files].map(fileToGenerativePart));

        const result = await model.generateContent([prompt, ...imageParts]);
        const response = await result.response;
        const text = await response.text();
        setResults(text);
    }

    return (
        <div className ="container">
            <header>
                <h1 id="heading">Car Analyser</h1>
            </header>
            <div className='content'>
                <div className='left-side'>
                    <div className="uploader">
                        <input type="file" id="imageUpload" multiple accept="image/*" onChange={viewImage} />
                        <label htmlFor="imageUpload" className="custom-file-label">
                            Upload Image
                        </label>
                        <button id="processBtn" onClick={run}>Process Image</button>
                    </div>

                    <div className="image-container">
                        {uploadedImages.map((image, index) => (
                            <div key={index} className='image-item'>
                                <img src={image} alt={`Uploaded ${index}`} className="uploaded-image"/>
                            </div>
                        ))}
                    </div>
                </div>
                <div id="results">
                    {results && <p>{results}</p>}
                </div>
            </div>
        </div>
    );
}


export default ImageAnalyzer;