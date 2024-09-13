import { Observable } from 'rxjs';
import { IUsuario } from './usuario.interface';

export interface IGrpcUsuarioService {
  FindOne(data: { id: number }): Observable<{ usuario: IUsuario }>;
}
