import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import ReactPlayer from 'react-player';
import { fetchAnimeDetails } from '../services/api';

export const Watch: React.FC = () => {
  const { id, episode } = useParams<{ id: string; episode: string }>();
  const { data: anime } = useQuery(['anime', id], () => fetchAnimeDetails(id!));

  // Note: This is a placeholder URL. In a real application, you would fetch the actual video URL
  const videoUrl = `https://example.com/anime/${id}/episode/${episode}`;

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="aspect-video w-full bg-gray-900 rounded-lg overflow-hidden">
          <ReactPlayer
            url={videoUrl}
            width="100%"
            height="100%"
            controls
            playing
            config={{
              file: {
                attributes: {
                  crossOrigin: 'anonymous',
                },
              },
            }}
          />
        </div>

        {anime && (
          <div className="mt-6">
            <h1 className="text-2xl font-bold mb-2">
              {anime.attributes.canonicalTitle} - Episode {episode}
            </h1>
            <p className="text-gray-400">
              Episode {episode} of {anime.attributes.episodeCount}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};