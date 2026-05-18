import { ref, uploadBytesResumable, getDownloadURL, SettableMetadata } from 'firebase/storage';
import { storage } from '../lib/firebase';

export async function uploadFile(
  file: File, 
  folder: string = 'general',
  onProgress?: (progress: number) => void
): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
  const storageRef = ref(storage, `${folder}/${fileName}`);
  
  const metadata: SettableMetadata = {
    contentType: file.type,
  };

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file, metadata);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(progress);
      },
      (error) => {
        console.error('Firebase Storage Upload Error:', error);
        reject(error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
}
