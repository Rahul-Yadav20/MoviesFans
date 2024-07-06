// Importing hooks
import React, { useState, useEffect, useCallback } from 'react';
// axios library to fetch api data
import axios from 'axios';
// Importing movies card component
import MovieCard from './MovieCard';
// Importing loader component
import Loader from './Loader';
// importing css 
import '../css/MovieList.css';
// importing custom debouncing hook
import useDebounce from '../hooks/useDebounce';

// defining global veriable for APi Key
const API_KEY = '2dca580c2a14b55200e784d157207b4d';

const MovieList = () => {

  // All the hooks for defining state variables
  const [movies, setMovies] = useState({});
  const [year, setYear] = useState(2012);
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [noMoviesMessage, setNoMoviesMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Passing search query function to  useDebounce hook and time delay
  const debouncedSearchKeyword = useDebounce(searchKeyword, 500);

  // Fetch function to load movies and useCallback to optimise the function and chache the function
  const fetchMovies = useCallback(async (year, genres = [], keyword = '', showLoader = false, setNoMovies = true) => {

    // show loader when movies are not loaded
    if (showLoader) setLoading(true);

    // checking genres length to add it with query parameter in APi
    const genreString = genres.length > 0 ? `&with_genres=${genres.join(',')}` : '';

    // checking genres length to add it with query parameter in APi
    const searchString = keyword ? `&query=${keyword}` : '';

    // initializing url variable based on keyword length
    // store search url if user searching 
    // otherwise fetch all movies based on release year 
    const url = keyword
      ? `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}${searchString}`
      : `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&primary_release_year=${year}&vote_count.gte=100&sort_by=popularity.desc${genreString}`;

    // fetching movies using axios 
    const response = await axios.get(url);

    // if there is no movies, Display the message
    if (response.data.results.length === 0 && setNoMovies) {
      setNoMoviesMessage(`No movies present with the selected genre(s) or search keyword.`);
      setMovies(prevMovies => ({
        ...prevMovies,
        [year]: [],
      }));
    } else {
      // set message empty if movies are fetched
      setNoMoviesMessage('');

      // resolve all the promises and store fetched data into the moviesWithDetails variable
      const moviesWithDetails = await Promise.all(response.data.results.slice(0, 8).map(async (movie) => {
        // Fetching all movies details one by one by movie id 
        const details = await axios.get(`https://api.themoviedb.org/3/movie/${movie.id}?api_key=${API_KEY}&append_to_response=credits`);

        // holding previous state of movie and Storing all details into distinct state variables 
        return {
          ...movie,
          genres: details.data.genres,
          cast: details.data.credits.cast.slice(0, 5).map(member => member.name),
          director: details.data.credits.crew.find(member => member.job === 'Director')?.name,
        };
      }));

      // Storing all movies with their respective year
      setMovies(prevMovies => ({
        ...prevMovies,
        [year]: moviesWithDetails
      }));
    }
    // Set loading false when movies loading is finished
    setLoading(false);
  }, []);

  // Calling fetchMovies function before rendering based on year dependency
  useEffect(() => {
    fetchMovies(year, selectedGenres, debouncedSearchKeyword, false, false);
  }, [year]);

  // Calling fetchMovies function when user searching a movie 
  useEffect(() => {
    fetchMovies(year, selectedGenres, debouncedSearchKeyword, true, true);
  }, [selectedGenres, debouncedSearchKeyword]);

  // Call this function when user scroll
  const handleScroll = (e) => {
    // for Scrolling up
    if (e.deltaY > 0 && year < 2024) {
      setYear(prevYear => prevYear + 1);
    } else if (e.deltaY < 0 && year > 2010) { 
      // for scrolling down
      setYear(prevYear => prevYear - 1);
    }
  };

  // Call the function when genre filters applied
  const handleGenreChange = async (e) => {
    // destructure selected genres
    const { value, checked } = e.target;
    // hold previous selected genres and add new selected genres if it is there
    const newSelectedGenres = checked ? [...selectedGenres, value] : selectedGenres.filter(genre => genre !== value);
    setSelectedGenres(newSelectedGenres);
    setMovies({});
    // call fetchMovies function using genre filters
    fetchMovies(year, newSelectedGenres, searchKeyword, true, true);
  };

  // Call the function for movie searching
  const handleSearchChange = (e) => {
    setSearchKeyword(e.target.value);
  };

  // Call the function for movie searching but when user pres enter key
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      setMovies({});
      fetchMovies(year, selectedGenres, searchKeyword, true, true);
    }
  };

  // Fetching all genres list here
  useEffect(() => {
    const fetchGenres = async () => {
      const response = await axios.get(`https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}`);
      setGenres(response.data.genres);
    };
    fetchGenres();
  }, []);

  return (
    <div className="movie-list" onWheel={handleScroll}>
      {/* Show Loader if loading is true */}
      {loading && <Loader />}

      {/* Search box */}
      <input
        type="text"
        placeholder="Search for movies..."
        className="search-box"
        value={searchKeyword}
        onChange={handleSearchChange}
        onKeyPress={handleSearchKeyPress}
      />
      {/* Genre filters */}
      <div className="genre-filter">
        {/* Fetching genre values one by one from genre array (state variable) */}
        {genres.map(genre => (
          <div key={genre.id}>
            <input type="checkbox" id={`genre-${genre.id}`} value={genre.id} onChange={handleGenreChange} />
            <label htmlFor={`genre-${genre.id}`}>{genre.name}</label>
          </div>
        ))}
      </div>

      {/* If there is not movie present or noMoviesMessage is true then show message*/}
      {noMoviesMessage ? (
        <div className="no-movies-message">{noMoviesMessage}</div>
      ) : (
        // If movies are present then sort them in ascending order by year 
        Object.keys(movies).sort((a, b) => a - b).map(year => (
          movies[year].length > 0 && (
            <div key={year} className="year-section">
              <h2>{year}</h2>
              <div className="movies">
                {movies[year].map(movie => (
                  // Passing movie as prop to MovieCard component
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            </div>
          )
        ))
      )}
    </div>
  );
};

export default MovieList;
