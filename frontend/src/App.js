import logo from './logo.svg';
import './App.css';
import NavBar from './NavBar';
import MultiStepWorkflow from './MultiStepWorkflow';
import { useState } from 'react';
import SricptGeneration from './ScriptGeneration';
import ImageGeneration from './ImageGeneration';
import VideoGeneration from './VideoGeneration';
import VideoResults from './VideoResults';

function App() {
  const steps = [
    "Script Generation",
    "Voice Selection",
    "Image Generation",
    "Video Generation",
    "Results"
  ];

  const [currentStep, setCurrentStep] = useState(4)

  return (
    <div className="App">
      <NavBar />
      <MultiStepWorkflow steps={steps} currentStep={currentStep}/>
      <div 
      className="bg-light rounded p-3 shadow-sm border border-dark w-90 mx-auto my-2"
      style={{
        width: '90%',
      }}>
        {currentStep === 0 && <SricptGeneration />}
        {currentStep === 2 && <ImageGeneration />}
        {currentStep === 3 && <VideoGeneration />}
        {currentStep === 4 && <VideoResults />}
      </div>
    </div>
  );
}

export default App;
