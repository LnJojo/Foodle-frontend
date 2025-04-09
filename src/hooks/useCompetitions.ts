import { useState, useEffect } from 'react';
import { competitionService } from '@/api/api';
import { Competition } from '@/types';

export function useCompetitions() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompetitions = async () => {
    try {
      setLoading(true);
      const data = await competitionService.getCompetitions();
      console.log('Fetched competitions data:', data);
      setCompetitions(data);
      setError(null);
    } catch (err: any) {
      setError('Erreur lors du chargement des compétitions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetitions();
  }, []);

  return { competitions, loading, error, refetch: fetchCompetitions };
}