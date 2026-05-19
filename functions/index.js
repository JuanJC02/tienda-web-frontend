const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp }      = require("firebase-admin/app");
const { getAuth }            = require("firebase-admin/auth");
const { getFirestore }       = require("firebase-admin/firestore");

initializeApp();

/**
 * deleteUser — Cloud Function callable
 * Elimina un usuario de Firebase Auth Y de Firestore.
 * Solo puede ser llamada por un administrador autenticado.
 */
exports.deleteUser = onCall(async (request) => {
  // 1. Verificar que el llamante está autenticado
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Debes estar autenticado.");
  }

  // 2. Verificar que el llamante es administrador
  const db = getFirestore();
  const callerSnap = await db.doc(`usuarios/${request.auth.uid}`).get();
  if (!callerSnap.exists || callerSnap.data().rol !== "administrador") {
    throw new HttpsError("permission-denied", "Solo los administradores pueden eliminar usuarios.");
  }

  const { uid } = request.data;

  // 3. Validaciones básicas
  if (!uid || typeof uid !== "string") {
    throw new HttpsError("invalid-argument", "Se requiere el uid del usuario.");
  }
  if (uid === request.auth.uid) {
    throw new HttpsError("invalid-argument", "No puedes eliminarte a ti mismo.");
  }

  // 4. Eliminar de Firestore
  await db.doc(`usuarios/${uid}`).delete();

  // 5. Eliminar de Firebase Auth (borrado completo)
  await getAuth().deleteUser(uid);

  return { success: true };
});
