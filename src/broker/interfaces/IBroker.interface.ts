export interface IBroker {
  _id?: string;
  token: string;
  type: 'private' | 'business' | 'simulation';
  displayName: string;
}
