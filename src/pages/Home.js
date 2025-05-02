import supabase from "../config/supabaseClient"
import { useEffect, useState } from 'react'

const Home = () => {

  const [fetchError, setFetchError] = useState(null)
  const [flashcards, setFlashcards] = useState(null)

  useEffect(() => {
    const fetchFlashcards = async () => {
      const { data, error } = await supabase.from('Flashcards').select()

      if (error) {
        setFetchError('Could not fetch flashcards')
        setFlashcards(null)
        console.log(error)
      }

      if (data) {
        setFlashcards(data)
        setFetchError(null)
      }
    }

    fetchFlashcards()
  }, [])

  return (
    <div className="page home">
      {fetchError && <p>{fetchError}</p>}
      {flashcards && (
        <div className='Flashcards'>
          {flashcards.map(Flashcard => (
            <p key={Flashcard.id}>{Flashcard.Question}</p>
          ))}
        </div>
      )}
    </div>
  )
}

export default Home
