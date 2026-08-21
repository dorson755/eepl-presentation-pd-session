import { useEffect, useState, useCallback, useRef } from 'react';
import { updateSessionState, listenToVoting } from '../firebase';

export const useLiveAudience = (gameId, initialGameData = null) => {
  const [audienceData, setAudienceData] = useState(initialGameData);
  const currentGameDataRef = useRef(initialGameData);

  // Keep ref up to date
  useEffect(() => {
    currentGameDataRef.current = initialGameData;
  }, [initialGameData]);

  // Publish state when active
  const publishState = useCallback((gameData) => {
    currentGameDataRef.current = gameData;
    updateSessionState('live_presentation', {
      activeGame: gameId,
      gameData: gameData,
      updatedAt: Date.now()
    });
  }, [gameId]);

  useEffect(() => {
    const unsubscribe = listenToVoting('live_presentation', (data) => {
      if (data?.activeGame === gameId && data?.gameData) {
        setAudienceData(data.gameData);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [gameId]);

  return { 
    audienceData, 
    votes: audienceData?.votes || {}, 
    publishState 
  };
};
