import type { NextApiRequest, NextApiResponse } from 'next'
import { HttpError } from '../../../utils/errorCode';
import { authHelper, getBearerToken } from '../../../utils/authHelper'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    headers,
    method,
  } = req

  if (method === 'GET') {
    try {
      const accessToken = getBearerToken(headers);
      await authHelper.logout(accessToken);
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.status).json({code: error.code});
      }
      throw error;
    }
  } else {
    res.status(404).end();
  }
}
