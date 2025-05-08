import { BrowserRouter, Routes, Route, Link } from "react-router-dom"

// pages
import Home from "./pages/Home"
import Update from "./pages/Update"
import Contact from "./pages/Flashcards"
import FlashcardManager from "./pages/FlashcardManager"

function App() {
  return (
    <BrowserRouter>
      <nav>
        <h1>Supa Smoothie</h1>
        <Link to="/">Home</Link>
        <Link to="/flashcards">Flashcards</Link>
        <Link to="/manage">Manage Flashcards</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:id" element={<Update />} />
        <Route path="/flashcards" element={<Contact />} />
        <Route path="/manage" element={<FlashcardManager />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
