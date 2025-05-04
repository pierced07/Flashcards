import { useState, useEffect } from 'react'
import supabase from '../config/supabaseClient'

const FlashcardManager = () => {
  const [flashcards, setFlashcards] = useState([])
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [bulkText, setBulkText] = useState('')

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

  const handleBulkImport = async () => {
    const entries = bulkText
      .split(/\/Question:/i)
      .filter(Boolean)
      .map(entry => {
        const [questionPart, answerPart] = entry.split(/\/Answer:/i)
        return {
          Question: questionPart?.trim(),
          Answer: answerPart?.trim()
        }
      })
      .filter(item => item.Question && item.Answer)

    if (entries.length === 0) {
      alert("No valid flashcards found.")
      return
    }

    const { error } = await supabase.from('Flashcards').insert(entries)
    if (!error) {
      setBulkText('')
      fetchFlashcards()
    } else {
      console.error(error)
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Manage Flashcards</h2>

      <input
        type="text"
        placeholder="Question"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        style={{ display: 'block', marginBottom: '10px', width: '100%' }}
      />
      <input
        type="text"
        placeholder="Answer"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        style={{ display: 'block', marginBottom: '10px', width: '100%' }}
      />
      <button onClick={editingId ? updateFlashcard : addFlashcard}>
        {editingId ? 'Update' : 'Add'} Flashcard
      </button>

      <div style={{ marginTop: '30px' }}>
        <h3>Bulk Add Flashcards</h3>
        <textarea
          value={bulkText}
          onChange={(e) => setBulkText(e.target.value)}
          placeholder="Paste flashcards like this:\n/Question: What is 2 + 2?\n/Answer: 4"
          rows={10}
          style={{ width: '100%', fontSize: '1rem' }}
        />
        <button onClick={handleBulkImport} style={{ marginTop: '10px' }}>
          Import Flashcards
        </button>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h3>Existing Flashcards</h3>
        {flashcards.map((card) => (
          <div key={card.id} style={{ border: '1px solid gray', marginTop: '10px', padding: '10px' }}>
            <p><strong>Q:</strong> {card.Question}</p>
            <p><strong>A:</strong> {card.Answer}</p>
            <button onClick={() => startEdit(card)}>Edit</button>
            <button onClick={() => deleteFlashcard(card.id)} style={{ marginLeft: '10px' }}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FlashcardManager
