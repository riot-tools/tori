const fs = require('fs');
const path = require('path');
const package = require(path.resolve(__dirname, 'package.json'));
const { tori } = package;

exports.generate = async function generate(cmds) {
  const [componentType, componentPath] = cmds.slice(2);
  const componentName = componentPath.split('/')[componentPath.split('/').length - 1];
  const toriPaths = mapToriPaths(tori);

  const realPath = tori && tori.basePath ? toriPaths[componentType] : componentPath;

  const targetPath = normalizedPath(realPath);

  if (!directoryExists(targetPath)) {
    createDirectory(targetPath);
  }

  copyFilesToTarget(targetPath, componentName);
  replaceContentWithComponentName(targetPath, componentName);

  console.log(`Generated '${componentName}' component in '${targetPath}'`);
};

function mapToriPaths(toriConfig) {
  if (!toriConfig) return {};

  const base = normalizedPath(path.resolve(__dirname, toriConfig.basePath || ''));

  const paths = Object.keys(toriConfig).reduce((object, key) => {
    if (key === 'basePath') return object;

    const baseDir = toriConfig.basePath ? base : __dirname;
    const pathForKey = path.resolve(baseDir, toriConfig[key]);

    return {
      ...object,
      [key]: normalizedPath(pathForKey),
    };
  }, {});

  return {
    base,
    ...paths,
  };
}

function normalizedPath(targetPath) {
  return path.normalize(path.resolve(__dirname, targetPath));
}

function directoryExists(targetPath) {
  return fs.existsSync(targetPath);
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
