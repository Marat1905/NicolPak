import { ITambur } from '../../interface';
import { BaseService } from '../services';

export class TamburService {
    static getAll = async (): Promise<ITambur[]> => {
        const result = await BaseService.createInstance().get('Tambur/GetAll')
        return result.data;
    }
}