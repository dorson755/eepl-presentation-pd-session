import { useEffect, useState, useCallback, useRef } from 'react';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db, listenToVoting } from '../firebase';

export const useLiveAudience = (gameId, initialGameData = null) => {
  const [audienceData, setAudienceData] = useState(initialGameData);
  const currentGameDataRef = useRef(initialGameData);

  // Keep ref up to date
  useEffect(() => {
    currentGameDataRef.current = initialGameData;
  }, [initialGameData]);

  // Publish state when active.
  // Uses updateDoc (not setDoc with merge) so that gameData is REPLACED
  // entirely — clearing stale vote keys from previous games (e.g. leftover
  // 'helpful'/'harmful' keys from DigitalSorting bleeding into MythVsFact's
  // 'fact'/'myth' totals). Falls back to setDoc if the document doesn't
  // exist yet (e.g. publishState fires before SlideSync creates the document).
  const publishState = useCallback((gameData) => {
    currentGameDataRef.current = gameData;
    const ref = doc(db, 'sessions', 'live_presentation');
    updateDoc(ref, {
      activeGame: gameId,
      gameData: gameData,
      updatedAt: Date.now()
    }).catch(() => {
      setDoc(ref, {
        activeGame: gameId,
        gameData: gameData,
        updatedAt: Date.now()
      }, { merge: true });
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
