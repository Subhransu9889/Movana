import {useEffect, useState} from 'react'
import Search from "./Componenet/Search.jsx";
import Spinner from "./Componenet/Spinner.jsx";
import MovieCard from "./Componenet/MovieCard.jsx";
import  {useDebounce} from "react-use";
import {getTrendingMovies, updateSearcCount} from "./appwrite.js";

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
    const [trendingMovies, setTrendingMovies] = useState([]);
    const [trandingError, setTrandingError] = useState('');
    const [trendingLoading, setTrendingLoading] = useState(false);

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

            if(query && data.results.length > 0) {
                await updateSearcCount(query, data.results[0]);
            }
        } catch (error) {
            console.log(error);
            setErrorMessages('Something went wrong. Please try again later.');
        } finally {
            setLoading(false);
        }
    }

    const loadTrendingMovies = async () => {
        try{
            setTrendingLoading(true);
            const movie = await getTrendingMovies();
            setTrendingMovies(movie);
        } catch (error) {
            console.log(error);
            setTrandingError('Something went wrong. Please try again later.');
        } finally {
            setTrendingLoading(false);
        }
    }
    useEffect(() => {
        fetchMovies(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    useEffect(() => {
        loadTrendingMovies();
    }, []);

  return (
        <main>
            <div className="pattern"/>
            <div className='wrapper'>
               <header>
                   <img src='/logo.svg' alt='logo' className='logo main_logo'/>
                   <img src='/hero-img.png' alt='hero-banner'/>
                   <h1>Find <span className='text-gradient'>Movies</span> You’ll Love Without the Hassle</h1>
                <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
               </header>

                {trendingLoading ? (<Spinner/>) : trandingError ? (<h3 className='text-red-500'>{trandingError}</h3>) : trendingMovies.length > 0 && (
                    <section className="trending">
                        <h2>Trending Today</h2>
                        <ul>
                            {trendingMovies.map((movie, index) => (
                                <li key={movie.$id}>
                                    <p>{index+1}</p>
                                    <img src={movie.poster_url} alt={movie.movie_id}/>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                <section className="all-movies">
                    <h2>All Movies</h2>
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
