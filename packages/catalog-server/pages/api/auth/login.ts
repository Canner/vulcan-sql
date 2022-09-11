import type { NextApiRequest, NextApiResponse } from 'next'
import { authHelper } from '../../../utils/authHelper'
import { HttpError } from '../../../utils/errorCode';
import * as microCors from 'micro-cors';
const cors = microCors();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const {
    body: { username, password },
    method,
  } = req

  if (method === 'POST') {
    try {
      const { accessToken, refreshToken, profile } = await authHelper.login({
        username,
        password,
      });
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
