import React, { useState, useEffect } from 'react';
import supabase from '../config/supabaseClient';

const Flashcards = () => {
  const [flashcards, setFlashcards] = useState([]);
  const [orderedFlashcards, setOrderedFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [order, setOrder] = useState('oldest');

  useEffect(() => {
    const fetchFlashcards = async () => {
      const { data, error } = await supabase.from('Flashcards').select();
      if (error) {
        console.error(error);
      } else {
        setFlashcards(data);
        reorderFlashcards(data, order);
      }
    };
    fetchFlashcards();
  }, []);

  // Reorder flashcards when order changes
  useEffect(() => {
    if (flashcards.length > 0) {
      reorderFlashcards(flashcards, order);
    }
  }, [order]);

  const reorderFlashcards = (cards, orderType) => {
    let sorted = [...cards];
    if (orderType === 'newest') sorted.sort((a, b) => b.id - a.id);
    else if (orderType === 'oldest') sorted.sort((a, b) => a.id - b.id);
    else if (orderType === 'random') sorted = shuffleArray(sorted);
    setOrderedFlashcards(sorted);
    setCurrentIndex(0);
  };

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const readCard = (index) => {
    if (index >= orderedFlashcards.length) {
      setIsSpeaking(false);
      return;
    }

    const card = orderedFlashcards[index];
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
            const next = index + 1;
            setTimeout(() => {
              setCurrentIndex(next);
              readCard(next);
            }, 500);
          }
        };

        window.speechSynthesis.speak(answerUtterance);
      }, 1000);
    };

    setCurrentIndex(index);
    window.speechSynthesis.speak(questionUtterance);
  };

  const startReading = () => {
    if (orderedFlashcards.length === 0) return;
    setCurrentIndex(0);
    setIsSpeaking(true);
    setIsPaused(false);
    readCard(0);
  };

  const skipCard = () => {
    if (!isSpeaking) return;
    window.speechSynthesis.cancel();
    const next = currentIndex + 1;
    setCurrentIndex(next);
    readCard(next);
  };

  const pauseReading = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(true);
  };

  const resumeReading = () => {
    setIsSpeaking(true);
    setIsPaused(false);
    readCard(currentIndex);
  };

  const restartReading = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    setCurrentIndex(0);
  };

  const currentCard = orderedFlashcards[currentIndex];

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
        <select
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          style={{
            fontSize: '14px',
            padding: '6px 12px',
            marginLeft: '10px',
            borderRadius: '6px'
          }}
        >
          <option value="oldest">Oldest First</option>
          <option value="newest">Newest First</option>
          <option value="random">Random Order</option>
        </select>
      </div>

      {currentCard && (
        <div style={{ padding: '10px', marginTop: '20px' }}>
          <h3>Question:</h3>
          <p>{currentCard.Question}</p>
          <h3>Answer:</h3>
          <p>{currentCard.Answer}</p>
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
