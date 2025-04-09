import { useState, useEffect } from 'react';
import { groupService } from '@/api/api';
import { Group } from '@/types';

export function useGroups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const data = await groupService.getGroups();
      console.log('Fetched groups data:', data); // Pour le débogage
      
      // Si data est un objet avec une propriété results, utilisez data.results
      const groupsData = Array.isArray(data) ? data : [];
      setGroups(groupsData);
      
    } catch (err: any) {
      console.error('Error fetching groups:', err);
      setError('Erreur lors du chargement des groupes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return { groups, loading, error, refetch: fetchGroups };
}