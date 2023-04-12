import type { NextApiRequest, NextApiResponse } from 'next';
import { axiosInstance } from '@vulcan-sql/catalog-server/utils/vulcanSQLAdapter';
import { HttpError } from '@vulcan-sql/catalog-server/utils/errorCode';
import * as microCors from 'micro-cors';
const cors = microCors();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, query, url } = req;

  if (method === 'GET') {
    try {
      const querySuffix = url.includes('?') ? `?${url.split('?')[1]}` : '';
      const downloadPath = (query.slug as string[]).join('/');
      const { data } = await axiosInstance.get(downloadPath + querySuffix);
      res.setHeader('Content-Type', 'application/octet-stream');
      res.status(200).send(data);
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.status).json({ code: error.code });
      }
      throw error;
    }
  } else {
    res.status(404).end();
  }
};

export default cors(handler);
