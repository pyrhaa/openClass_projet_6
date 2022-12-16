//Permet de gérer les fichiers entrants dans les requêtes HTTP
const multer = require('multer');
const fs = require('fs');

//Permet de récupérer le format d'une image
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

//renomme et enregistre l'image dans le dossier IMAGES (qui apparaît dans notre backend)
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    const path = 'images';
    fs.mkdirSync(path, { recursive: true });
    callback(null, path);
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + '.' + extension);
  }
});

module.exports = multer({ storage: storage }).single('image');
