import { db } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where,
  orderBy,
  deleteDoc,
  doc
} from "firebase/firestore";
import type { InsertDailyLog, DailyLog } from "@shared/schema";

const COLLECTION_NAME = "daily_logs";

export const dailyLogService = {
  async getDailyLogs(studentId: string): Promise<DailyLog[]> {
    const q = query(
      collection(db, COLLECTION_NAME), 
      where("studentId", "==", studentId),
      orderBy("date", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date.toDate() // Convert Firestore Timestamp to Date
      } as DailyLog;
    });
  },

  async createDailyLog(log: InsertDailyLog): Promise<DailyLog> {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), log);
    return { id: docRef.id, ...log } as DailyLog;
  },

  async getDailyLogsByDate(date: Date): Promise<DailyLog[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const q = query(
      collection(db, COLLECTION_NAME),
      where("date", ">=", startOfDay),
      where("date", "<=", endOfDay)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date.toDate()
      } as DailyLog;
    });
  },

  async getDailyLogsRange(startDate: Date, endDate: Date): Promise<DailyLog[]> {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const q = query(
      collection(db, COLLECTION_NAME),
      where("date", ">=", start),
      where("date", "<=", end) // Firestore requires composite index for multiple fields + inequality.
      // Here we only filter by date, so simple index is enough.
      // If we filtered by studentId too, we might need composite index.
    );

    // Note: If this query fails, we might need to create an index in Firebase console.
    // However, single field range queries usually work for inequality on the same field.
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date.toDate()
      } as DailyLog;
    });
  },

  async deleteDailyLog(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  }
};
