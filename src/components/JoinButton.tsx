'use client';

import { useState } from 'react';

interface JoinButtonProps {
  eventId: string;
  isJoined: boolean;
  participantCount: number;
  onJoinToggle: (eventId: string, isJoining: boolean) => Promise<void>;
  disabled?: boolean;
}

export default function JoinButton({ 
  eventId, 
  isJoined, 
  participantCount, 
  onJoinToggle, 
  disabled 
}: JoinButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      await onJoinToggle(eventId, !isJoined);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleClick}
        disabled={disabled || isLoading}
        className={`px-4 py-2 rounded-md font-medium transition-colors ${
          isJoined
            ? 'bg-red-100 text-red-700 hover:bg-red-200'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isLoading ? 'Loading...' : isJoined ? 'Leave Event' : 'Join Event'}
      </button>
      <span className="text-sm text-gray-600">
        {participantCount} participant{participantCount !== 1 ? 's' : ''}
      </span>
    </div>
  );
}
