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
  const nextStep = () => {
    setCurrentStep((currentStep + 1) % steps.length)
  }

  const [scripts, setScripts] = useState([])
  const [selectedVoices, setSelectedVoices] = useState([])
  const [images, setImages] = useState([]);

  return (
    <div className="App">
      <NavBar />
      <MultiStepWorkflow steps={steps} currentStep={currentStep}/>
      <div 
      className="bg-light rounded p-3 shadow-sm border border-dark w-90 mx-auto my-2"
      style={{
        width: '90%',
      }}>
        {currentStep === 0 && <SricptGeneration nextStep={nextStep} scripts={scripts} setScripts={setScripts} />}
        {currentStep === 1 && <VoiceSelection nextStep={nextStep} selectedVoices={selectedVoices} setSelectedVoices={setSelectedVoices} />}
        {currentStep === 2 && <ImageGeneration nextStep={nextStep} images={images} setImages={setImages}/>}
        {currentStep === 3 && <VideoGeneration nextStep={nextStep} />}
        {currentStep === 4 && <VideoResults nextStep={nextStep} />}
      </div>
    </div>
  );
}

export default App;
