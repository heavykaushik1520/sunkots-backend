
// const jwt = require('jsonwebtoken');

// function isAdmin(req, res, next) {
//   const token = req.header('Authorization');

//   if (!token) {
//     return res.status(401).json({ message: 'Access denied. No token provided.' });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
//     req.admin = decoded;

//     if (req.admin.role === 'admin' || req.admin.role === 'superadmin') {
//       next(); 
//     } else {
//       return res.status(403).json({ message: 'Access denied. Admin role required.' }); 
//     }
//   } catch (error) {
//     res.status(400).json({ message: 'Invalid token.' });
//   }
// }

// module.exports = { isAdmin };

const jwt = require('jsonwebtoken');

function isAdmin(req, res, next) {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1]; // ⬅️ Only the token part

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
    req.admin = decoded;

    if (req.admin.role === 'admin' || req.admin.role === 'superadmin') {
      next();
    } else {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }
  } catch (error) {
    return res.status(400).json({ message: 'Invalid token.' });
  }
}

module.exports = { isAdmin };
