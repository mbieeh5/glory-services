

export default function handler(req, res) {
    if (req.method === 'POST') {
      const { _csrf } = req.body;
      // Periksa apakah token CSRF valid
      if (_csrf === req.cookies['_csrf']) {
        // Token CSRF valid, lanjutkan dengan proses login
        // ...
        res.status(200).json({ success: true });
      } else {
        // Token CSRF tidak valid
        res.status(403).json({ success: false, error: 'Invalid CSRF token' });
      }
    } else {
      res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }
  }
  