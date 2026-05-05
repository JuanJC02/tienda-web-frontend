import { createContext, useContext, useState } from "react";

const GaleriaContext = createContext();

const COMPETITION_DURATION = 5 * 60 * 1000; // 5 minutos (demo)

export function GaleriaProvider({ children }) {
  const [fotos, setFotos] = useState([]);
  const [competitionEndTime, setCompetitionEndTime] = useState(null);

  const subirFoto = (userId, userName, imageBase64) => {
    const newFoto = {
      id: Date.now(),
      userId,
      userName,
      image: imageBase64,
      likes: [],
      timestamp: Date.now(),
    };
    setFotos((prev) => [...prev, newFoto]);
    if (!competitionEndTime) {
      setCompetitionEndTime(Date.now() + COMPETITION_DURATION);
    }
  };

  const likePhoto = (fotoId, userId) => {
    setFotos((prev) =>
      prev.map((f) => {
        if (f.id !== fotoId) return f;
        const alreadyLiked = f.likes.includes(userId);
        return {
          ...f,
          likes: alreadyLiked
            ? f.likes.filter((id) => id !== userId)
            : [...f.likes, userId],
        };
      })
    );
  };

  const resetCompetition = () => {
    setFotos([]);
    setCompetitionEndTime(null);
  };

  return (
    <GaleriaContext.Provider value={{ fotos, competitionEndTime, subirFoto, likePhoto, resetCompetition, COMPETITION_DURATION }}>
      {children}
    </GaleriaContext.Provider>
  );
}

export const useGaleria = () => useContext(GaleriaContext);
