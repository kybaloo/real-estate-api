import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Gestion des chemins avec ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chemins des fichiers
const openApiPath = path.join(__dirname, '../docs/openapi.json');
const pathsPath = path.join(__dirname, '../docs/paths.json');
const outputPath = path.join(__dirname, '../docs/openapi-complete.json');

// Lecture des fichiers
const openApi = JSON.parse(fs.readFileSync(openApiPath, 'utf8'));
const paths = JSON.parse(fs.readFileSync(pathsPath, 'utf8'));

// Fusion des fichiers
const mergedSpec = {
  ...openApi,
  paths: paths.paths
};

// Écriture du fichier fusionné
fs.writeFileSync(outputPath, JSON.stringify(mergedSpec, null, 2));

console.log('Documentation OpenAPI générée avec succès !');
