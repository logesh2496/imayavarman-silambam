import { db } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  getDocs,
  query,
  where
} from "firebase/firestore";
import type { InsertAchievement, Achievement } from "@shared/schema";

const COLLECTION_NAME = "achievements";

export const achievementService = {
  async getAchievements(studentId: string): Promise<Achievement[]> {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("studentId", "==", studentId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as Achievement));
  },

  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), achievement);
    return { id: docRef.id, ...achievement };
  }
};
