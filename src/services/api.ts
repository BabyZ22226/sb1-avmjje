import axios from 'axios';
import type { Anime } from '../types/anime';

const api = axios.create({
  baseURL: 'https://kitsu.io/api/edge',
  headers: {
    'Accept': 'application/vnd.api+json',
    'Content-Type': 'application/vnd.api+json',
  },
});

interface SearchFilters {
  genres?: string[];
  year?: string;
  rating?: string;
  minScore?: number;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    count: number;
  };
  links: {
    first: string;
    prev?: string;
    next?: string;
    last: string;
  };
}

export const fetchTrendingAnime = async (): Promise<Anime[]> => {
  const response = await api.get('/trending/anime');
  return response.data.data;
};

export const fetchPopularAnime = async (): Promise<Anime[]> => {
  const response = await api.get('/anime', {
    params: {
      'sort': '-averageRating',
      'page[limit]': 20,
    },
  });
  return response.data.data;
};

export const searchAnime = async (
  query: string,
  filters: SearchFilters = {},
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<Anime>> => {
  const params: Record<string, any> = {
    'page[limit]': limit,
    'page[offset]': (page - 1) * limit,
  };

  if (query) {
    params['filter[text]'] = query;
  }

  if (filters.genres?.length) {
    params['filter[genres]'] = filters.genres.join(',');
  }

  if (filters.year) {
    params['filter[seasonYear]'] = filters.year;
  }

  if (filters.rating) {
    params['filter[ageRating]'] = filters.rating;
  }

  if (filters.minScore) {
    params['filter[averageRating]'] = `${filters.minScore * 20}..`;
  }

  const response = await api.get('/anime', { params });
  return response.data;
};

export const fetchAnimeDetails = async (id: string): Promise<Anime> => {
  const response = await api.get(`/anime/${id}`, {
    params: {
      include: 'episodes,genres',
    },
  });
  return response.data.data;
};

export const fetchAnimeByCategory = async (category: string): Promise<Anime[]> => {
  const response = await api.get('/anime', {
    params: {
      'filter[categories]': category,
      'page[limit]': 20,
    },
  });
  return response.data.data;
};