import React, { useState, useEffect } from 'react';
import supabase from '../config/supabaseClient';

const Flashcards = () => {
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false); // Track pause state

  useEffect(() => {
    const fetchFlashcards = async () => {
      const { data, error } = await supabase.from('Flashcards').select();
      if (!error) setFlashcards(data);
      else console.error(error);
    };
    fetchFlashcards();
  }, []);

  const readCard = (index) => {
    if (index >= flashcards.length) {
      setIsSpeaking(false);
      return;
    }

    const card = flashcards[index];
    const questionUtterance = new SpeechSynthesisUtterance(`${card.Question}`);
    questionUtterance.rate = 1;
    questionUtterance.pitch = 1;

    questionUtterance.onend = () => {
      setTimeout(() => {
        const answerUtterance = new SpeechSynthesisUtterance(`${card.Answer}`);
        answerUtterance.rate = 1;
        answerUtterance.pitch = 1;

        answerUtterance.onend = () => {
          if (isSpeaking) {
            setTimeout(() => {
              const next = index + 1;
              setCurrentIndex(next);
              readCard(next);
            }, 500); // pause between cards
          }
        };

        window.speechSynthesis.speak(answerUtterance);
      }, 1000); // pause between question and answer
    };

    window.speechSynthesis.speak(questionUtterance);
  };

  const startReading = () => {
    setCurrentIndex(0);  // Reset to the first flashcard
    setIsSpeaking(true);
    setIsPaused(false); // Ensure it's not paused
    readCard(0); // Start reading from the first flashcard
  };

  const skipCard = () => {
    if (!isSpeaking) return;
    window.speechSynthesis.cancel(); // Stop current speech
    const next = currentIndex + 1;
    setCurrentIndex(next);
    readCard(next); // Move to the next flashcard
  };

  const pauseReading = () => {
    window.speechSynthesis.cancel(); // Stop current speech
    setIsSpeaking(false); // Update speaking state to paused
    setIsPaused(true); // Mark as paused
  };

  const resumeReading = () => {
    setIsSpeaking(true);
    setIsPaused(false);
    readCard(currentIndex); // Resume from the current index
  };

  const restartReading = () => {
    window.speechSynthesis.cancel(); // Stop any ongoing speech immediately
    setIsSpeaking(false); // Ensure it's not speaking
    setIsPaused(false); // Reset pause state
    setCurrentIndex(0); // Go back to the first flashcard immediately
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '10px' }}>
        <button
          onClick={startReading}
          style={{
            fontSize: '14px',
            padding: '6px 12px',
            borderRadius: '6px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Start Flashcards
        </button>
        {isSpeaking && !isPaused && (
          <button
            onClick={pauseReading}
            style={{
              fontSize: '14px',
              padding: '6px 12px',
              borderRadius: '6px',
              backgroundColor: '#FF9800',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              marginLeft: '10px'
            }}
          >
            Pause Flashcards
          </button>
        )}
        {isPaused && (
          <button
            onClick={resumeReading}
            style={{
              fontSize: '14px',
              padding: '6px 12px',
              borderRadius: '6px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              marginLeft: '10px'
            }}
          >
            Resume Flashcards
          </button>
        )}
        <button
          onClick={restartReading}
          style={{
            fontSize: '14px',
            padding: '6px 12px',
            borderRadius: '6px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            marginLeft: '10px'
          }}
        >
          Restart Flashcards
        </button>
      </div>
      {/* Optional: Display question and answer visually while speaking */}
      {flashcards.length > 0 && (
        <div style={{ padding: '10px', marginTop: '20px' }}>
          <h3>Question:</h3>
          <p>{flashcards[currentIndex]?.Question}</p>
          <h3>Answer:</h3>
          <p>{flashcards[currentIndex]?.Answer}</p>
        </div>
      )}
      <div
        onClick={skipCard}
        style={{
          flexGrow: 1,
          backgroundColor: '#f2f2f2',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '18px',
          color: '#555',
          textAlign: 'center',
          padding: '20px',
          cursor: 'pointer'
        }}
      >
        Tap anywhere to skip to next flashcard
      </div>
    </div>
  );
};

export default Flashcards;
