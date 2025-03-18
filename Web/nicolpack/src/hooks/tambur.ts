import { ITambur } from '../interface';
import { useEffect, useState } from 'react';
import { TamburService } from '../utility/services';

export const TamburHook = (loadingTambur: boolean) => {
    const [data, setData] = useState<ITambur[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const result = await TamburService.getAll();
                setData([...result]);
            }
            catch (error: any) {
                setData([]);
                setError(error.toString())
            }
            finally {
                setLoading(false);
            }
        }

        if (loadingTambur) {
            fetchData();
        }
    }, [loadingTambur])

    return { data, loading, error, setData }
}