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
import GenreFilter from './GenreFilter';

import { FaArrowUp } from "react-icons/fa6";

// defining global veriable for APi Key
const API_KEY = '2dca580c2a14b55200e784d157207b4d';

const MovieList = () => {
  // All the hooks for defining state variables
  const [movies, setMovies] = useState({});
  const [year, setYear] = useState(2012);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [noMoviesMessage, setNoMoviesMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [touchStartY, setTouchStartY] = useState(null);
  const [fetchingNext, setFetchingNext] = useState(false);

  // Passing search query function to  useDebounce hook and time delay
  const debouncedSearchKeyword = useDebounce(searchKeyword, 500);

  // Fetch function to load movies and useCallback to optimise the function and chache the function
  const fetchMovies = useCallback(async (year, genres = [], keyword = '', showLoader = false, setNoMovies = true) => {

    // show loader when movies are not loaded
    if (showLoader) setLoading(true);

    let url = '';

    // store search url if user searching 
    // otherwise fetch all movies based on release year 
    if (keyword) {
      url = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${keyword}&year=${year}`;
    } else {
      const genreString = genres.length > 0 ? `&with_genres=${genres.join(',')}` : '';
      url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&primary_release_year=${year}&vote_count.gte=100&sort_by=popularity.desc${genreString}`;
    }

    // Error handling
    try {

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
    } catch (error) {
      console.error('Error fetching movies:', error);
      setNoMoviesMessage('Error fetching movies. Please try again later.');
    }
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
  const handleScroll = () => {

    // Destructuring the scrolling properties window document
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

    // If user scrolling down
    if (scrollTop + clientHeight >= scrollHeight - 5 && year < 2024) {
      setYear(prevYear => prevYear + 1);
    }
    // Scrolling up 
    else if (scrollTop === 0 && year > 2010) {
      setYear(prevYear => prevYear - 1);
    }
  };

  // User touch on mobile screen
  const handleTouchStart = (e) => {
    setTouchStartY(e.touches[0].clientY);
  };

  // Touch events on mobile screen
  const handleTouchMove = (e) => {
    if (!touchStartY) return; // If touchStartY is not set, exit early

    const touchEndY = e.touches[0].clientY; // Get the Y coordinate of the touch end
    const deltaY = touchStartY - touchEndY; // Calculate the difference in Y coordinates

    // Check if deltaY (vertical movement) is greater than 5 pixels
    // and if the user has scrolled to the bottom of the page
    // and if the year is less than 2024 (to prevent going beyond the available years)
    if (deltaY > 5 && window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight && year < 2024 && !fetchingNext) {
      setFetchingNext(true);
      setYear(prevYear => prevYear + 1); // Increment the year by 1
    }

    // Check if deltaY (vertical movement) is less than -5 pixels
    // and if the user has scrolled to the top of the page
    // and if the year is greater than 2010 (to prevent going before 2012)
    else if (deltaY < -5 && window.scrollY === 0 && year > 2010 && !fetchingNext) {
      setFetchingNext(true);
      setYear(prevYear => prevYear - 1); // Decrement the year by 1
    }

    setTouchStartY(null); // Reset touchStartY to null
  };


  // Call the function when genre filters applied
  const handleGenreChange = async (genreId, checked) => {
    // Filtering genre based on add or remove genre by user
    const newSelectedGenres = checked
      ? [...selectedGenres, genreId]
      : selectedGenres.filter(id => id !== genreId);
    setSelectedGenres(newSelectedGenres);
    setMovies({});
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

  // Scroll top button
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    // Add an event listener for the 'scroll' event when the component mounts
    window.addEventListener('scroll', handleScroll);

    // Cleanup function to remove the event listener when the component unmounts
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return (
    <div
      className="movie-list"
      onWheel={handleScroll}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
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
      <GenreFilter selectedGenres={selectedGenres} onChange={handleGenreChange} /> {/* Use the GenreFilter component */}

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
      <button className="scroll-to-top" onClick={scrollToTop}><FaArrowUp /></button>
    </div>
  );
};

export default MovieList;
