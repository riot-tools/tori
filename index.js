const fs = require('fs');
const path = require('path');
const package = require(path.resolve(__dirname, 'package.json'));
const { tori } = package;

exports.generate = async function generate(cmds) {
  try {
    const [componentType, componentPath] = cmds.slice(2);

    // If we don't pass in a component type, the first param is the actual path
    const typeSetInConfig = tori && tori.hasOwnProperty(componentType);
    const actualComponentPath = typeSetInConfig
      ? safePath(componentPath)
      : safePath(componentType);

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
  } catch (err) {
    console.error(err);
    return err;
  }
};

function mapToriPaths(toriConfig, componentName) {
  if (!toriConfig) return {};

  try {
    const base = normalizedPath(
      path.resolve(__dirname, safePath(toriConfig.basePath) || '')
    );

    const paths = Object.keys(toriConfig).reduce((object, key) => {
      if (key === 'basePath') return object;

      const baseDir = toriConfig.basePath ? base : __dirname;
      const pathForKey = path.resolve(baseDir, safePath(toriConfig[key]));

      return {
        ...object,
        [key]: normalizedPath(path.join(pathForKey, componentName)),
      };
    }, {});

    return {
      base,
      ...paths,
    };
  } catch (err) {
    console.error(err);
    return err;
  }
}

function normalizedPath(targetPath) {
  return path.normalize(path.resolve(__dirname, safePath(targetPath)));
}

function directoryExists(targetPath) {
  return fs.existsSync(safePath(targetPath));
}

function createDirectory(targetPath) {
  try {
    return fs.mkdirSync(safePath(targetPath), { recursive: true });
  } catch (err) {
    console.error(err);
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
        path.join(safePath(targetPath), templateNameToComponentName)
      );
    });
  } catch (err) {
    console.error(err);
    return err;
  }
}

function replaceContentWithComponentName(targetPath, componentName) {
  const safeTargetPath = safePath(targetPath);

  try {
    fs.readdirSync(safeTargetPath).forEach(function replaceFileContent(file) {
      const content = fs.readFileSync(path.join(safeTargetPath, file), {
        encoding: 'utf8',
      });

      const componentNameInPascalCase = toPascalCase(componentName);

      const replacedContent = content
        .replace(/ComponentName/g, componentNameInPascalCase)
        .replace(/[c|C]omponent/g, componentName);

      fs.writeFileSync(path.join(safeTargetPath, file), replacedContent);
    });
  } catch (err) {
    console.error(err);
    return err;
  }
}

function toPascalCase(text) {
  return text.replace(/(^\w|-\w)/g, clearAndUpper);
}

function clearAndUpper(text) {
  return text.replace(/-/, '').toUpperCase();
}

/**
 * Replaces possible /../.. values in paths to avoid working outside the current work dir
 *
 * @param {string} possiblyUnsafePath
 */
function safePath(possiblyUnsafePath) {
  if (!possiblyUnsafePath) return '';
  return possiblyUnsafePath.replace('..', '');
}
