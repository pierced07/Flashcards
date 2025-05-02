import React from 'react';

const Contact = () => {

  // Function to speak the text
  const speakText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    // You can customize the voice and other properties of the speech
    utterance.rate = 1; // Normal speed
    utterance.pitch = 1; // Normal pitch
    window.speechSynthesis.speak(utterance); // Speak the text
  };

  // Function to handle the tap
  const handleTap = () => {
    // Call the speakText function when the screen is tapped
    speakText("Hello! You just tapped the screen.");
  };

  return (
    <div className="contact-page" onClick={handleTap}>
      <h1>Contact Page</h1>
      <p>Tap anywhere on this page, and I will speak to you!</p>
    </div>
  );
}

export default Contact;
