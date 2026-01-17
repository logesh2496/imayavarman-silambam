import { db } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc 
} from "firebase/firestore";
import type { InsertStudent, Student } from "@shared/schema";

const COLLECTION_NAME = "students";

export const studentService = {
  async getStudents(): Promise<Student[]> {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as Student));
  },

  async getStudent(id: string): Promise<Student | undefined> {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Student;
    } else {
      return undefined;
    }
  },

  async createStudent(student: InsertStudent): Promise<Student> {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), student);
    return { id: docRef.id, ...student };
  },

  async updateStudent(id: string, start: Partial<InsertStudent>): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, start);
  },

  async deleteStudent(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  }
};
