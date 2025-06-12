import {useEffect, useState} from 'react'
import Search from "./Componenet/Search.jsx";
import Spinner from "./Componenet/Spinner.jsx";
import MovieCard from "./Componenet/MovieCard.jsx";
import  {useDebounce} from "react-use";

const API_KEY = import.meta.env.VITE_TMDB_ACCESS_KEY;
const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL;

const API_OPTIONS = {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
    }
}

function App() {

    const [searchTerm, setSearchTerm] = useState('');
    const [errorMessages, setErrorMessages] = useState('');
    const [moviesList, setMoviesList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    useDebounce(() => {
        setDebouncedSearchTerm(searchTerm);
    },500, [searchTerm]);

    const fetchMovies = async (query = '') => {
        setLoading(true);
        setErrorMessages('');

        try{
            const endpoint = query ? `${BASE_URL}/search/movie?query=${query}` : `${BASE_URL}/trending/movie/day?api_key=${API_KEY}`;
            
            const response = await fetch(endpoint, API_OPTIONS);
            
            if(!response.ok) {
                throw new Error('Something went wrong');
            }
            const data = await response.json();

            if(data.response === 'False') {
                setErrorMessages(data.error || 'failed to fetch data');
                setMoviesList([]);
                return
            }

            setMoviesList(data.results || []);
        } catch (error) {
            console.log(error);
            setErrorMessages('Something went wrong. Please try again later.');
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        fetchMovies(debouncedSearchTerm);
    }, [debouncedSearchTerm]);
  return (
        <main>
            <div className="pattern"/>
            <div className='wrapper'>
               <header>
                   <img src='/hero-img.png' alt='hero-banner'/>
                   <h1>Find <span className='text-gradient'>Movies</span> You’ll Love Without the Hassle</h1>
                <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
               </header>
                <section className="all-movies">
                    <h2 className='mt-[40px]'>Trending Now</h2>
                    {loading ? (<Spinner/>) : errorMessages ? (<h3 className='text-red-500'>{errorMessages}</h3>) : (
                        moviesList.map((movie) => (
                            <ul>
                            {moviesList.map((movie) => (
                              <li key={movie.id}>
                                <MovieCard movie={movie} />
                              </li>
                            ))}
                          </ul>                          
                        ))
                    )}
                </section>
            </div>
        </main>
  )
}

export default App
