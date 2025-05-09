import React, { useState, useEffect } from 'react';
import supabase from '../config/supabaseClient';

const Flashcards = () => {
  const [flashcards, setFlashcards] = useState([]);
  const [orderedFlashcards, setOrderedFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [order, setOrder] = useState('oldest');

  const [hasReadAnswer, setHasReadAnswer] = useState(false);
  const [readyForAnswer, setReadyForAnswer] = useState(false);
  const [answerFinished, setAnswerFinished] = useState(false);
  const [waitingForNext, setWaitingForNext] = useState(false);

  const [questionEndTime, setQuestionEndTime] = useState(null);
  const [answerRevealTime, setAnswerRevealTime] = useState(null); // Time user taps to hear answer

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
    const questionUtterance = new SpeechSynthesisUtterance(card.Question);
    questionUtterance.rate = 1;
    questionUtterance.pitch = 1;

    questionUtterance.onend = () => {
      setQuestionEndTime(new Date());
      setReadyForAnswer(true);
    };

    setHasReadAnswer(false);
    setReadyForAnswer(false);
    setCurrentIndex(index);
    setIsSpeaking(true);
    setAnswerRevealTime(null);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(questionUtterance);
  };

  const readAnswer = () => {
    const card = orderedFlashcards[currentIndex];
    const answerUtterance = new SpeechSynthesisUtterance(card.Answer);
    answerUtterance.rate = 1;
    answerUtterance.pitch = 1;

    answerUtterance.onend = () => {
      setAnswerFinished(true);
      setWaitingForNext(true);
    };

    setAnswerRevealTime(new Date()); // Capture time when user taps to hear answer
    setHasReadAnswer(true);
    setReadyForAnswer(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(answerUtterance);
  };

  const logFlashcardReview = async (correctness) => {
    const flashcardId = orderedFlashcards[currentIndex].id;
    const currentTimestamp = new Date().toISOString(); // UTC ISO format

    let timeTaken = 0;
    if (questionEndTime && answerRevealTime) {
      const diff = (answerRevealTime - questionEndTime) / 1000;
      if (diff > 0) timeTaken = parseFloat(diff.toFixed(2));
    }

    const { data, error } = await supabase.from('FlashcardStats').insert([
      {
        Flashcard_ID: flashcardId,
        Correctness: correctness,
        Reviewed: currentTimestamp,
        Time_Taken: timeTaken,
      },
    ]);

    if (error) {
      console.error('Error logging flashcard review:', error);
    } else {
      console.log('Flashcard review logged:', data);
    }
  };

  const handleCardClick = () => {
    if (!isSpeaking) return;

    if (!hasReadAnswer) {
      if (readyForAnswer) {
        readAnswer();
      } else {
        window.speechSynthesis.cancel();
        readAnswer();
      }
      return;
    }

    if (hasReadAnswer && !answerFinished) {
      window.speechSynthesis.cancel();
      logFlashcardReview(true);
      goToNextFlashcard();
      return;
    }

    if (answerFinished) {
      logFlashcardReview(false);
      goToNextFlashcard();
    }
  };

  const goToNextFlashcard = () => {
    const next = currentIndex + 1;
    if (next < orderedFlashcards.length) {
      readCard(next);
    } else {
      setIsSpeaking(false);
    }

    setAnswerFinished(false);
    setHasReadAnswer(false);
    setWaitingForNext(false);
    setReadyForAnswer(false);
  };

  const startReading = () => {
    if (orderedFlashcards.length === 0) return;
    setIsSpeaking(true);
    setCurrentIndex(0);
    readCard(0);
  };

  const restartReading = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setCurrentIndex(0);
    setHasReadAnswer(false);
    setReadyForAnswer(false);
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
          {hasReadAnswer && (
            <>
              <h3>Answer:</h3>
              <p>{currentCard.Answer}</p>
            </>
          )}
        </div>
      )}

      <div
        onClick={handleCardClick}
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
        {!isSpeaking
          ? 'Click "Start Flashcards"'
          : !hasReadAnswer
          ? 'Tap to hear the answer'
          : 'Tap to skip to next flashcard'}
      </div>
    </div>
  );
};

export default Flashcards;
