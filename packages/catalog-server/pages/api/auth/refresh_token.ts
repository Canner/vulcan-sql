import type { NextApiRequest, NextApiResponse } from 'next'
import { authHelper, getBearerToken } from '../../../utils/authHelper'
import { HttpError } from '../../../utils/errorCode';
import * as microCors from 'micro-cors';
const cors = microCors();

export const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const {
    headers,
    method,
  } = req

  if (method === 'POST') {
    try {
      const refreshTokenFromHeader = getBearerToken(headers);
      const { accessToken, refreshToken, profile } = await authHelper.refreshToken(refreshTokenFromHeader);
      res.status(200).json({ accessToken, refreshToken, profile });
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

export default cors(handler);
