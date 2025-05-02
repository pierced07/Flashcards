import { useState, useEffect } from 'react'
import supabase from '../config/supabaseClient'

const FlashcardManager = () => {
  const [flashcards, setFlashcards] = useState([])
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    fetchFlashcards()
  }, [])

  const fetchFlashcards = async () => {
    const { data, error } = await supabase.from('Flashcards').select()
    if (!error) setFlashcards(data)
    else console.error(error)
  }

  const addFlashcard = async () => {
    const { data, error } = await supabase.from('Flashcards').insert([{ Question: question, Answer: answer }])
    if (!error) {
      setQuestion('')
      setAnswer('')
      fetchFlashcards()
    } else {
      console.error(error)
    }
  }

  const updateFlashcard = async () => {
    const { data, error } = await supabase
      .from('Flashcards')
      .update({ Question: question, Answer: answer })
      .eq('id', editingId)

    if (!error) {
      setEditingId(null)
      setQuestion('')
      setAnswer('')
      fetchFlashcards()
    } else {
      console.error(error)
    }
  }

  const deleteFlashcard = async (id) => {
    const { error } = await supabase.from('Flashcards').delete().eq('id', id)
    if (!error) fetchFlashcards()
    else console.error(error)
  }

  const startEdit = (card) => {
    setEditingId(card.id)
    setQuestion(card.Question)
    setAnswer(card.Answer)
  }

  return (
    <div>
      <h2>Manage Flashcards</h2>
      <input
        type="text"
        placeholder="Question"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
      <input
        type="text"
        placeholder="Answer"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
      />
      <button onClick={editingId ? updateFlashcard : addFlashcard}>
        {editingId ? 'Update' : 'Add'} Flashcard
      </button>

      <div>
        {flashcards.map((card) => (
          <div key={card.id} style={{ border: '1px solid gray', marginTop: '10px', padding: '10px' }}>
            <p><strong>Q:</strong> {card.Question}</p>
            <p><strong>A:</strong> {card.Answer}</p>
            <button onClick={() => startEdit(card)}>Edit</button>
            <button onClick={() => deleteFlashcard(card.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FlashcardManager
