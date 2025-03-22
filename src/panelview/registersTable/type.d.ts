type RegisterView = 2 | 'signed' | 'unsigned' | 16 | 'ascii';

type RegisterValue = {
  name: string;
  rawName: string;
  value: string;
  watched: boolean;
  modified: number;
  id: number;
  viewType: RegisterView;
};