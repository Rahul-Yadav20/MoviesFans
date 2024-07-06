// src/components/MovieList.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import MovieCard from './MovieCard';
import '../css/MovieList.css';
import useDebounce from '../hooks/useDebounce ';

const API_KEY = '2dca580c2a14b55200e784d157207b4d';

const MovieList = () => {
  const [movies, setMovies] = useState({});
  const [year, setYear] = useState(2012);
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [noMoviesMessage, setNoMoviesMessage] = useState('');

  const debouncedSearchKeyword = useDebounce(searchKeyword, 500);

  const fetchMovies = useCallback(async (year, genres = [], keyword = '') => {
    const genreString = genres.length > 0 ? `&with_genres=${genres.join(',')}` : '';
    const searchString = keyword ? `&query=${keyword}` : '';
    const url = keyword
      ? `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}${searchString}`
      : `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&primary_release_year=${year}&vote_count.gte=100&sort_by=popularity.desc${genreString}`;
    const response = await axios.get(url);
    
    if (response.data.results.length === 0) {
      setNoMoviesMessage(`No movies present with the selected genre(s) or search keyword.`);
      setMovies(prevMovies => ({
        ...prevMovies,
        [year]: [],
      }));
    } else {
      setNoMoviesMessage('');
      const moviesWithDetails = await Promise.all(response.data.results.slice(0, 8).map(async (movie) => {
        const details = await axios.get(`https://api.themoviedb.org/3/movie/${movie.id}?api_key=${API_KEY}&append_to_response=credits`);
        return {
          ...movie,
          genres: details.data.genres,
          cast: details.data.credits.cast.slice(0, 5).map(member => member.name),
          director: details.data.credits.crew.find(member => member.job === 'Director')?.name,
        };
      }));
      setMovies(prevMovies => ({
        ...prevMovies,
        [year]: moviesWithDetails
      }));
    }
  }, []);

  useEffect(() => {
    fetchMovies(year, selectedGenres, debouncedSearchKeyword);
  }, [year, selectedGenres, debouncedSearchKeyword, fetchMovies]);

  const handleScroll = (e) => {
    if (e.deltaY > 0 && year < 2024) {
      setYear(prevYear => prevYear + 1);
    } else if (e.deltaY < 0 && year > 2010) {
      setYear(prevYear => prevYear - 1);
    }
  };

  const handleGenreChange = async (e) => {
    const { value, checked } = e.target;
    const newSelectedGenres = checked ? [...selectedGenres, value] : selectedGenres.filter(genre => genre !== value);
    setSelectedGenres(newSelectedGenres);
    setMovies({});
    fetchMovies(year, newSelectedGenres, searchKeyword);
  };

  const handleSearchChange = (e) => {
    setSearchKeyword(e.target.value);
  };

  useEffect(() => {
    const fetchGenres = async () => {
      const response = await axios.get(`https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}`);
      setGenres(response.data.genres);
    };
    fetchGenres();
  }, []);

  return (
    <div className="movie-list" onWheel={handleScroll}>
      <input 
        type="text" 
        placeholder="Search for movies..." 
        className="search-box" 
        value={searchKeyword}
        onChange={handleSearchChange}
      />
      <div className="genre-filter">
        {genres.map(genre => (
          <div key={genre.id}>
            <input type="checkbox" id={`genre-${genre.id}`} value={genre.id} onChange={handleGenreChange} />
            <label htmlFor={`genre-${genre.id}`}>{genre.name}</label>
          </div>
        ))}
      </div>
      {noMoviesMessage ? (
        <div className="no-movies-message">{noMoviesMessage}</div>
      ) : (
        Object.keys(movies).sort((a, b) => a - b).map(year => (
          movies[year].length > 0 && (
            <div key={year} className="year-section">
              <h2>{year}</h2>
              <div className="movies">
                {movies[year].map(movie => (
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
