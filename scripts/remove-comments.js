#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DIRECTORIES = ['app', 'components', 'hooks', 'services', 'store', 'utils', 'contexts', 'config', 'constants', 'types', 'styles', 'backend'];
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.py'];
const IGNORE_DIRS = ['node_modules', '.git', 'android', 'ios', 'build', '.expo', '__pycache__', 'migrations', '.venv', 'venv'];

let processedFiles = 0;
let modifiedFiles = 0;
let removedComments = 0;

function removeJSComments(code) {
  let result = code;
  let count = 0;
  
  const multiLineRegex = /\/\*(?!\*)[^*]*\*+(?:[^/*][^*]*\*+)*\//g;
  const multiLineMatches = result.match(multiLineRegex);
  if (multiLineMatches) count += multiLineMatches.length;
  result = result.replace(multiLineRegex, '');
  
  const jsdocRegex = /\/\*\*[\s\S]*?\*\//g;
  const jsdocMatches = result.match(jsdocRegex);
  if (jsdocMatches) count += jsdocMatches.length;
  result = result.replace(jsdocRegex, '');
  
  const lines = result.split('\n');
  const processedLines = lines.map(line => {
    let inString = false;
    let stringChar = '';
    let commentStart = -1;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const prevChar = i > 0 ? line[i - 1] : '';
      
      if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
        }
      }
      
      if (!inString && char === '/' && line[i + 1] === '/') {
        if (prevChar !== ':') {
          commentStart = i;
          break;
        }
      }
    }
    
    if (commentStart !== -1) {
      count++;
      return line.substring(0, commentStart).trimEnd();
    }
    return line;
  });
  
  result = processedLines.join('\n');
  result = result.replace(/\n{3,}/g, '\n\n');
  result = result.split('\n').map(line => line.trimEnd()).join('\n');
  result = result.trimStart();
  if (!result.endsWith('\n')) result += '\n';
  
  return { result, commentsRemoved: count };
}

function removePythonComments(code) {
  let result = code;
  let count = 0;
  
  // Удаляем docstrings (тройные кавычки) - более агрессивный паттерн
  const docstringRegex = /"""[\s\S]*?"""/g;
  const docstringMatches = result.match(docstringRegex);
  if (docstringMatches) count += docstringMatches.length;
  result = result.replace(docstringRegex, '');
  
  const docstringSingleRegex = /'''[\s\S]*?'''/g;
  const docstringSingleMatches = result.match(docstringSingleRegex);
  if (docstringSingleMatches) count += docstringSingleMatches.length;
  result = result.replace(docstringSingleRegex, '');
  
  // Удаляем однострочные комментарии #
  const lines = result.split('\n');
  const processedLines = lines.map(line => {
    // Пропускаем shebang
    if (line.trim().startsWith('#!')) return line;
    // Пропускаем encoding declarations
    if (line.trim().startsWith('# -*-') || line.trim().startsWith('# coding')) return line;
    
    let inString = false;
    let stringChar = '';
    let commentStart = -1;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const prevChar = i > 0 ? line[i - 1] : '';
      
      if ((char === '"' || char === "'") && prevChar !== '\\') {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
        }
      }
      
      if (!inString && char === '#') {
        commentStart = i;
        break;
      }
    }
    
    if (commentStart !== -1) {
      count++;
      const trimmed = line.substring(0, commentStart).trimEnd();
      return trimmed;
    }
    return line;
  });
  
  result = processedLines.join('\n');
  
  // Удаляем строки которые стали пустыми (были только комментарии)
  result = result.split('\n').filter((line, index, arr) => {
    // Сохраняем не более 2 пустых строк подряд
    if (line.trim() === '' && index > 0 && arr[index - 1].trim() === '' && index > 1 && arr[index - 2].trim() === '') {
      return false;
    }
    return true;
  }).join('\n');
  
  result = result.replace(/\n{3,}/g, '\n\n');
  result = result.split('\n').map(line => line.trimEnd()).join('\n');
  if (!result.endsWith('\n')) result += '\n';
  
  return { result, commentsRemoved: count };
}

function removeComments(code, ext) {
  if (ext === '.py') {
    return removePythonComments(code);
  }
  return removeJSComments(code);
}

function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      if (!IGNORE_DIRS.includes(item)) {
        processDirectory(itemPath);
      }
    } else if (stat.isFile()) {
      const ext = path.extname(item);
      if (EXTENSIONS.includes(ext)) {
        processFile(itemPath, ext);
      }
    }
  }
}

function processFile(filePath, ext) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { result, commentsRemoved: count } = removeComments(content, ext);
    
    processedFiles++;
    
    if (content !== result) {
      fs.writeFileSync(filePath, result, 'utf8');
      modifiedFiles++;
      removedComments += count;
      console.log(`✅ ${filePath} - удалено ${count} комментариев`);
    }
  } catch (error) {
    console.error(`❌ Ошибка обработки ${filePath}:`, error.message);
  }
}

function main() {
  console.log('🔍 Сканирование проекта и удаление комментариев...\n');
  
  const rootDir = path.resolve(__dirname, '..');
  
  for (const dir of DIRECTORIES) {
    const dirPath = path.join(rootDir, dir);
    processDirectory(dirPath);
  }
  
  const rootFiles = fs.readdirSync(rootDir);
  for (const file of rootFiles) {
    const filePath = path.join(rootDir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isFile()) {
      const ext = path.extname(file);
      if (EXTENSIONS.includes(ext)) {
        processFile(filePath, ext);
      }
    }
  }
  
  console.log('\n📊 Результаты:');
  console.log(`   Обработано файлов: ${processedFiles}`);
  console.log(`   Изменено файлов: ${modifiedFiles}`);
  console.log(`   Удалено комментариев: ${removedComments}`);
  console.log('\n✨ Готово!');
}

main();
