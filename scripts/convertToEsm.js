import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

// Gestion des chemins avec ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

/**
 * Convertit un fichier de CommonJS à ESM
 */
async function convertFile(filePath) {
  console.log(`Conversion du fichier: ${filePath}`);
  const content = await readFile(filePath, 'utf8');
  
  // 1. Remplacer les require par des import
  let updatedContent = content
    .replace(/const\s+(\w+)\s*=\s*require\(['"]([^'"]+)['"]\);?/g, (_, varName, importPath) => {
      // Ajouter l'extension .js aux imports relatifs
      if (importPath.startsWith('./') || importPath.startsWith('../')) {
        if (!importPath.endsWith('.js')) {
          importPath += '.js';
        }
      }
      return `import ${varName} from '${importPath}';`;
    });
    
  // 2. Remplacer les destructuring require
  updatedContent = updatedContent
    .replace(/const\s*{\s*([^}]+)\s*}\s*=\s*require\(['"]([^'"]+)['"]\);?/g, (_, imports, importPath) => {
      // Ajouter l'extension .js aux imports relatifs
      if (importPath.startsWith('./') || importPath.startsWith('../')) {
        if (!importPath.endsWith('.js')) {
          importPath += '.js';
        }
      }
      return `import { ${imports} } from '${importPath}';`;
    });
  
  // 3. Remplacer les exports.something par export const something
  updatedContent = updatedContent
    .replace(/exports\.(\w+)\s*=/g, 'export const $1 =');
  
  // 4. Remplacer module.exports = par export default
  updatedContent = updatedContent
    .replace(/module\.exports\s*=\s*/g, 'export default ');
  
  await writeFile(filePath, updatedContent, 'utf8');
  console.log(`Fichier converti avec succès: ${filePath}`);
}

/**
 * Convertit tous les fichiers dans un dossier
 */
async function convertDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Convertir récursivement les sous-dossiers
      await convertDirectory(filePath);
    } else if (file.endsWith('.js')) {
      // Convertir les fichiers JS
      await convertFile(filePath);
    }
  }
}

// Dossiers à convertir
const directories = [
  path.join(__dirname, '../controllers'),
  path.join(__dirname, '../models')
];

// Conversion de tous les dossiers
async function main() {
  try {
    for (const dir of directories) {
      await convertDirectory(dir);
    }
    console.log('Conversion terminée avec succès!');
  } catch (error) {
    console.error('Erreur lors de la conversion:', error);
  }
}

main();
