const fs = require('fs');
const path = require('path');

function generate() {
  const [componentPath] = process.argv.slice(2);
  const componentName = componentPath.split('/')[componentPath.split('/').length - 1];
  const targetPath = normalizedPath(componentPath);

  if (!directoryExists(targetPath)) {
    createDirectory(targetPath);
  }

  copyFilesToTarget(targetPath, componentName);
  replaceContentWithComponentName(targetPath, componentName);

  console.log(`Generated '${componentName} name in ${targetPath}'`);
}

function normalizedPath(targetPath) {
  return path.normalize(path.resolve(__dirname, targetPath));
}

function directoryExists(targetPath) {
  try {
    return fs.existsSync(targetPath);
  } catch (err) {
    return false;
  }
}

function createDirectory(targetPath) {
  try {
    return fs.mkdirSync(targetPath, { recursive: true });
  } catch (err) {
    return err;
  }
}

function copyFilesToTarget(targetPath, componentName) {
  const templatesPath = './templates';

  try {
    fs.readdirSync(templatesPath).forEach((file) => {
      const templateNameToComponentName = file.replace('component', componentName);

      fs.copyFileSync(
        path.join(templatesPath, file),
        path.join(targetPath, templateNameToComponentName)
      );
    });
  } catch (err) {
    return err;
  }
}

function replaceContentWithComponentName(targetPath, componentName) {
  try {
    fs.readdirSync(targetPath).forEach((file) => {
      const content = fs.readFileSync(path.join(targetPath, file), { encoding: 'utf8' });
      const replacedContent = content.replace(/[c|C]omponent/g, componentName);

      fs.writeFileSync(path.join(targetPath, file), replacedContent);
    });
  } catch (err) {
    console.log(err);
    return err;
  }
}

generate();
