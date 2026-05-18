import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface NewsArticle {
  id?: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  category: string;
  tags?: string[];
  isFeatured: boolean;
  authorName?: string;
  createdAt: any;
  updatedAt?: any;
}

export const newsService = {
  async getLatestNews(l = 10) {
    const path = 'news';
    try {
      const q = query(collection(db, path), orderBy('createdAt', 'desc'), limit(l));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NewsArticle));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, path);
    }
  },

  async createNews(article: Omit<NewsArticle, 'id' | 'createdAt'>) {
    const path = 'news';
    try {
      return await addDoc(collection(db, path), {
        ...article,
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, path);
    }
  },

  async updateNews(id: string, article: Partial<NewsArticle>) {
    const path = `news/${id}`;
    try {
      const docRef = doc(db, 'news', id);
      await updateDoc(docRef, {
        ...article,
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, path);
    }
  },

  async deleteNews(id: string) {
    const path = `news/${id}`;
    try {
      await deleteDoc(doc(db, 'news', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, path);
    }
  }
};

export interface Ad {
  id?: string;
  title: string;
  type: 'horizontal' | 'vertical' | 'middle';
  imageUrl: string;
  link: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  section?: string;
}

export const adService = {
  async getAds() {
    const path = 'ads';
    try {
      const now = new Date().toISOString();
      const q = query(
        collection(db, path), 
        where('isActive', '==', true)
      );
      const snapshot = await getDocs(q);
      const ads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ad));
      
      // Client side filter for dates since multiple range queries in Firestore are tricky or require indexes
      return ads.filter(ad => {
        if (ad.startDate && ad.startDate > now) return false;
        if (ad.endDate && ad.endDate < now) return false;
        return true;
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, path);
    }
  },

  async createAd(ad: Omit<Ad, 'id'>) {
    const path = 'ads';
    try {
      return await addDoc(collection(db, path), ad);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, path);
    }
  },

  async updateAd(id: string, ad: Partial<Ad>) {
    const path = `ads/${id}`;
    try {
      const docRef = doc(db, 'ads', id);
      await updateDoc(docRef, ad);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, path);
    }
  },

  async deleteAd(id: string) {
    const path = `ads/${id}`;
    try {
      await deleteDoc(doc(db, 'ads', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, path);
    }
  }
};
