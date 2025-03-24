import { ITambur } from '../../interface/ITambur';
import { BaseService } from './base';

export class TamburService {
    static getAll = async (): Promise<ITambur[]> => {
        const result = await BaseService.createInstance().get('Tambur/GetAll')
        return result.data;
    }
}