import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot 
} from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';
import { EscalaRegistro, Militar } from '../types';

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const dbId = firebaseConfigJson.firestoreDatabaseId || '(default)';
export const db = dbId && dbId !== '(default)' ? getFirestore(app, dbId) : getFirestore(app);

export interface AditamentoRecord {
  id: string;
  mesAno: string; // e.g. "2026-07"
  dataServico: string; // e.g. "2026-07-28"
  tipo: 'dia_util' | 'fim_de_semana';
  scaleColorMode?: 'preta' | 'vermelha';
  vermelhaType?: 'single' | 'block';
  omName: string;
  subUnidade: string;
  aprovisionadoraNome: string;
  aprovisionadoraFuncao: string;
  part2Text: string;
  part3Text: string;
  part4Text: string;
  escalas: Array<{
    dia?: string;
    label: string;
    militarName: string;
  }>;
  customSlotNames?: Record<string, string>;
  removedSlots?: Record<string, boolean>;
  signed: boolean;
  createdAt: string;
}

// SALVAR ADITAMENTO NO FIRESTORE
export const saveAditamentoToFirestore = async (aditamento: AditamentoRecord): Promise<boolean> => {
  try {
    const docRef = doc(db, 'aditamentos', aditamento.id);
    await setDoc(docRef, aditamento, { merge: true });
    return true;
  } catch (error) {
    console.error('Erro ao salvar aditamento no Firestore:', error);
    throw error;
  }
};

// SUBSCRIÇÃO EM TEMPO REAL PARA ADITAMENTOS
export const subscribeToAditamentos = (callback: (aditamentos: AditamentoRecord[]) => void) => {
  const colRef = collection(db, 'aditamentos');
  return onSnapshot(colRef, (snapshot) => {
    const results: AditamentoRecord[] = [];
    snapshot.forEach((docSnap) => {
      results.push(docSnap.data() as AditamentoRecord);
    });
    results.sort((a, b) => b.dataServico.localeCompare(a.dataServico));
    callback(results);
  }, (err) => {
    console.error('Erro na escuta em tempo real de aditamentos:', err);
  });
};

// BUSCAR ADITAMENTOS POR MÊS
export const getAditamentosByMonthFromFirestore = async (mesAno: string): Promise<AditamentoRecord[]> => {
  try {
    const colRef = collection(db, 'aditamentos');
    const q = query(colRef, where('mesAno', '==', mesAno));
    const querySnapshot = await getDocs(q);
    const results: AditamentoRecord[] = [];
    querySnapshot.forEach((docSnap) => {
      results.push(docSnap.data() as AditamentoRecord);
    });
    results.sort((a, b) => b.dataServico.localeCompare(a.dataServico));
    return results;
  } catch (error) {
    console.error('Erro ao buscar aditamentos por mês:', error);
    return [];
  }
};

export const getAllAditamentosFromFirestore = async (): Promise<AditamentoRecord[]> => {
  try {
    const colRef = collection(db, 'aditamentos');
    const querySnapshot = await getDocs(colRef);
    const results: AditamentoRecord[] = [];
    querySnapshot.forEach((docSnap) => {
      results.push(docSnap.data() as AditamentoRecord);
    });
    results.sort((a, b) => b.dataServico.localeCompare(a.dataServico));
    return results;
  } catch (error) {
    console.error('Erro ao buscar todos os aditamentos:', error);
    return [];
  }
};

export const deleteAditamentoFromFirestore = async (id: string): Promise<boolean> => {
  try {
    const docRef = doc(db, 'aditamentos', id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Erro ao excluir aditamento:', error);
    throw error;
  }
};

// SUBSCRIÇÃO EM TEMPO REAL E SINCRONIZAÇÃO DA ESCALA (REGISTROS)
export const subscribeToEscalaRegistros = (callback: (registros: EscalaRegistro[]) => void) => {
  const colRef = collection(db, 'escala_registros');
  return onSnapshot(colRef, (snapshot) => {
    const list: EscalaRegistro[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as EscalaRegistro);
    });
    callback(list);
  }, (err) => {
    console.error('Erro na escuta em tempo real de escala_registros:', err);
  });
};

export const saveEscalaRegistrosToFirestore = async (registros: EscalaRegistro[]) => {
  try {
    for (const reg of registros) {
      const docId = `${reg.militarId}_${reg.data}`;
      const docRef = doc(db, 'escala_registros', docId);
      await setDoc(docRef, reg, { merge: true });
    }
  } catch (error) {
    console.error('Erro ao salvar escala_registros no Firestore:', error);
  }
};

// SUBSCRIÇÃO EM TEMPO REAL DOS MILITARES
export const subscribeToMilitares = (callback: (militares: Militar[]) => void) => {
  const colRef = collection(db, 'militares');
  return onSnapshot(colRef, (snapshot) => {
    const list: Militar[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as Militar);
    });
    if (list.length > 0) {
      list.sort((a, b) => a.antiguidade - b.antiguidade);
      callback(list);
    }
  }, (err) => {
    console.error('Erro na escuta em tempo real de militares:', err);
  });
};

export const saveMilitaresToFirestore = async (militares: Militar[]) => {
  try {
    for (const m of militares) {
      const docRef = doc(db, 'militares', m.id);
      await setDoc(docRef, m, { merge: true });
    }
  } catch (error) {
    console.error('Erro ao salvar militares no Firestore:', error);
  }
};

