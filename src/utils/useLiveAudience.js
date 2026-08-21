import { useEffect, useState } from 'react';
import { initVotingSession, listenToVoting } from '../firebase';

// Hook for the presenter to sync game state with the audience
export const useLiveAudience = (gameId, initialState) => {
  const [audienceData, setAudienceData] = useState(initialState);

  useEffect(() => {
    // When the component mounts, initialize the session
    initVotingSession('live_presentation', {
      activeGame: gameId,
      ...initialState
    });

    // Listen for audience votes
    const unsubscribe = listenToVoting('live_presentation', (data) => {
      setAudienceData(data);
    });

    return () => {
      // Clear the active game when unmounting
      initVotingSession('live_presentation', { activeGame: null });
      unsubscribe();
    };
  }, [gameId]); // Only re-run if gameId changes

  // Function to update the current state (e.g., when the presenter moves to the next question)
  const updateState = (newState) => {
    initVotingSession('live_presentation', {
      activeGame: gameId,
      ...newState
    });
  };

  return { audienceData, updateState };
};
