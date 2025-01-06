import { NextApiRequest, NextApiResponse } from 'next';
import { apiClient } from '@/utils/apiClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const data = await apiClient('/process-ai', {
        method: 'POST',
        body: JSON.stringify(req.body),
      });
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
