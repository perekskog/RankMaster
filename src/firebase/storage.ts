'use client';
import { FirebaseStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Uploads a file to Firebase Storage.
 * @param storage The Firebase Storage instance.
 * @param file The file to upload.
 * @param path The path where the file should be stored.
 * @returns A promise that resolves with the download URL of the uploaded file.
 */
export async function uploadFile(storage: FirebaseStorage, file: File, path: string): Promise<string> {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
}
