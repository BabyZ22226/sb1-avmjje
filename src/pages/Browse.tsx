import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Search, Filter, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimeCard } from '../components/ui/AnimeCard';
import { searchAnime } from '../services/api';
import { useTranslation } from 'react-i18next';

const genres = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mecha',
  'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural'
];

const ratings = ['G', 'PG', 'R', 'R18'];
const years = Array.from({ length: 2024 - 1990 + 1 }, (_, i) => 2024 - i);
const ITEMS_PER_PAGE = 20;

export const Browse: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedRating, setSelectedRating] = useState<string>('');
  const [minScore, setMinScore] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const { data, isLoading } = useQuery(
    ['search', searchQuery, selectedGenres, selectedYear, selectedRating, minScore, currentPage],
    () => searchAnime(searchQuery, {
      genres: selectedGenres,
      year: selectedYear,
      rating: selectedRating,
      minScore: minScore ? parseFloat(minScore) : undefined,
    }, currentPage, ITEMS_PER_PAGE),
    { 
      enabled: searchQuery.length > 0 || selectedGenres.length > 0 || selectedYear !== '' || selectedRating !== '' || minScore !== '' || currentPage > 1,
      keepPreviousData: true
    }
  );

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = data?.meta ? Math.ceil(data.meta.count / ITEMS_PER_PAGE) : 0;
  const searchResults = data?.data || [];

  const renderPagination = () => {
    if (!totalPages || totalPages <= 1) return null;

    const pageNumbers: (number | string)[] = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pageNumbers.push(i);
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pageNumbers.push(i);
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pageNumbers.push(i);
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        {pageNumbers.map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && handlePageChange(page)}
            disabled={page === '...'}
            className={`px-4 py-2 rounded-lg transition-colors ${
              page === currentPage
                ? 'bg-primary-600 text-white'
                : page === '...'
                ? 'bg-transparent text-gray-400 cursor-default'
                : 'bg-gray-800 text-white hover:bg-gray-700'
            }`}
          >
            {page}
          </button>
        ))}
        
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-8 space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('nav.search')}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to first page when search changes
              }}
              className="w-full pl-12 pr-4 py-3 bg-gray-800 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-3 bg-gray-800 rounded-lg text-white hover:bg-gray-700 transition-colors"
          >
            <Filter className="w-5 h-5" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="bg-gray-800 rounded-lg p-6 space-y-6 animate-fade-in">
            <div>
              <h3 className="text-lg font-semibold mb-3">Genres</h3>
              <div className="flex flex-wrap gap-2">
                {genres.map(genre => (
                  <button
                    key={genre}
                    onClick={() => toggleGenre(genre)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedGenres.includes(genre)
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Years</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Age Rating
                </label>
                <select
                  value={selectedRating}
                  onChange={(e) => {
                    setSelectedRating(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Ratings</option>
                  {ratings.map(rating => (
                    <option key={rating} value={rating}>{rating}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Minimum Score
                </label>
                <div className="relative">
                  <Star className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-400" />
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={minScore}
                    onChange={(e) => {
                      setMinScore(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="0.0"
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : searchResults.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {searchResults.map((anime) => (
              <AnimeCard
                key={anime.id}
                anime={anime}
                onClick={() => navigate(`/anime/${anime.id}`)}
              />
            ))}
          </div>
          {renderPagination()}
        </>
      ) : (
        <div className="text-center py-12 text-gray-400">
          {searchQuery || selectedGenres.length > 0 || selectedYear || selectedRating || minScore
            ? 'No results found. Try adjusting your filters.'
            : 'Start searching or select filters to find anime.'}
        </div>
      )}
    </div>
  );
};