import { ReaderDocument } from '../types';

export type RootStackParamList = {
  Tabs: undefined;
  Reader: { document: ReaderDocument };
  EditDocument: { documentId: string };
};

export type DrawerParamList = {
  Kindle: undefined;
  Perfil: undefined;
};

export type TabParamList = {
  Inicio: undefined;
  Biblioteca: undefined;
  Explorar: undefined;
  Upload: undefined;
};
