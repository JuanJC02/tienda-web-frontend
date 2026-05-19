import { createContext, useContext, useState, useEffect } from "react";
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc,
  doc, setDoc, getDocs,
} from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase/config";

const GaleriaContext = createContext();

const COMPETITION_DURATION = 5 * 60 * 1000; // 5 minutos

export function GaleriaProvider({ children }) {
  const [fotos, setFotos] = useState([]);
  const [competitionEndTime, setCompetitionEndTime] = useState(null);

  /* ── Escucha fotos en tiempo real ── */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "fotos"), (snap) => {
      setFotos(snap.docs.map((d) => ({ firestoreId: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  /* ── Escucha timer de la competencia ── */
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "configuracion", "galeria"), (snap) => {
      if (snap.exists()) {
        setCompetitionEndTime(snap.data().endTime ?? null);
      } else {
        setCompetitionEndTime(null);
      }
    });
    return unsub;
  }, []);

  /* ── Subir foto ── */
  const subirFoto = async (userId, userName, imageBase64) => {
    // Subir imagen a Firebase Storage
    const storageRef = ref(storage, `galeria/${userId}-${Date.now()}.jpg`);
    await uploadString(storageRef, imageBase64, "data_url");
    const imageUrl = await getDownloadURL(storageRef);

    // Guardar referencia en Firestore
    await addDoc(collection(db, "fotos"), {
      userId,
      userName,
      image: imageUrl,
      likes: [],
      timestamp: Date.now(),
    });

    // Iniciar competencia si no hay una activa
    if (!competitionEndTime) {
      await setDoc(doc(db, "configuracion", "galeria"), {
        endTime: Date.now() + COMPETITION_DURATION,
      });
    }
  };

  /* ── Like / unlike ── */
  const likePhoto = async (firestoreId, userId) => {
    const foto = fotos.find((f) => f.firestoreId === firestoreId);
    if (!foto) return;
    const alreadyLiked = foto.likes.includes(userId);
    await updateDoc(doc(db, "fotos", firestoreId), {
      likes: alreadyLiked
        ? foto.likes.filter((id) => id !== userId)
        : [...foto.likes, userId],
    });
  };

  /* ── Reiniciar competencia ── */
  const resetCompetition = async () => {
    const snap = await getDocs(collection(db, "fotos"));
    for (const d of snap.docs) await deleteDoc(doc(db, "fotos", d.id));
    await setDoc(doc(db, "configuracion", "galeria"), { endTime: null });
  };

  return (
    <GaleriaContext.Provider
      value={{ fotos, competitionEndTime, subirFoto, likePhoto, resetCompetition, COMPETITION_DURATION }}
    >
      {children}
    </GaleriaContext.Provider>
  );
}

export const useGaleria = () => useContext(GaleriaContext);
