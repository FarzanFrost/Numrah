import './App.css';
import NavBar from './NavBar';
import MultiStepWorkflow from './MultiStepWorkflow';
import { useState } from 'react';
import SricptGeneration from './ScriptGeneration';
import ImageGeneration from './ImageGeneration';
import VideoGeneration from './VideoGeneration';
import VideoResults from './VideoResults';
import VoiceSelection from './VoiceSelection';

function App() {
  const steps = [
    "Script Generation",
    "Voice Selection",
    "Image Generation",
    "Video Generation",
    "Results"
  ];

  const [currentStep, setCurrentStep] = useState(0)
  
  const [scripts, setScripts] = useState([])
  const [selectedVoices, setSelectedVoices] = useState([])
  const [images, setImages] = useState([]);
  const [image, setImage] = useState(null);
  const [videos, setVideos] = useState([])

  const newIdea = () => {
    setCurrentStep(0)
    setScripts([])
    setSelectedVoices([])
    setImages([])
    setImage(null)
    setVideos([])
  }
  
  return (
    <div className="App">
      <NavBar />
      <MultiStepWorkflow steps={steps} currentStep={currentStep}/>
      <div 
      className="bg-light rounded p-3 shadow-sm border border-dark w-90 mx-auto my-2"
      style={{
        width: '90%',
      }}>
        {currentStep === 0 && <SricptGeneration setCurrentStep={setCurrentStep} scripts={scripts} setScripts={setScripts} />}
        {currentStep === 1 && <VoiceSelection setCurrentStep={setCurrentStep} selectedVoices={selectedVoices} setSelectedVoices={setSelectedVoices} />}
        {currentStep === 2 && <ImageGeneration setCurrentStep={setCurrentStep} images={images} setImages={setImages} image={image} setImage={setImage}/>}
        {currentStep === 3 && <VideoGeneration setCurrentStep={setCurrentStep} scripts={scripts} voices={selectedVoices} images={images} image={image} setVideos={setVideos}/>}
        {currentStep === 4 && <VideoResults newIdea={newIdea} videos={videos} setVideos={setVideos}/>}
      </div>
    </div>
  );
}

export default App;
