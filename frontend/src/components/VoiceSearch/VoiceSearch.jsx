import { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FaMicrophone, FaStop, FaSearch, FaSpinner } from 'react-icons/fa';
import axios from 'axios';

const VoiceSearch = ({ onSearchResults }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchType, setSearchType] = useState('projects');
  const [category, setCategory] = useState('');
  const [skills, setSkills] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [role, setRole] = useState('');
  const [recognizedText, setRecognizedText] = useState('');
  
  const { token } = useSelector(state => state.auth);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        processAudio(audioBlob);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      toast.info('Recording started. Speak now...');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Could not access microphone. Please check permissions.');
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.info('Recording stopped. Processing audio...');
    }
  };
  
  const processAudio = async (audioBlob) => {
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('audio_file', audioBlob, 'recording.wav');
      formData.append('search_type', searchType);
      
      if (category) formData.append('category', category);
      if (skills) formData.append('skills', skills);
      if (budgetMin) formData.append('budget_min', budgetMin);
      if (budgetMax) formData.append('budget_max', budgetMax);
      if (role) formData.append('role', role);
      
      const response = await axios.post('/api/voice-search/voice-search', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const { data } = response.data;
      setRecognizedText(data.query);
      
      if (onSearchResults) {
        onSearchResults(data.results);
      }
      
      toast.success('Voice search completed successfully');
    } catch (error) {
      console.error('Error processing audio:', error);
      toast.error(error.response?.data?.message || 'Error processing audio');
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-6">
      <h2 className="text-xl font-semibold mb-4">Voice Search</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search Type
          </label>
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            disabled={isRecording || isProcessing}
          >
            <option value="projects">Projects</option>
            <option value="users">Users</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="e.g., Web Development"
            disabled={isRecording || isProcessing}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Skills (comma-separated)
          </label>
          <input
            type="text"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="e.g., React, Node.js, MongoDB"
            disabled={isRecording || isProcessing}
          />
        </div>
        
        {searchType === 'projects' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Budget
              </label>
              <input
                type="number"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., 100"
                disabled={isRecording || isProcessing}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Budget
              </label>
              <input
                type="number"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., 1000"
                disabled={isRecording || isProcessing}
              />
            </div>
          </>
        )}
        
        {searchType === 'users' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              disabled={isRecording || isProcessing}
            >
              <option value="">Any Role</option>
              <option value="client">Client</option>
              <option value="freelancer">Freelancer</option>
            </select>
          </div>
        )}
      </div>
      
      <div className="flex flex-col items-center justify-center mt-6">
        <div className="flex space-x-4 mb-4">
          {!isRecording ? (
            <button
              onClick={startRecording}
              disabled={isProcessing}
              className="flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              <FaMicrophone className="mr-2" />
              Start Recording
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <FaStop className="mr-2" />
              Stop Recording
            </button>
          )}
          
          <button
            onClick={() => processAudio(audioChunksRef.current)}
            disabled={isRecording || isProcessing || audioChunksRef.current.length === 0}
            className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <FaSpinner className="mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <FaSearch className="mr-2" />
                Search
              </>
            )}
          </button>
        </div>
        
        {recognizedText && (
          <div className="w-full mt-4 p-3 bg-gray-100 rounded-md">
            <p className="text-sm font-medium text-gray-700 mb-1">Recognized Text:</p>
            <p className="text-lg">{recognizedText}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceSearch;
