import type { NextApiRequest, NextApiResponse } from 'next';
import {
  authHelper,
  getBearerToken,
} from '@vulcan-sql/catalog-server/utils/authHelper';
import { HttpError } from '@vulcan-sql/catalog-server/utils/errorCode';
import * as microCors from 'micro-cors';
const cors = microCors();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { headers, method } = req;

  if (method === 'GET') {
    try {
      const accessToken = getBearerToken(headers);
      const { profile } = await authHelper.auth(accessToken);
      res.status(200).json(profile);
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
