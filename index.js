const fs = require('fs');
const path = require('path');
const package = require(path.resolve(__dirname, 'package.json'));
const { tori } = package;

exports.generate = async function generate(cmds) {
  const [componentType, componentPath] = cmds.slice(2);

  // If we don't pass in a component type, the first param is the actual path
  const typeSetInConfig = tori && tori.hasOwnProperty(componentType);
  const actualComponentPath = typeSetInConfig ? componentPath : componentType;

  // The last directory name can be used as the component name
  const componentName = actualComponentPath.split('/')[
    actualComponentPath.split('/').length - 1
  ];

  // Map tori config to actual paths
  const toriPaths = mapToriPaths(tori, componentName);

  // Choose the proper path to use for generation based on if the type exists in the config.
  // If it doesn't exist, we should use the basePath in config or the current directory instead.
  // NOTE: mapToriPaths defaults to creating 'base' path, but it's not guaranteed since tori config might not exist
  const realPath = typeSetInConfig
    ? toriPaths[componentType]
    : path.join(toriPaths.base || __dirname, actualComponentPath);

  const targetPath = normalizedPath(realPath);

  if (!directoryExists(targetPath)) {
    createDirectory(targetPath);
  }

  copyFilesToTarget(targetPath, componentName);
  replaceContentWithComponentName(targetPath, componentName);

  console.log(`Generated '${componentName}' component in '${targetPath}'`);
};

function mapToriPaths(toriConfig, componentName) {
  if (!toriConfig) return {};

  const base = normalizedPath(path.resolve(__dirname, toriConfig.basePath || ''));

  const paths = Object.keys(toriConfig).reduce((object, key) => {
    if (key === 'basePath') return object;

    const baseDir = toriConfig.basePath ? base : __dirname;
    const pathForKey = path.resolve(baseDir, toriConfig[key]);

    return {
      ...object,
      [key]: normalizedPath(path.join(pathForKey, componentName)),
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
