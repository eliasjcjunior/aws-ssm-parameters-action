const core = require('@actions/core');
const github = require('@actions/github');
const command = require('@actions/core/lib/command');
const { SSM, config } = require('aws-sdk');

const parsePathsInput = paths => {
  try {
    return paths.split('\n')
    .map(line => line.trim())
    .filter(line => line !== '');
  } catch(error) {
   throw new Error('Paths parameter cannot be parsed');
  }
}

const configureInputs = () => {
  const inputPaths = core.getInput('paths');
  const inputRecursive = core.getInput('recursive');
  const inputRegion = core.getInput('region');
  const inputOutputType = core.getInput('output-type');
  const inputWithDecryption = core.getInput('with-decryption');
  config.region = inputRegion;
  return {
    paths: parsePathsInput(inputPaths),
    recursive: inputRecursive === 'true' ? true : false,
    withDecryption: inputWithDecryption === 'true' ? true : false,
    outputType: inputOutputType
  }
}

const formatParameterName = (name, splitEnv = true, upperCase = false, envPrefix = null) => {
  let formatedName = name;
  if (splitEnv) {
    const splited = name.split('/');
    formatedName = splited[splited.length-1];
  }
  if (upperCase) {
    formatedName = formatedName.toUpperCase();
  }
  if (envPrefix) {
    formatedName = `${envPrefix}${formatedName}`;
  }
  return formatedName;
}

const getParameter = async (path, recursive = false, withDecryption = false) => {
  const ssm = new SSM();
  const { Parameters } = await ssm.getParametersByPath({ Path: path, Recursive: recursive, WithDecryption: withDecryption }).promise();
  const parameters = {};
  Parameters.forEach(parameter => {
    const name = formatParameterName(parameter.Name);
    const value = parameter.Value.trim();

    if (parameter.Type === 'SecureString') {
       core.setSecret(value);
    }
    parameters[name] = value;
  });
  return parameters;
}

const reducer = (oldValue, newValue) => Object.assign(oldValue, newValue);

const saveToEnv = (parameters) => {
  Object.keys(parameters).forEach(key => {
    core.exportVariable(key, `${parameters[key]}`);
  });
}

const saveOutput = (parameters, outputType) => {
  switch (outputType) {
    default:
      saveToEnv(parameters)
  }
}

const run = async () => {
  try {
    const { paths, recursive, withDecryption, outputType } = configureInputs();
    const parameters = await Promise.all(paths.map(path => getParameter(path, recursive, withDecryption)));
    const mergedParameters = parameters.reduce(reducer);
    saveOutput(mergedParameters, outputType);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();