import { useState, useEffect } from 'react';

function TextInput({handleChangeTextArea}) {
    return (
      <div className="mb-3">
        <label htmlFor="userText" className="form-label">Enter Text</label>
        <textarea
          id="userText"
          className="form-control"
          rows="3"
          placeholder="Type your text here..."
          onChange={handleChangeTextArea}
        />
      </div>
    );
}

function NumberInput({handleChangNumberInput}) {
    return (
        <div className="mb-3">
        <label htmlFor="count" className="form-label">Enter Count</label>
        <input
            type="number"
            id="count"
            className="form-control"
            placeholder="Enter a number"
            onChange={handleChangNumberInput}
        />
        </div>
    );
}

function ScriptEditor({ scripts, setScripts }) {
    console.log(scripts);

    const [selectedScript, setSelectedScript] = useState(null);
    const [selectedScripts, setSelectedScripts] = useState([]);

    const handleAddScript = () => {
        const newScript = { id: scripts.length, text: 'New script text here.' };
        setScripts([...scripts, newScript]);
        setSelectedScript(newScript); // Automatically select the new script
    };

    const handleContentChange = (event) => {
        if (!selectedScript) return;  // Ensure selectedScript is not null
    
        // Directly update selectedScript text
        const updatedScript = { ...selectedScript, text: event.target.value };
        setSelectedScript(updatedScript);  // Update selectedScript directly
    
        // If you still need to update the whole scripts array, you can do it as follows:
        const updatedScripts = scripts.map((script) =>
            script.id === updatedScript.id ? updatedScript : script
        );
        setScripts(updatedScripts);  // Update the scripts list
    };

    const handleScriptSelection = (scriptId) => {
        const isSelected = selectedScripts.includes(scriptId);
        if (isSelected) {
            setSelectedScripts(selectedScripts.filter(id => id !== scriptId)); // Unselect
        } else {
            setSelectedScripts([...selectedScripts, scriptId]); // Select
        }
    };

    return (
        <div className="d-flex">
            {/* Left Side: Script List */}
            <div className="list-group w-25">
                {scripts.map((script) => (
                    <button
                        key={script.id}
                        className={`list-group-item list-group-item-action d-flex justify-content-between ${selectedScript?.id === script.id ? 'list-group-item-primary' : ''}`}
                        onClick={() => setSelectedScript(script)}
                    >
                        <div>
                            {script.text.slice(0, 20)}... {/* Show first 20 characters */}
                        </div>
                        <input
                            type="checkbox"
                            checked={selectedScripts.includes(script.id)}
                            onChange={() => handleScriptSelection(script.id)}
                            className="ms-2"
                        />
                    </button>
                ))}
                <button
                    className="list-group-item list-group-item-action text-center"
                    onClick={handleAddScript}
                >
                    <strong>+</strong> Add New Script
                </button>
            </div>

            {/* Right Side: Text Editor */}
            <div className="w-75 ps-2">
                {selectedScript ? (
                    <>
                        <textarea
                            value={selectedScript.text}
                            onChange={handleContentChange}
                            className="form-control"
                            rows="10"
                        />
                    </>
                ) : (
                    <div>Select a script to edit or add a new one.</div>
                )}
            </div>
        </div>
    );
}

const SricptGeneration = ({nextStep, scripts, setScripts}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Function to fetch data from FastAPI
    const fetchScripts = async () => {
        setLoading(true);
        setError(null);
        
        try {
        // Making the POST request
        const response = await fetch('http://127.0.0.1:8000/script_generation/create', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({
            script_idea: textArea,
            n_scripts: numberInput,
            }),
        });
        
        // Check if the request was successful
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        // Parse the JSON response and update the state
        const data = await response.json();
        console.log(data)
        setScripts(data);  // Update state with the received data
        } catch (err) {
        setError(err.message);  // Handle errors
        } finally {
        setLoading(false);  // Set loading to false once the request is complete
        }
    };

    // Fetch the scripts when the component mounts
    // useEffect(() => {
    //     fetchScripts();
    // }, []);

    // Input Text area
    const [textArea, setTextArea] = useState('')
    
    const handleChangeTextArea = (event) => {
        setTextArea(event.target.value)
    }

    // Number Input
    const [numberInput, setNumberInput] = useState('')

    const handleChangNumberInput = (event) => {
        setNumberInput(event.target.value)
    }

    return (
        <>  
            {loading && console.log(scripts)}
            <TextInput handleChangeTextArea={handleChangeTextArea}/>
            <NumberInput handleChangNumberInput={handleChangNumberInput}/>
            {loading?
            <button className="btn btn-primary m-2" disabled>
            Generate Scripts
            </button>
            : <button className="btn btn-primary m-2" onClick={() => fetchScripts()}>
            Generate Scripts
            </button>}
            <ScriptEditor scripts={scripts} setScripts={setScripts} />
            <button className="btn btn-primary m-2" onClick={nextStep}>
            Submit Scripts
            </button>
        </>
    )
}

export default SricptGeneration